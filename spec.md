# Multi-Disease Prediction AI System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack healthcare AI platform with 6 pages
- Motoko backend: patient records, prediction results, session management
- Frontend: React + TypeScript + Tailwind + Recharts
- Rule-based disease risk scoring for 7 diseases
- Analytics dashboard with 6 chart types
- CSV upload with field mapping preview
- Print/download report functionality

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- PatientRecord type: id, name, age, gender, blood_pressure, cholesterol, glucose_level, bmi, heart_rate, smoking_status, alcohol_consumption, family_medical_history, chest_pain, fatigue, oxygen_level, created_at
- PredictionResult type: id, patient_id, disease, risk_percentage, confidence, risk_level, timestamp
- Functions: createPatient, getPatient, listPatients, savePrediction, getPredictionsByPatient, getAllPredictions
- Simple session: getCurrentUser, setCurrentUser

### Frontend Pages
1. Home - hero section, feature cards, CTA
2. Patient Dashboard - stats cards, recent predictions table, risk overview
3. Disease Prediction Form - 13-field form, submit triggers scoring
4. CSV Upload - dropzone, field mapping table preview
5. Analytics Dashboard - 6 Recharts visualizations
6. Prediction Results - per-disease risk bars, confidence scores, print button

### Prediction Scoring Logic (frontend)
- Heart Disease: weighted score from age, BP, cholesterol, chest_pain, smoking, family_history
- Diabetes: glucose_level, BMI, age, family_history
- Liver Disease: alcohol_consumption, BMI, fatigue, age
- Kidney Disease: BP, glucose, age, family_history
- Breast Cancer: age, family_history, BMI
- Lung Disease: smoking, age, oxygen_level, fatigue, chest_pain
- Hypertension: BP, age, BMI, alcohol, smoking

### Navigation
- Sidebar with icons for all 6 pages
- Active state highlighting
- Responsive collapse on mobile
