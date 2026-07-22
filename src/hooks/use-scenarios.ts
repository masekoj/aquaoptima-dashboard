import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { VBGFParams } from "@/types/growth";

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  params: VBGFParams;
  target_weight: number;
  created_at: string;
  updated_at: string;
}

export function useScenarios(enabled: boolean) {
  return useQuery({
    queryKey: ["scenarios"],
    enabled,
    queryFn: async (): Promise<Scenario[]> => {
      const { data, error } = await supabase
        .from("harvest_scenarios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Scenario[];
    },
  });
}

export function useSaveScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; params: VBGFParams; targetWeight: number }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("harvest_scenarios")
        .insert({
          user_id: uid,
          name: input.name,
          params: input.params as unknown as never,
          target_weight: input.targetWeight,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scenarios"] }),
  });
}

export function useDeleteScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("harvest_scenarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scenarios"] }),
  });
}
