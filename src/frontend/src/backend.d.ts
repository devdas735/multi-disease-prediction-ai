import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PatientRecord {
    id: bigint;
    age: bigint;
    bmi: number;
    family_medical_history: string;
    glucose_level: number;
    blood_pressure: number;
    name: string;
    alcohol_consumption: string;
    created_at: bigint;
    fatigue: boolean;
    smoking_status: string;
    oxygen_level: number;
    gender: string;
    chest_pain: boolean;
    heart_rate: number;
    cholesterol: number;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface PredictionResult {
    id: bigint;
    patient_id: bigint;
    timestamp: bigint;
    risk_level: string;
    disease: string;
    risk_percentage: number;
    confidence: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    create_patient_record(name: string, age: bigint, gender: string, blood_pressure: number, cholesterol: number, glucose_level: number, bmi: number, heart_rate: number, smoking_status: string, alcohol_consumption: string, family_medical_history: string, chest_pain: boolean, fatigue: boolean, oxygen_level: number): Promise<bigint>;
    delete_patient_record(id: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    get_all_patients(): Promise<Array<PatientRecord>>;
    get_all_predictions(): Promise<Array<PredictionResult>>;
    get_patient_record(id: bigint): Promise<PatientRecord | null>;
    get_predictions_by_patient(patient_id: bigint): Promise<Array<PredictionResult>>;
    get_recent_predictions(n: bigint): Promise<Array<PredictionResult>>;
    get_total_patients(): Promise<bigint>;
    get_total_predictions(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    save_prediction_result(patient_id: bigint, disease: string, risk_percentage: number, confidence: number, risk_level: string): Promise<bigint>;
}
