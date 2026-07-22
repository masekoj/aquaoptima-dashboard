import { create } from "zustand";
import type { VBGFParams } from "@/types/growth";

interface HarvestState {
  params: VBGFParams;
  targetWeight: number; // grams
  setParam: <K extends keyof VBGFParams>(key: K, value: VBGFParams[K]) => void;
  setTargetWeight: (w: number) => void;
  reset: () => void;
}

const defaults: VBGFParams = {
  Linf: 60, // cm — typical farmed salmon asymptote
  K: 0.35,
  t0: -0.2,
  a: 0.012,
  b: 3.0,
  horizon: 4, // years
  steps: 60,
};

export const useHarvestStore = create<HarvestState>((set) => ({
  params: defaults,
  targetWeight: 4000,
  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value } })),
  setTargetWeight: (w) => set({ targetWeight: w }),
  reset: () => set({ params: defaults, targetWeight: 4000 }),
}));
