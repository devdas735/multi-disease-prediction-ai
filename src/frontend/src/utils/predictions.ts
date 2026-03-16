export interface PatientInputs {
  age: number;
  gender: string;
  blood_pressure: number;
  cholesterol: number;
  glucose_level: number;
  bmi: number;
  heart_rate: number;
  smoking_status: string;
  alcohol_consumption: string;
  family_medical_history: string;
  chest_pain: boolean;
  fatigue: boolean;
  oxygen_level: number;
}

export interface DiseaseScore {
  disease: string;
  risk: number;
  confidence: number;
  riskLevel: string;
}

function scoreHeartDisease(p: PatientInputs): {
  risk: number;
  confidence: number;
} {
  let score = 0;
  if (p.age > 50) score += 20;
  else if (p.age > 40) score += 12;
  else if (p.age > 30) score += 5;
  if (p.blood_pressure > 140) score += 20;
  else if (p.blood_pressure > 120) score += 10;
  if (p.cholesterol > 240) score += 18;
  else if (p.cholesterol > 200) score += 9;
  if (p.smoking_status === "Current") score += 15;
  else if (p.smoking_status === "Former") score += 7;
  if (p.chest_pain) score += 15;
  if (
    p.family_medical_history === "Heart Disease" ||
    p.family_medical_history === "Multiple"
  )
    score += 12;
  if (p.heart_rate > 100) score += 5;
  const risk = Math.min(95, Math.max(5, score));
  const confidence = 85 + Math.random() * 10;
  return { risk, confidence };
}

function scoreDiabetes(p: PatientInputs): { risk: number; confidence: number } {
  let score = 0;
  if (p.glucose_level > 200) score += 35;
  else if (p.glucose_level > 140) score += 22;
  else if (p.glucose_level > 100) score += 10;
  if (p.bmi > 35) score += 20;
  else if (p.bmi > 30) score += 14;
  else if (p.bmi > 25) score += 7;
  if (p.age > 45) score += 15;
  else if (p.age > 35) score += 8;
  if (
    p.family_medical_history === "Diabetes" ||
    p.family_medical_history === "Multiple"
  )
    score += 15;
  if (p.fatigue) score += 5;
  const risk = Math.min(95, Math.max(5, score));
  const confidence = 88 + Math.random() * 8;
  return { risk, confidence };
}

function scoreLiverDisease(p: PatientInputs): {
  risk: number;
  confidence: number;
} {
  let score = 0;
  if (p.alcohol_consumption === "Heavy") score += 35;
  else if (p.alcohol_consumption === "Moderate") score += 18;
  else if (p.alcohol_consumption === "Light") score += 7;
  if (p.bmi > 35) score += 20;
  else if (p.bmi > 30) score += 12;
  if (p.fatigue) score += 15;
  if (p.age > 50) score += 10;
  const risk = Math.min(95, Math.max(5, score));
  const confidence = 82 + Math.random() * 10;
  return { risk, confidence };
}

function scoreKidneyDisease(p: PatientInputs): {
  risk: number;
  confidence: number;
} {
  let score = 0;
  if (p.blood_pressure > 140) score += 25;
  else if (p.blood_pressure > 120) score += 12;
  if (p.glucose_level > 200) score += 20;
  else if (p.glucose_level > 140) score += 10;
  if (p.age > 60) score += 18;
  else if (p.age > 45) score += 10;
  if (p.family_medical_history === "Multiple") score += 12;
  if (p.fatigue) score += 8;
  const risk = Math.min(95, Math.max(5, score));
  const confidence = 83 + Math.random() * 9;
  return { risk, confidence };
}

function scoreBreastCancer(p: PatientInputs): {
  risk: number;
  confidence: number;
} {
  let score = 0;
  if (p.age > 60) score += 20;
  else if (p.age > 50) score += 14;
  else if (p.age > 40) score += 8;
  if (
    p.family_medical_history === "Cancer" ||
    p.family_medical_history === "Multiple"
  )
    score += 30;
  if (p.bmi > 35) score += 15;
  else if (p.bmi > 30) score += 8;
  if (p.gender === "Female") score += 5;
  const risk = Math.min(95, Math.max(5, score));
  const confidence = 86 + Math.random() * 8;
  return { risk, confidence };
}

function scoreLungDisease(p: PatientInputs): {
  risk: number;
  confidence: number;
} {
  let score = 0;
  if (p.smoking_status === "Current") score += 35;
  else if (p.smoking_status === "Former") score += 18;
  if (p.oxygen_level < 90) score += 25;
  else if (p.oxygen_level < 95) score += 12;
  if (p.chest_pain) score += 12;
  if (p.fatigue) score += 8;
  if (p.age > 55) score += 10;
  const risk = Math.min(95, Math.max(5, score));
  const confidence = 87 + Math.random() * 8;
  return { risk, confidence };
}

function scoreHypertension(p: PatientInputs): {
  risk: number;
  confidence: number;
} {
  let score = 0;
  if (p.blood_pressure > 160) score += 40;
  else if (p.blood_pressure > 140) score += 28;
  else if (p.blood_pressure > 120) score += 14;
  if (p.age > 55) score += 15;
  else if (p.age > 40) score += 8;
  if (p.bmi > 30) score += 12;
  if (p.alcohol_consumption === "Heavy") score += 12;
  else if (p.alcohol_consumption === "Moderate") score += 6;
  if (p.smoking_status === "Current") score += 8;
  const risk = Math.min(95, Math.max(5, score));
  const confidence = 89 + Math.random() * 7;
  return { risk, confidence };
}

export function getRiskLevel(risk: number): string {
  if (risk <= 30) return "Low";
  if (risk <= 60) return "Medium";
  return "High";
}

export function runAllPredictions(p: PatientInputs): DiseaseScore[] {
  return [
    { disease: "Heart Disease", ...scoreHeartDisease(p) },
    { disease: "Diabetes", ...scoreDiabetes(p) },
    { disease: "Liver Disease", ...scoreLiverDisease(p) },
    { disease: "Kidney Disease", ...scoreKidneyDisease(p) },
    { disease: "Breast Cancer", ...scoreBreastCancer(p) },
    { disease: "Lung Disease", ...scoreLungDisease(p) },
    { disease: "Hypertension", ...scoreHypertension(p) },
  ].map((r) => ({ ...r, riskLevel: getRiskLevel(r.risk) }));
}
