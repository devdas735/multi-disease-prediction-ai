import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAllPredictions } from "../hooks/useQueries";

const MODEL_ACCURACY = [
  { model: "XGBoost", accuracy: 94.8 },
  { model: "Random Forest", accuracy: 92.1 },
  { model: "SVM", accuracy: 89.5 },
  { model: "Logistic Reg.", accuracy: 87.3 },
];

const FEATURE_IMPORTANCE = [
  { feature: "Glucose Level", importance: 0.89 },
  { feature: "Blood Pressure", importance: 0.82 },
  { feature: "Cholesterol", importance: 0.78 },
  { feature: "BMI", importance: 0.75 },
  { feature: "Age", importance: 0.71 },
  { feature: "Heart Rate", importance: 0.65 },
  { feature: "Smoking", importance: 0.61 },
  { feature: "Oxygen Level", importance: 0.58 },
  { feature: "Chest Pain", importance: 0.54 },
  { feature: "Alcohol", importance: 0.48 },
];

const ROC_DATA = Array.from({ length: 11 }, (_, i) => {
  const fpr = i / 10;
  return {
    fpr,
    xgboost: Math.min(1, fpr + 0.92 * (1 - fpr) * (1 - (fpr - 0.05) ** 2)),
    rf: Math.min(1, fpr + 0.88 * (1 - fpr) * (1 - (fpr - 0.08) ** 2)),
    lr: Math.min(1, fpr + 0.8 * (1 - fpr) * (1 - (fpr - 0.12) ** 2)),
    diagonal: fpr,
  };
});

const CONFUSION = [
  { label: "True Positive", value: 142, color: "oklch(0.62 0.17 145)" },
  { label: "False Positive", value: 18, color: "oklch(0.72 0.18 75)" },
  { label: "False Negative", value: 22, color: "oklch(0.72 0.18 75)" },
  { label: "True Negative", value: 318, color: "oklch(0.62 0.17 145)" },
];

const CHART_COLORS = [
  "oklch(0.6 0.18 220)",
  "oklch(0.56 0.12 185)",
  "oklch(0.62 0.17 145)",
  "oklch(0.65 0.18 270)",
  "oklch(0.72 0.18 75)",
  "oklch(0.58 0.22 25)",
  "oklch(0.7 0.15 300)",
];

const RISK_COLORS: Record<string, string> = {
  Low: "oklch(0.62 0.17 145)",
  Medium: "oklch(0.72 0.18 75)",
  High: "oklch(0.58 0.22 25)",
};

