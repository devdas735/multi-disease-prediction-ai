import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Plus, Printer, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface PredictionData {
  patientName: string;
  patientId: string | null;
  inputs: Record<string, number | string | boolean>;
  predictions: {
    disease: string;
    risk: number;
    confidence: number;
    riskLevel: string;
  }[];
  timestamp: number;
}

function RiskBadge({ level }: { level: string }) {
  if (level === "Low")
    return (
      <span className="risk-low px-2.5 py-1 rounded-full text-xs font-semibold">
        {level} Risk
      </span>
    );
  if (level === "Medium")
    return (
      <span className="risk-medium px-2.5 py-1 rounded-full text-xs font-semibold">
        {level} Risk
      </span>
    );
  return (
    <span className="risk-high px-2.5 py-1 rounded-full text-xs font-semibold">
      {level} Risk
    </span>
  );
}

function RiskProgressBar({ value, level }: { value: number; level: string }) {
  const color =
    level === "Low"
      ? "oklch(0.62 0.17 145)"
      : level === "Medium"
        ? "oklch(0.72 0.18 75)"
        : "oklch(0.58 0.22 25)";
  return (
    <div
      className="h-2.5 rounded-full overflow-hidden"
      style={{ background: "oklch(0.94 0.012 240)" }}
    >
      <motion.div
        className="h-2.5 rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState<PredictionData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lastPredictionResult");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(null);
      }
    }
  }, []);

  if (!data) {
    return (
      <div
        className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4"
        data-ocid="results.empty_state"
      >
        <AlertCircle
          className="w-12 h-12"
          style={{ color: "oklch(0.7 0.02 240)" }}
        />
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "oklch(0.18 0.04 240)" }}
        >
          No Results Available
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.52 0.02 240)" }}>
          Run a prediction to see results here.
        </p>
        <Button
          data-ocid="results.primary_button"
          onClick={() => navigate({ to: "/predict" })}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Start Prediction
        </Button>
      </div>
    );
  }

  const highestRisk = data.predictions.reduce((a, b) =>
    a.risk > b.risk ? a : b,
  );

  return (
    <div className="p-6 lg:p-8 animate-fade-in print:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:mb-4">
          <div>
            <h1
              className="font-display text-2xl font-bold"
              style={{ color: "oklch(0.18 0.04 240)" }}
            >
              Prediction Report
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "oklch(0.52 0.02 240)" }}
            >
              Generated {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              data-ocid="results.secondary_button"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" /> Print Report
            </Button>
            <Button
              data-ocid="results.primary_button"
              onClick={() => navigate({ to: "/predict" })}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> New Prediction
            </Button>
          </div>
        </div>

        {/* Patient Info */}
        <Card className="shadow-card mb-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.96 0.03 220)" }}
              >
                <User
                  className="w-6 h-6"
                  style={{ color: "oklch(0.6 0.18 220)" }}
                />
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.52 0.02 240)" }}
                  >
                    Patient Name
                  </p>
                  <p className="font-semibold text-sm">{data.patientName}</p>
                </div>
                <div>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.52 0.02 240)" }}
                  >
                    Age
                  </p>
                  <p className="font-semibold text-sm">
                    {data.inputs.age as number}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.52 0.02 240)" }}
                  >
                    Gender
                  </p>
                  <p className="font-semibold text-sm">
                    {data.inputs.gender as string}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.52 0.02 240)" }}
                  >
                    BMI
                  </p>
                  <p className="font-semibold text-sm">
                    {(data.inputs.bmi as number).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Summary */}
        <Card
          className="shadow-card mb-5"
          style={{
            background:
              highestRisk.riskLevel === "High"
                ? "oklch(0.97 0.02 25)"
                : highestRisk.riskLevel === "Medium"
                  ? "oklch(0.98 0.02 75)"
                  : "oklch(0.97 0.02 145)",
            border: `1px solid ${highestRisk.riskLevel === "High" ? "oklch(0.85 0.08 25)" : highestRisk.riskLevel === "Medium" ? "oklch(0.88 0.08 75)" : "oklch(0.85 0.08 145)"}`,
          }}
        >
          <CardContent className="p-5">
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "oklch(0.52 0.02 240)" }}
            >
              HIGHEST RISK CONDITION
            </p>
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-display text-xl font-bold"
                  style={{ color: "oklch(0.18 0.04 240)" }}
                >
                  {highestRisk.disease}
                </h3>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "oklch(0.52 0.02 240)" }}
                >
                  Confidence: {highestRisk.confidence.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p
                  className="font-display text-3xl font-bold"
                  style={{
                    color:
                      highestRisk.riskLevel === "High"
                        ? "oklch(0.5 0.22 25)"
                        : highestRisk.riskLevel === "Medium"
                          ? "oklch(0.55 0.18 75)"
                          : "oklch(0.42 0.14 145)",
                  }}
                >
                  {highestRisk.risk.toFixed(0)}%
                </p>
                <RiskBadge level={highestRisk.riskLevel} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Diseases */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Disease Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.predictions.map((pred, i) => (
              <motion.div
                key={pred.disease}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                data-ocid={`results.item.${i + 1}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-medium text-sm"
                    style={{ color: "oklch(0.18 0.04 240)" }}
                  >
                    {pred.disease}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.25 0.03 240)" }}
                    >
                      {pred.risk.toFixed(0)}%
                    </span>
                    <RiskBadge level={pred.riskLevel} />
                  </div>
                </div>
                <RiskProgressBar value={pred.risk} level={pred.riskLevel} />
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.62 0.02 240)" }}
                >
                  Confidence: {pred.confidence.toFixed(1)}%
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p
          className="text-xs mt-5 text-center"
          style={{ color: "oklch(0.62 0.02 240)" }}
        >
          ⚕️ This AI prediction is for informational purposes only and does not
          constitute medical advice. Consult a qualified healthcare professional
          for clinical diagnosis.
        </p>
      </div>
    </div>
  );
}
