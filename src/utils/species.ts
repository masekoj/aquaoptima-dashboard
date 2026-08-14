import type { VBGFParams } from "@/types/growth";

export type SpeciesPreset = {
  id: string;
  name: string;
  params: Pick<VBGFParams, "Linf" | "K" | "t0" | "a" | "b">;
};

export const SPECIES: SpeciesPreset[] = [
  {
    id: "tilapia",
    name: "Nile Tilapia",
    params: { Linf: 40, K: 0.55, t0: -0.1, a: 0.02, b: 2.95 },
  },
  {
    id: "makumba",
    name: "Makumba",
    params: { Linf: 55, K: 0.28, t0: -0.25, a: 0.014, b: 3.0 },
  },
  {
    id: "catfish",
    name: "African Catfish",
    params: { Linf: 85, K: 0.22, t0: -0.15, a: 0.008, b: 3.05 },
  },
];

export function speciesName(id: string | null | undefined): string {
  return SPECIES.find((s) => s.id === id)?.name ?? "Custom profile";
}