export default function Analytics() {
  const { data: predictions, isLoading } = useAllPredictions();

  const diseaseAvgRisk = useMemo(() => {
    if (!predictions?.length) return [];
    const map: Record<string, { total: number; count: number }> = {};
    for (const p of predictions) {
      if (!map[p.disease]) map[p.disease] = { total: 0, count: 0 };
      map[p.disease].total += p.risk_percentage;
      map[p.disease].count += 1;
    }
    return Object.entries(map).map(([disease, { total, count }]) => ({
      disease: disease.replace(" Disease", ""),
      avgRisk: Number.parseFloat((total / count).toFixed(1)),
    }));
  }, [predictions]);

  const riskDistribution = useMemo(() => {
    if (!predictions?.length) return [];
    const map: Record<string, number> = {};
    for (const p of predictions) {
      map[p.risk_level] = (map[p.risk_level] ?? 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [predictions]);

  const ChartCard = ({
    title,
    children,
  }: { title: string; children: React.ReactNode }) => (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "oklch(0.18 0.04 240)" }}
        >
          Analytics Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "oklch(0.52 0.02 240)" }}>
          Model performance metrics and patient risk insights
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Disease Risk Distribution (Avg %)">
          {isLoading ? (
            <Skeleton
              className="h-56 w-full"
              data-ocid="analytics.loading_state"
            />
          ) : diseaseAvgRisk.length === 0 ? (
            <div
              className="h-56 flex items-center justify-center"
              data-ocid="analytics.empty_state"
            >
              <p className="text-sm" style={{ color: "oklch(0.52 0.02 240)" }}>
                No prediction data available
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={diseaseAvgRisk} margin={{ left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.9 0.01 240)"
                />
                <XAxis dataKey="disease" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Avg Risk"]} />
                <Bar dataKey="avgRisk" radius={[4, 4, 0, 0]}>
                  {diseaseAvgRisk.map((entry) => (
                    <Cell
                      key={entry.disease}
                      fill={
                        CHART_COLORS[
                          diseaseAvgRisk.indexOf(entry) % CHART_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Model Accuracy Comparison">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MODEL_ACCURACY} margin={{ left: -20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.9 0.01 240)"
              />
              <XAxis dataKey="model" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Accuracy"]} />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {MODEL_ACCURACY.map((entry) => (
                  <Cell
                    key={entry.model}
                    fill={
                      CHART_COLORS[
                        MODEL_ACCURACY.indexOf(entry) % CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Feature Importance (Top 10)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={FEATURE_IMPORTANCE}
              layout="vertical"
              margin={{ left: 10, right: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.9 0.01 240)"
                horizontal={false}
              />
              <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fontSize: 11 }}
                width={90}
              />
              <Tooltip
                formatter={(v: number) => [v.toFixed(2), "Importance"]}
              />
              <Bar
                dataKey="importance"
                radius={[0, 4, 4, 0]}
                fill="oklch(0.6 0.18 220)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ROC Curve (Model Comparison)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ROC_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.9 0.01 240)"
              />
              <XAxis
                dataKey="fpr"
                tick={{ fontSize: 10 }}
                label={{
                  value: "FPR",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "TPR",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip formatter={(v: number) => v.toFixed(3)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="xgboost"
                stroke="oklch(0.6 0.18 220)"
                strokeWidth={2}
                dot={false}
                name="XGBoost"
              />
              <Line
                type="monotone"
                dataKey="rf"
                stroke="oklch(0.56 0.12 185)"
                strokeWidth={2}
                dot={false}
                name="Random Forest"
              />
              <Line
                type="monotone"
                dataKey="lr"
                stroke="oklch(0.62 0.17 145)"
                strokeWidth={2}
                dot={false}
                name="Log. Reg."
              />
              <Line
                type="monotone"
                dataKey="diagonal"
                stroke="oklch(0.7 0.02 240)"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                name="Baseline"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient Risk Distribution">
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : riskDistribution.length === 0 ? (
            <div className="h-56 flex items-center justify-center">
              <p className="text-sm" style={{ color: "oklch(0.52 0.02 240)" }}>
                No data
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {riskDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        RISK_COLORS[entry.name] ??
                        CHART_COLORS[riskDistribution.indexOf(entry)]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Confusion Matrix (Aggregated)">
          <div className="grid grid-cols-2 gap-3 mt-2">
            {CONFUSION.map((cell) => (
              <div
                key={cell.label}
                className="rounded-xl p-4 text-center"
                style={{ background: `${cell.color.replace(")", " / 0.12)")}` }}
              >
                <p
                  className="text-2xl font-display font-bold"
                  style={{ color: cell.color }}
                >
                  {cell.value}
                </p>
                <p
                  className="text-xs mt-1 font-medium"
                  style={{ color: "oklch(0.35 0.02 240)" }}
                >
                  {cell.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <span
                className="font-semibold"
                style={{ color: "oklch(0.62 0.17 145)" }}
              >
                Precision:{" "}
              </span>
              <span style={{ color: "oklch(0.35 0.02 240)" }}>
                {((142 / (142 + 18)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-center">
              <span
                className="font-semibold"
                style={{ color: "oklch(0.62 0.17 145)" }}
              >
                Recall:{" "}
              </span>
              <span style={{ color: "oklch(0.35 0.02 240)" }}>
                {((142 / (142 + 22)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
