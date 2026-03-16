import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PatientRecord, PredictionResult } from "../backend.d";
import { useActor } from "./useActor";

export function useTotalPatients() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["total_patients"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.get_total_patients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalPredictions() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["total_predictions"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.get_total_predictions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPatients() {
  const { actor, isFetching } = useActor();
  return useQuery<PatientRecord[]>({
    queryKey: ["all_patients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.get_all_patients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPredictions() {
  const { actor, isFetching } = useActor();
  return useQuery<PredictionResult[]>({
    queryKey: ["all_predictions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.get_all_predictions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecentPredictions(n: number) {
  const { actor, isFetching } = useActor();
  return useQuery<PredictionResult[]>({
    queryKey: ["recent_predictions", n],
    queryFn: async () => {
      if (!actor) return [];
      return actor.get_recent_predictions(BigInt(n));
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePredictionsByPatient(patientId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PredictionResult[]>({
    queryKey: ["predictions_by_patient", patientId?.toString()],
    queryFn: async () => {
      if (!actor || patientId === null) return [];
      return actor.get_predictions_by_patient(patientId);
    },
    enabled: !!actor && !isFetching && patientId !== null,
  });
}

export function useDeletePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.delete_patient_record(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_patients"] });
      queryClient.invalidateQueries({ queryKey: ["total_patients"] });
    },
  });
}
