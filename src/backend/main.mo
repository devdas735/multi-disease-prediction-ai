import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  
  // Component integration
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Data Types
  type PatientRecord = {
    id : Nat;
    name : Text;
    age : Nat;
    gender : Text;
    blood_pressure : Float;
    cholesterol : Float;
    glucose_level : Float;
    bmi : Float;
    heart_rate : Float;
    smoking_status : Text;
    alcohol_consumption : Text;
    family_medical_history : Text;
    chest_pain : Bool;
    fatigue : Bool;
    oxygen_level : Float;
    created_at : Int;
  };

  type PredictionResult = {
    id : Nat;
    patient_id : Nat;
    disease : Text;
    risk_percentage : Float;
    confidence : Float;
    risk_level : Text;
    timestamp : Int;
  };

  // Custom comparison modules
  module PredictionResult {
    public func compare(a : PredictionResult, b : PredictionResult) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  // State
  var next_patient_id = 1;
  var next_prediction_id = 1;

  let patient_records = Map.empty<Nat, PatientRecord>();
  let prediction_results = Map.empty<Nat, PredictionResult>();

  // Patient CRUD
  public shared ({ caller }) func create_patient_record(
    name : Text,
    age : Nat,
    gender : Text,
    blood_pressure : Float,
    cholesterol : Float,
    glucose_level : Float,
    bmi : Float,
    heart_rate : Float,
    smoking_status : Text,
    alcohol_consumption : Text,
    family_medical_history : Text,
    chest_pain : Bool,
    fatigue : Bool,
    oxygen_level : Float
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create patient records");
    };

    let patient_record : PatientRecord = {
      id = next_patient_id;
      name;
      age;
      gender;
      blood_pressure;
      cholesterol;
      glucose_level;
      bmi;
      heart_rate;
      smoking_status;
      alcohol_consumption;
      family_medical_history;
      chest_pain;
      fatigue;
      oxygen_level;
      created_at = Time.now();
    };
    patient_records.add(next_patient_id, patient_record);
    next_patient_id += 1;
    patient_record.id;
  };

  public query ({ caller }) func get_patient_record(id : Nat) : async ?PatientRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view patient records");
    };
    patient_records.get(id);
  };

  public query ({ caller }) func get_all_patients() : async [PatientRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view patient records");
    };
    patient_records.values().toArray();
  };

  public shared ({ caller }) func delete_patient_record(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete patient records");
    };
    if (not patient_records.containsKey(id)) {
      Runtime.trap("Patient record not found");
    };
    patient_records.remove(id);
    true;
  };

  // Prediction Results
  public shared ({ caller }) func save_prediction_result(
    patient_id : Nat,
    disease : Text,
    risk_percentage : Float,
    confidence : Float,
    risk_level : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save prediction results");
    };

    if (not patient_records.containsKey(patient_id)) {
      Runtime.trap("Patient record not found");
    };

    let prediction_result : PredictionResult = {
      id = next_prediction_id;
      patient_id;
      disease;
      risk_percentage;
      confidence;
      risk_level;
      timestamp = Time.now();
    };
    prediction_results.add(next_prediction_id, prediction_result);
    next_prediction_id += 1;
    prediction_result.id;
  };

  public query ({ caller }) func get_predictions_by_patient(patient_id : Nat) : async [PredictionResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    prediction_results.values().toArray().filter(
      func(p) { p.patient_id == patient_id }
    );
  };

  public query ({ caller }) func get_all_predictions() : async [PredictionResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    prediction_results.values().toArray();
  };

  public query ({ caller }) func get_recent_predictions(n : Nat) : async [PredictionResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    let all_predictions = prediction_results.values().toArray().sort();
    let predictions_count = all_predictions.size();
    if (predictions_count <= n) { return all_predictions };
    all_predictions.sliceToArray(0, n + 1);
  };

  // Statistics
  public query ({ caller }) func get_total_patients() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };
    patient_records.size();
  };

  public query ({ caller }) func get_total_predictions() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };
    prediction_results.size();
  };
};
