import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { Activity, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { runAllPredictions } from "../utils/predictions";

interface FormData {
  name: string;
  age: string;
  gender: string;
  blood_pressure: string;
  cholesterol: string;
  glucose_level: string;
  bmi: string;
  heart_rate: string;
  smoking_status: string;
  alcohol_consumption: string;
  family_medical_history: string;
  chest_pain: boolean;
  fatigue: boolean;
  oxygen_level: string;
}

const defaultForm: FormData = {
  name: "",
  age: "",
  gender: "Male",
  blood_pressure: "",
  cholesterol: "",
  glucose_level: "",
  bmi: "",
  heart_rate: "",
  smoking_status: "Never",
  alcohol_consumption: "None",
  family_medical_history: "None",
  chest_pain: false,
  fatigue: false,
  oxygen_level: "",
};

export default function Predict() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 120)
      newErrors.age = "Age must be 1–120";
    if (
      !form.blood_pressure ||
      Number(form.blood_pressure) < 60 ||
      Number(form.blood_pressure) > 200
    )
      newErrors.blood_pressure = "BP must be 60–200";
    if (
      !form.cholesterol ||
      Number(form.cholesterol) < 100 ||
      Number(form.cholesterol) > 400
    )
      newErrors.cholesterol = "Cholesterol must be 100–400";
    if (
      !form.glucose_level ||
      Number(form.glucose_level) < 50 ||
      Number(form.glucose_level) > 400
    )
      newErrors.glucose_level = "Glucose must be 50–400";
    if (!form.bmi || Number(form.bmi) < 10 || Number(form.bmi) > 60)
      newErrors.bmi = "BMI must be 10–60";
    if (
      !form.heart_rate ||
      Number(form.heart_rate) < 40 ||
      Number(form.heart_rate) > 200
    )
      newErrors.heart_rate = "Heart rate must be 40–200";
    if (
      !form.oxygen_level ||
      Number(form.oxygen_level) < 80 ||
      Number(form.oxygen_level) > 100
    )
      newErrors.oxygen_level = "Oxygen level must be 80–100";
    return newErrors;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix form errors");
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const inputs = {
        age: Number(form.age),
        gender: form.gender,
        blood_pressure: Number(form.blood_pressure),
        cholesterol: Number(form.cholesterol),
        glucose_level: Number(form.glucose_level),
        bmi: Number(form.bmi),
        heart_rate: Number(form.heart_rate),
        smoking_status: form.smoking_status,
        alcohol_consumption: form.alcohol_consumption,
        family_medical_history: form.family_medical_history,
        chest_pain: form.chest_pain,
        fatigue: form.fatigue,
        oxygen_level: Number(form.oxygen_level),
      };

      let patientId: bigint | null = null;
      if (actor) {
        patientId = await actor.create_patient_record(
          form.name,
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

      const resultData = {
        patientName: form.name,
        patientId: patientId?.toString() ?? null,
        inputs,
        predictions,
        timestamp: Date.now(),
      };
      localStorage.setItem("lastPredictionResult", JSON.stringify(resultData));

      toast.success("Prediction complete!");
      navigate({ to: "/results" });
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "oklch(0.18 0.04 240)" }}
          >
            Disease Prediction
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.52 0.02 240)" }}
          >
            Enter patient data to generate multi-disease risk assessment
          </p>
        </div>

        <div className="space-y-5">
          {/* Patient Info */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity
                  className="w-4 h-4"
                  style={{ color: "oklch(0.6 0.18 220)" }}
                />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-xs font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  data-ocid="predict.name.input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  className="mt-1"
                />
                {errors.name && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "oklch(0.58 0.22 25)" }}
                    data-ocid="predict.name.error_state"
                  >
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="age" className="text-xs font-medium">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  data-ocid="predict.age.input"
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  placeholder="1–120"
                  className="mt-1"
                />
                {errors.age && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "oklch(0.58 0.22 25)" }}
                    data-ocid="predict.age.error_state"
                  >
                    {errors.age}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs font-medium">Gender *</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => set("gender", v)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="predict.gender.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Clinical Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  {
                    key: "blood_pressure",
                    label: "Blood Pressure (mmHg)",
                    placeholder: "60–200",
                  },
                  {
                    key: "cholesterol",
                    label: "Cholesterol (mg/dL)",
                    placeholder: "100–400",
                  },
                  {
                    key: "glucose_level",
                    label: "Glucose Level (mg/dL)",
                    placeholder: "50–400",
                  },
                  { key: "bmi", label: "BMI", placeholder: "10–60" },
                  {
                    key: "heart_rate",
                    label: "Heart Rate (bpm)",
                    placeholder: "40–200",
                  },
                  {
                    key: "oxygen_level",
                    label: "Oxygen Level (%)",
                    placeholder: "80–100",
                  },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-xs font-medium">
                    {label} *
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    data-ocid={`predict.${key}.input`}
                    value={form[key] as string}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1"
                  />
                  {errors[key] && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.58 0.22 25)" }}
                      data-ocid={`predict.${key}.error_state`}
                    >
                      {errors[key]}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lifestyle */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Lifestyle & History
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium">Smoking Status</Label>
                <Select
                  value={form.smoking_status}
                  onValueChange={(v) => set("smoking_status", v)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="predict.smoking_status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="Former">Former</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">
                  Alcohol Consumption
                </Label>
                <Select
                  value={form.alcohol_consumption}
                  onValueChange={(v) => set("alcohol_consumption", v)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="predict.alcohol_consumption.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">
                  Family Medical History
                </Label>
                <Select
                  value={form.family_medical_history}
                  onValueChange={(v) => set("family_medical_history", v)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="predict.family_history.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Heart Disease">Heart Disease</SelectItem>
                    <SelectItem value="Diabetes">Diabetes</SelectItem>
                    <SelectItem value="Cancer">Cancer</SelectItem>
                    <SelectItem value="Multiple">Multiple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Symptoms</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8">
              <div className="flex items-center gap-3">
                <Switch
                  id="chest_pain"
                  data-ocid="predict.chest_pain.switch"
                  checked={form.chest_pain}
                  onCheckedChange={(v) => set("chest_pain", v)}
                />
                <Label htmlFor="chest_pain" className="text-sm">
                  Chest Pain
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="fatigue"
                  data-ocid="predict.fatigue.switch"
                  checked={form.fatigue}
                  onCheckedChange={(v) => set("fatigue", v)}
                />
                <Label htmlFor="fatigue" className="text-sm">
                  Fatigue
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setForm(defaultForm)}
              data-ocid="predict.cancel_button"
            >
              Reset
            </Button>
            <Button
              data-ocid="predict.submit_button"
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2 min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    data-ocid="predict.loading_state"
                  />{" "}
                  Running Analysis...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" /> Run Prediction
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
