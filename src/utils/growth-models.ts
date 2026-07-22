import type { GrowthPoint, VBGFParams } from "@/types/growth";

/**
 * Von Bertalanffy Growth Function (VBGF).
 *   L(t) = L_inf * (1 - exp(-K * (t - t0)))
 *
 * Returns predicted length (cm) at time t.
 */
export function vbgfLength(t: number, Linf: number, K: number, t0: number): number {
  return Linf * (1 - Math.exp(-K * (t - t0)));
}

/**
 * Standard allometric length-weight relationship:
 *   W = a * L^b
 */
export function lengthToWeight(length: number, a: number, b: number): number {
  if (length <= 0) return 0;
  return a * Math.pow(length, b);
}

/**
 * Generate a growth curve of `steps` samples from t=0 to t=horizon.
 */
export function generateGrowthCurve(params: VBGFParams): GrowthPoint[] {
  const { Linf, K, t0, a, b, horizon, steps } = params;
  const points: GrowthPoint[] = [];
  const safeSteps = Math.max(2, Math.floor(steps));
  for (let i = 0; i < safeSteps; i++) {
    const t = (horizon * i) / (safeSteps - 1);
    const length = Math.max(0, vbgfLength(t, Linf, K, t0));
    const weight = lengthToWeight(length, a, b);
    points.push({ t, length, weight });
  }
  return points;
}

/**
 * Find the time (in the horizon window) at which weight first reaches
 * `targetWeight` grams. Returns null if never reached within horizon.
 */
export function timeToTargetWeight(
  params: VBGFParams,
  targetWeight: number,
): number | null {
  const curve = generateGrowthCurve(params);
  const hit = curve.find((p) => p.weight >= targetWeight);
  return hit ? hit.t : null;
}
