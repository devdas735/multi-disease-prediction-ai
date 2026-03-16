import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  useAllPatients,
  useAllPredictions,
  useDeletePatient,
  useRecentPredictions,
} from "../hooks/useQueries";

function RiskBadge({ level }: { level: string }) {
  if (level === "Low")
    return (
      <span className="risk-low px-2 py-0.5 rounded-full text-xs font-semibold">
        {level}
      </span>
    );
  if (level === "Medium")
    return (
      <span className="risk-medium px-2 py-0.5 rounded-full text-xs font-semibold">
        {level}
      </span>
    );
  return (
    <span className="risk-high px-2 py-0.5 rounded-full text-xs font-semibold">
      {level}
    </span>
  );
}

const SKELETON_ROWS = ["a", "b", "c", "d"];
const SKELETON_ROWS_SM = ["a", "b", "c"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: patients, isLoading: patientsLoading } = useAllPatients();
  const { data: allPredictions } = useAllPredictions();
  const { data: recentPredictions, isLoading: recentLoading } =
    useRecentPredictions(10);
  const deleteMutation = useDeletePatient();

  const totalPatients = patients?.length ?? 0;
  const totalPredictions = allPredictions?.length ?? 0;
  const highRisk =
    allPredictions?.filter((p) => p.risk_level === "High").length ?? 0;
  const avgRisk = allPredictions?.length
    ? (
        allPredictions.reduce((s, p) => s + p.risk_percentage, 0) /
        allPredictions.length
      ).toFixed(1)
    : "0.0";

  const stats = [
    {
      label: "Total Patients",
      value: totalPatients,
      icon: Users,
      color: "oklch(0.6 0.18 220)",
    },
    {
      label: "Total Predictions",
      value: totalPredictions,
      icon: Activity,
      color: "oklch(0.56 0.12 185)",
    },
    {
      label: "High Risk Cases",
      value: highRisk,
      icon: AlertTriangle,
      color: "oklch(0.58 0.22 25)",
    },
    {
      label: "Avg Risk Score",
      value: `${avgRisk}%`,
      icon: TrendingUp,
      color: "oklch(0.62 0.17 145)",
    },
  ];

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Patient "${name}" removed`);
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "oklch(0.18 0.04 240)" }}
          >
            Patient Dashboard
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.52 0.02 240)" }}
          >
            Overview of all patient records and predictions
          </p>
        </div>
        <Button
          data-ocid="dashboard.primary_button"
          onClick={() => navigate({ to: "/predict" })}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> New Prediction
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${stat.color.replace(")", " / 0.1)")}`,
                    }}
                  >
                    <stat.icon
                      className="w-4 h-4"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-xl font-display font-bold"
                      style={{ color: "oklch(0.18 0.04 240)" }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.52 0.02 240)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Recent Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentLoading ? (
            <div className="p-4 space-y-3" data-ocid="dashboard.loading_state">
              {SKELETON_ROWS.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : !recentPredictions?.length ? (
            <div
              className="py-12 text-center"
              data-ocid="dashboard.empty_state"
            >
              <Activity
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "oklch(0.7 0.02 240)" }}
              />
              <p className="text-sm" style={{ color: "oklch(0.52 0.02 240)" }}>
                No predictions yet. Run your first prediction.
              </p>
            </div>
          ) : (
            <Table data-ocid="dashboard.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Disease</TableHead>
                  <TableHead>Risk %</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPredictions.map((pred, i) => (
                  <TableRow
                    key={pred.id.toString()}
                    data-ocid={`dashboard.row.${i + 1}`}
                  >
                    <TableCell className="font-medium text-sm">
                      {pred.disease}
                    </TableCell>
                    <TableCell className="text-sm">
                      {pred.risk_percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={pred.risk_level} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {pred.confidence.toFixed(1)}%
                    </TableCell>
                    <TableCell
                      className="text-xs"
                      style={{ color: "oklch(0.52 0.02 240)" }}
                    >
                      {new Date(
                        Number(pred.timestamp) / 1_000_000,
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Patient Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {patientsLoading ? (
            <div className="p-4 space-y-3" data-ocid="dashboard.loading_state">
              {SKELETON_ROWS_SM.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : !patients?.length ? (
            <div
              className="py-12 text-center"
              data-ocid="dashboard.empty_state"
            >
              <Users
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "oklch(0.7 0.02 240)" }}
              />
              <p className="text-sm" style={{ color: "oklch(0.52 0.02 240)" }}>
                No patients yet.
              </p>
            </div>
          ) : (
            <Table data-ocid="patients.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>BMI</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p, i) => (
                  <TableRow
                    key={p.id.toString()}
                    data-ocid={`patients.row.${i + 1}`}
                  >
                    <TableCell className="font-medium text-sm">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-sm">{Number(p.age)}</TableCell>
                    <TableCell className="text-sm">{p.gender}</TableCell>
                    <TableCell className="text-sm">
                      {p.bmi.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.blood_pressure}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`patients.delete_button.${i + 1}`}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
