import type { GrowthPoint, VBGFParams } from "@/types/growth";

/**
 * Dissolved-oxygen stress multiplier (S_DO) applied to the growth coefficient K.
 *   DO >= 5.0        -> 1.0    (full growth potential)
 *   2.5 <= DO < 5.0  -> linear 0.5 .. 1.0
 *   DO < 2.5         -> drops sharply toward ~0.05 (hypoxia, growth stalls)
 */
export function doStressMultiplier(dissolvedOxygen: number): number {
  const dO = Number.isFinite(dissolvedOxygen) ? dissolvedOxygen : 6;
  if (dO >= 5) return 1;
  if (dO >= 2.5) return 0.5 + ((dO - 2.5) / 2.5) * 0.5;
  // Sharp fall-off below 2.5 mg/L: 0.2 at 2.5 down to ~0.02 at 0 mg/L
  const frac = Math.max(0, dO) / 2.5;
  return Math.max(0.02, 0.2 * Math.pow(frac, 2));
}

/**
 * Temperature performance factor — a bell curve peaking near 28 °C for warm-water
 * species, tapering toward the edges of the 15–35 °C range.
 */
export function temperatureFactor(temperature: number): number {
  const t = Number.isFinite(temperature) ? temperature : 26;
  const optimum = 28;
  const spread = 7.5;
  const f = Math.exp(-Math.pow(t - optimum, 2) / (2 * spread * spread));
  return Math.max(0.15, Math.min(1, f));
}

/** Combined environmental multiplier on the growth coefficient K. */
export function environmentalMultiplier(params: VBGFParams): number {
  return (
    doStressMultiplier(params.dissolvedOxygen ?? 6) *
    temperatureFactor(params.temperature ?? 26)
  );
}

/** Effective growth coefficient after environmental stress. */
export function effectiveK(params: VBGFParams): number {
  return params.K * environmentalMultiplier(params);
}

/**
 * Von Bertalanffy Growth Function (VBGF).
 *   L(t) = L_inf * (1 - exp(-K * (t - t0)))
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
 * Generate a growth curve of `steps` samples from t=0 to t=horizon,
 * using the environment-adjusted growth coefficient.
 */
export function generateGrowthCurve(params: VBGFParams): GrowthPoint[] {
  const { Linf, t0, a, b, horizon, steps } = params;
  const K = effectiveK(params);
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

export type DoStatus = {
  label: string;
  tone: "success" | "warning" | "danger";
};

export function doStatus(dissolvedOxygen: number): DoStatus {
  if (dissolvedOxygen > 5) return { label: "Optimal", tone: "success" };
  if (dissolvedOxygen >= 3) return { label: "Moderate stress", tone: "warning" };
  return { label: "Critical · hypoxia", tone: "danger" };
}
