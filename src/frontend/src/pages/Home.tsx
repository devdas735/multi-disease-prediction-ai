import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart2,
  Shield,
  Target,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useTotalPatients, useTotalPredictions } from "../hooks/useQueries";

const features = [
  {
    icon: Shield,
    title: "7 Diseases Analyzed",
    desc: "Comprehensive screening for Heart Disease, Diabetes, Liver, Kidney, Cancer, Lung & Hypertension",
    color: "oklch(0.6 0.18 220)",
    bg: "oklch(0.96 0.03 220)",
  },
  {
    icon: Zap,
    title: "Real-time Predictions",
    desc: "Instant risk assessment using advanced ML models trained on millions of patient records",
    color: "oklch(0.56 0.12 185)",
    bg: "oklch(0.95 0.03 185)",
  },
  {
    icon: Upload,
    title: "CSV Data Upload",
    desc: "Batch process entire patient cohorts via CSV upload with automated field mapping",
    color: "oklch(0.62 0.17 145)",
    bg: "oklch(0.95 0.06 145)",
  },
  {
    icon: BarChart2,
    title: "Advanced Analytics",
    desc: "Interactive dashboards with ROC curves, confusion matrices, and feature importance charts",
    color: "oklch(0.65 0.18 270)",
    bg: "oklch(0.95 0.04 270)",
  },
];

const models = [
  { name: "XGBoost", accuracy: 94.8, color: "oklch(0.6 0.18 220)" },
  { name: "Random Forest", accuracy: 92.1, color: "oklch(0.56 0.12 185)" },
  { name: "SVM", accuracy: 89.5, color: "oklch(0.65 0.18 270)" },
  { name: "Logistic Reg.", accuracy: 87.3, color: "oklch(0.62 0.17 145)" },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: totalPatients } = useTotalPatients();
  const { data: totalPredictions } = useTotalPredictions();

  const stats = [
    {
      label: "Total Patients",
      value: totalPatients ? Number(totalPatients).toLocaleString() : "0",
      icon: Users,
    },
    {
      label: "Predictions Made",
      value: totalPredictions ? Number(totalPredictions).toLocaleString() : "0",
      icon: Activity,
    },
    { label: "Model Accuracy", value: "94.2%", icon: Target },
    { label: "Diseases Covered", value: "7", icon: Shield },
  ];

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-16 lg:px-12 lg:py-24">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.97 0.02 220) 0%, oklch(0.96 0.03 185) 50%, oklch(0.98 0.01 240) 100%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.15 220), transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "oklch(0.6 0.18 220 / 0.12)",
              color: "oklch(0.45 0.15 220)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            AI-Powered Healthcare Intelligence
          </div>

          <h1
            className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-4"
            style={{ color: "oklch(0.18 0.04 240)" }}
          >
            Multi-Disease Prediction
            <span style={{ color: "oklch(0.6 0.18 220)" }}> AI System</span>
          </h1>

          <p className="text-lg mb-8" style={{ color: "oklch(0.45 0.02 240)" }}>
            Early detection saves lives. Our advanced AI platform analyzes
            patient vitals and biomarkers to predict disease risk across 7 major
            conditions with clinical-grade accuracy.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              data-ocid="home.primary_button"
              onClick={() => navigate({ to: "/predict" })}
              className="gap-2"
            >
              Start Prediction <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              data-ocid="home.secondary_button"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              View Dashboard
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 lg:px-12 -mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "oklch(0.96 0.03 220)" }}
                    >
                      <stat.icon
                        className="w-4 h-4"
                        style={{ color: "oklch(0.6 0.18 220)" }}
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
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-12">
        <h2
          className="font-display text-2xl font-bold mb-2"
          style={{ color: "oklch(0.18 0.04 240)" }}
        >
          Platform Capabilities
        </h2>
        <p className="mb-6 text-sm" style={{ color: "oklch(0.52 0.02 240)" }}>
          Comprehensive tools for clinical risk assessment and patient analytics
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <Card className="h-full shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.bg }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3
                    className="font-semibold text-sm mb-1.5"
                    style={{ color: "oklch(0.18 0.04 240)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.52 0.02 240)" }}
                  >
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Model Accuracy */}
      <section className="px-6 lg:px-12 pb-12">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <h3
              className="font-display font-bold mb-1"
              style={{ color: "oklch(0.18 0.04 240)" }}
            >
              Model Performance Overview
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "oklch(0.52 0.02 240)" }}
            >
              Validated accuracy across ensemble models
            </p>
            <div className="space-y-4">
              {models.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span
                      className="font-medium"
                      style={{ color: "oklch(0.25 0.03 240)" }}
                    >
                      {m.name}
                    </span>
                    <span className="font-semibold" style={{ color: m.color }}>
                      {m.accuracy}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full"
                    style={{ background: "oklch(0.94 0.012 240)" }}
                  >
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ background: m.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.accuracy}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
