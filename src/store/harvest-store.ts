import { create } from "zustand";
import type { VBGFParams } from "@/types/growth";

export interface PinnedScenario {
  label: string;
  params: VBGFParams;
  targetWeight: number;
  population: number;
  speciesId: string | null;
}

interface HarvestState {
  params: VBGFParams;
  targetWeight: number; // grams
  population: number; // fish stocked
  speciesId: string | null;
  pinned: PinnedScenario | null;
  setParam: <K extends keyof VBGFParams>(key: K, value: VBGFParams[K]) => void;
  setTargetWeight: (w: number) => void;
  setPopulation: (n: number) => void;
  setSpeciesId: (id: string | null) => void;
  pinCurrent: (label: string) => void;
  clearPinned: () => void;
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
  dissolvedOxygen: 6.0, // mg/L
  temperature: 26, // °C
};

export const useHarvestStore = create<HarvestState>((set, get) => ({
  params: defaults,
  targetWeight: 4000,
  population: 1000,
  speciesId: null,
  pinned: null,
  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value } })),
  setTargetWeight: (w) => set({ targetWeight: w }),
  setPopulation: (n) => set({ population: Math.max(1, Math.floor(n)) }),
  setSpeciesId: (id) => set({ speciesId: id }),
  pinCurrent: (label) => {
    const s = get();
    set({
      pinned: {
        label,
        params: { ...s.params },
        targetWeight: s.targetWeight,
        population: s.population,
        speciesId: s.speciesId,
      },
    });
  },
  clearPinned: () => set({ pinned: null }),
  reset: () =>
    set({ params: defaults, targetWeight: 4000, population: 1000, speciesId: null }),
}));
