import type { GrowthPoint, VBGFParams } from "@/types/growth";
import {
  environmentalMultiplier,
  generateGrowthCurve,
  timeToTargetWeight,
} from "@/utils/growth-models";

/** Species-specific baseline feed conversion ratios (dry feed kg / kg biomass gain). */
export const SPECIES_BASE_FCR: Record<string, number> = {
  tilapia: 1.5,
  makumba: 1.8,
  catfish: 1.3,
};

export const DEFAULT_BASE_FCR = 1.6;

/** Daily feeding rate as a percentage of body weight, by average fish weight (g). */
export function feedingRatePercent(weightG: number): number {
  if (weightG < 5) return 10;
  if (weightG < 20) return 7;
  if (weightG < 50) return 5;
  if (weightG < 100) return 4;
  if (weightG < 250) return 3;
  if (weightG < 500) return 2.5;
  if (weightG < 1000) return 2;
  return 1.5;
}

/** Recommended meals per day for the current growth stage. */
export function mealFrequency(weightG: number): number {
  if (weightG < 20) return 5;
  if (weightG < 100) return 4;
  if (weightG < 500) return 3;
  return 2;
}

/** Recommended pellet size from fish length (cm). */
export function pelletSize(lengthCm: number): string {
  if (lengthCm < 4) return "Crumb (0.5 mm)";
  if (lengthCm < 8) return "1.5 mm";
  if (lengthCm < 14) return "2 mm";
  if (lengthCm < 22) return "4 mm";
  return "6 mm";
}

/** Growth-stage label used across the feed panels. */
export function growthStage(weightG: number): string {
  if (weightG < 20) return "Fry";
  if (weightG < 100) return "Fingerling";
  if (weightG < 400) return "Juvenile";
  if (weightG < 900) return "Growing";
  return "Market size";
}

/**
 * Estimated FCR: baseline species FCR, penalised for late growth stages
 * (older fish convert feed less efficiently) and for environmental stress.
 */
export function estimatedFCR(opts: {
  baseFCR: number;
  weightG: number;
  envMultiplier: number;
}): number {
  const { baseFCR, weightG, envMultiplier } = opts;
  const stagePenalty =
    weightG < 50 ? 0.85 : weightG < 250 ? 0.95 : weightG < 700 ? 1.05 : 1.2;
  const envPenalty = 1 / Math.max(0.25, envMultiplier);
  return baseFCR * stagePenalty * Math.min(2.2, envPenalty);
}

export interface FeedPlan {
  avgWeightG: number;
  avgLengthCm: number;
  stage: string;
  biomassKg: number;
  ratePercent: number;
  dailyFeedKg: number;
  meals: number;
  pellet: string;
  fcr: number;
}

/** Feed plan at a given point in the cycle (defaults to the current/latest point). */
export function feedPlanAt(
  params: VBGFParams,
  population: number,
  point: GrowthPoint,
  baseFCR: number,
): FeedPlan {
  const env = environmentalMultiplier(params);
  const biomassKg = (population * point.weight) / 1000;
  const ratePercent = feedingRatePercent(point.weight);
  return {
    avgWeightG: point.weight,
    avgLengthCm: point.length,
    stage: growthStage(point.weight),
    biomassKg,
    ratePercent,
    dailyFeedKg: (biomassKg * ratePercent) / 100,
    meals: mealFrequency(point.weight),
    pellet: pelletSize(point.length),
    fcr: estimatedFCR({ baseFCR, weightG: point.weight, envMultiplier: env }),
  };
}

export interface CycleMetrics {
  timeToTargetYears: number | null;
  timeToTargetDays: number | null;
  harvestBiomassKg: number;
  totalFeedKg: number;
  avgFCR: number;
  envMultiplier: number;
  efficiencyScore: number;
}

/**
 * Whole-cycle metrics. Feed is integrated over the curve: each growth increment
 * costs (increment × stage-adjusted FCR) kilograms of feed.
 */
export function cycleMetrics(
  params: VBGFParams,
  targetWeight: number,
  population: number,
  baseFCR: number,
): CycleMetrics {
  const curve = generateGrowthCurve(params);
  const env = environmentalMultiplier(params);
  const tTarget = timeToTargetWeight(params, targetWeight);

  let feedKg = 0;
  let gainKg = 0;
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1]!;
    const cur = curve[i]!;
    if (tTarget !== null && prev.t > tTarget) break;
    const gainG = Math.max(0, cur.weight - prev.weight);
    const fcr = estimatedFCR({
      baseFCR,
      weightG: (cur.weight + prev.weight) / 2,
      envMultiplier: env,
    });
    const incKg = (gainG * population) / 1000;
    gainKg += incKg;
    feedKg += incKg * fcr;
  }

  const avgFCR = gainKg > 0 ? feedKg / gainKg : 0;
  const harvestBiomassKg = (population * targetWeight) / 1000;

  // Efficiency: rewards low FCR, healthy environment, and short cycles.
  const fcrScore = avgFCR > 0 ? Math.min(1, 1.4 / avgFCR) : 0;
  const timeScore =
    tTarget !== null ? Math.min(1, 1 / Math.max(0.25, tTarget)) : 0.1;
  const score = Math.round((fcrScore * 0.45 + env * 0.35 + timeScore * 0.2) * 100);

  return {
    timeToTargetYears: tTarget,
    timeToTargetDays: tTarget !== null ? tTarget * 365 : null,
    harvestBiomassKg,
    totalFeedKg: feedKg,
    avgFCR,
    envMultiplier: env,
    efficiencyScore: Math.max(0, Math.min(100, score)),
  };
}
