// Domain types for the AquaOptima growth engine.

export interface VBGFParams {
  /** Asymptotic length (cm) — L∞ */
  Linf: number;
  /** Growth coefficient (per unit time) — K */
  K: number;
  /** Theoretical age at length 0 — t0 */
  t0: number;
  /** Length-weight coefficient a (W = a * L^b) */
  a: number;
  /** Length-weight exponent b */
  b: number;
  /** Time horizon to simulate (same unit as K, typically years) */
  horizon: number;
  /** Number of samples along the curve */
  steps: number;
  /** Dissolved oxygen (mg/L) */
  dissolvedOxygen?: number;
  /** Water temperature (°C) */
  temperature?: number;
}


export interface GrowthPoint {
  t: number;
  length: number;
  weight: number;
}
