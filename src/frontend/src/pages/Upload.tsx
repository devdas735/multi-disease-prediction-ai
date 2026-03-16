import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload as UploadIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { runAllPredictions } from "../utils/predictions";

const EXPECTED_FIELDS = [
  "name",
  "age",
  "gender",
  "blood_pressure",
  "cholesterol",
  "glucose_level",
  "bmi",
  "heart_rate",
  "smoking_status",
  "alcohol_consumption",
  "family_medical_history",
  "chest_pain",
  "fatigue",
  "oxygen_level",
];

type ParsedRow = Record<string, string>;

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/ /g, "_"));
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  return { headers, rows };
}

export default function Upload() {
  const { actor } = useActor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    setFileName(file.name);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      setHeaders(h);
      setRows(r);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleProcess = async () => {
    if (!rows.length) return;
    setProcessing(true);
    setProgress(0);
    let processed = 0;
    for (const row of rows) {
      try {
        const inputs = {
          age: Number(row.age) || 30,
          gender: row.gender || "Male",
          blood_pressure: Number(row.blood_pressure) || 120,
          cholesterol: Number(row.cholesterol) || 200,
          glucose_level: Number(row.glucose_level) || 100,
          bmi: Number(row.bmi) || 25,
          heart_rate: Number(row.heart_rate) || 70,
          smoking_status: row.smoking_status || "Never",
          alcohol_consumption: row.alcohol_consumption || "None",
          family_medical_history: row.family_medical_history || "None",
          chest_pain: row.chest_pain === "true" || row.chest_pain === "1",
          fatigue: row.fatigue === "true" || row.fatigue === "1",
          oxygen_level: Number(row.oxygen_level) || 98,
        };
        let patientId: bigint | null = null;
        if (actor) {
          patientId = await actor.create_patient_record(
            row.name || "Unknown",
            BigInt(Math.round(inputs.age)),
            inputs.gender,
            inputs.blood_pressure,
            inputs.cholesterol,
            inputs.glucose_level,
            inputs.bmi,
            inputs.heart_rate,
            inputs.smoking_status,
            inputs.alcohol_consumption,
            inputs.family_medical_history,
            inputs.chest_pain,
            inputs.fatigue,
            inputs.oxygen_level,
          );
        }
        const predictions = runAllPredictions(inputs);
        if (actor && patientId !== null) {
          await Promise.all(
            predictions.map((p) =>
              actor.save_prediction_result(
                patientId!,
                p.disease,
                p.risk,
                p.confidence,
                p.riskLevel,
              ),
            ),
          );
        }
      } catch (err) {
        console.error("Row error:", err);
      }
      processed++;
      setProgress(Math.round((processed / rows.length) * 100));
    }
    setProcessing(false);
    setDone(true);
    toast.success(`Processed ${rows.length} patient records`);
  };

  const missingFields = EXPECTED_FIELDS.filter((f) => !headers.includes(f));

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "oklch(0.18 0.04 240)" }}
          >
            CSV Data Upload
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.52 0.02 240)" }}
          >
            Batch process patient records from a CSV file
          </p>
        </div>

        <Card className="shadow-card mb-5">
          <CardContent className="p-6">
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: file dropzone */}
            <div
              data-ocid="upload.dropzone"
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                data-ocid="upload.upload_button"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
              <UploadIcon
                className="w-10 h-10 mx-auto mb-3"
                style={{ color: "oklch(0.6 0.18 220 / 0.6)" }}
              />
              <p
                className="font-semibold text-sm"
                style={{ color: "oklch(0.25 0.03 240)" }}
              >
                {fileName || "Drop your CSV file here"}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.52 0.02 240)" }}
              >
                or click to browse
              </p>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {headers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText
                      className="w-4 h-4"
                      style={{ color: "oklch(0.6 0.18 220)" }}
                    />
                    Field Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {EXPECTED_FIELDS.map((field) => {
                      const found = headers.includes(field);
                      return (
                        <div
                          key={field}
                          className="flex items-center gap-2 text-xs"
                        >
                          {found ? (
                            <CheckCircle2
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: "oklch(0.62 0.17 145)" }}
                            />
                          ) : (
                            <AlertCircle
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: "oklch(0.72 0.18 75)" }}
                            />
                          )}
                          <span
                            style={{
                              color: found
                                ? "oklch(0.25 0.03 240)"
                                : "oklch(0.52 0.02 240)",
                            }}
                          >
                            {field}
                          </span>
                          {!found && (
                            <span
                              className="ml-auto"
                              style={{ color: "oklch(0.72 0.18 75)" }}
                            >
                              missing
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {missingFields.length > 0 && (
                    <p
                      className="text-xs mt-3 flex items-center gap-1"
                      style={{ color: "oklch(0.58 0.22 25)" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {missingFields.length} field(s) missing — defaults will be
                      used
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Data Preview (first 5 rows)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.slice(0, 6).map((h) => (
                          <TableHead key={h} className="text-xs">
                            {h}
                          </TableHead>
                        ))}
                        {headers.length > 6 && (
                          <TableHead className="text-xs">
                            +{headers.length - 6} more
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.slice(0, 5).map((row, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: preview table
                        <TableRow key={i} data-ocid={`upload.row.${i + 1}`}>
                          {headers.slice(0, 6).map((h) => (
                            <TableCell key={h} className="text-xs">
                              {row[h]}
                            </TableCell>
                          ))}
                          {headers.length > 6 && (
                            <TableCell className="text-xs">…</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {processing && (
                <Card className="shadow-card" data-ocid="upload.loading_state">
                  <CardContent className="p-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Processing {rows.length} patients...</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              )}

              {done && (
                <div
                  className="flex items-center gap-2 p-4 rounded-lg text-sm font-medium"
                  style={{
                    background: "oklch(0.95 0.06 145)",
                    color: "oklch(0.32 0.12 145)",
                  }}
                  data-ocid="upload.success_state"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Successfully processed {rows.length} patient records!
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  data-ocid="upload.cancel_button"
                  onClick={() => {
                    setFileName("");
                    setHeaders([]);
                    setRows([]);
                    setDone(false);
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
                <Button
                  data-ocid="upload.submit_button"
                  onClick={handleProcess}
                  disabled={processing || done}
                  className="gap-2"
                >
                  {processing
                    ? "Processing..."
                    : `Process ${rows.length} Patients`}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
