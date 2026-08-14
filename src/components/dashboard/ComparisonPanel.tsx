import { useMemo } from "react";
import { GitCompareArrows, Pin, X } from "lucide-react";
import { toast } from "sonner";

import { useHarvestStore } from "@/store/harvest-store";
import {
  DEFAULT_BASE_FCR,
  SPECIES_BASE_FCR,
  cycleMetrics,
  type CycleMetrics,
} from "@/utils/fcr-models";
import { speciesName } from "@/utils/species";

const baseFor = (id: string | null) =>
  (id && SPECIES_BASE_FCR[id]) || DEFAULT_BASE_FCR;

export function ComparisonPanel() {
  const params = useHarvestStore((s) => s.params);
  const targetWeight = useHarvestStore((s) => s.targetWeight);
  const population = useHarvestStore((s) => s.population);
  const speciesId = useHarvestStore((s) => s.speciesId);
  const pinned = useHarvestStore((s) => s.pinned);
  const pinCurrent = useHarvestStore((s) => s.pinCurrent);
  const clearPinned = useHarvestStore((s) => s.clearPinned);

  const current = useMemo(
    () =>
      cycleMetrics(params, targetWeight, population, baseFor(speciesId)),
    [params, targetWeight, population, speciesId],
  );

  const other = useMemo(
    () =>
      pinned
        ? cycleMetrics(
            pinned.params,
            pinned.targetWeight,
            pinned.population,
            baseFor(pinned.speciesId),
          )
        : null,
    [pinned],
  );

  const rows: Array<{
    label: string;
    fmt: (m: CycleMetrics) => string;
    better?: "low" | "high";
    pick?: (m: CycleMetrics) => number | null;
  }> = [
    {
      label: "Total time to target",
      fmt: (m) =>
        m.timeToTargetDays !== null
          ? `${Math.round(m.timeToTargetDays)} days (${m.timeToTargetYears!.toFixed(2)} yr)`
          : "Not reached",
      better: "low",
      pick: (m) => m.timeToTargetDays,
    },
    {
      label: "Total feed consumed",
      fmt: (m) => `${m.totalFeedKg.toFixed(0)} kg`,
      better: "low",
      pick: (m) => m.totalFeedKg,
    },
    {
      label: "Estimated FCR",
      fmt: (m) => m.avgFCR.toFixed(2),
      better: "low",
      pick: (m) => m.avgFCR,
    },
    {
      label: "Growth potential",
      fmt: (m) => `${Math.round(m.envMultiplier * 100)}%`,
      better: "high",
      pick: (m) => m.envMultiplier,
    },
    {
      label: "Efficiency score",
      fmt: (m) => `${m.efficiencyScore}/100`,
      better: "high",
      pick: (m) => m.efficiencyScore,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-5 border-b border-border flex flex-wrap items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
          <GitCompareArrows className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-[12rem]">
          <h3 className="text-sm font-semibold text-primary">Scenario comparison</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pin a configuration, change the sliders, and compare outcomes side by side.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              pinCurrent("Pinned scenario");
              toast.success("Current configuration pinned");
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pin className="h-3.5 w-3.5" />
            {pinned ? "Re-pin current" : "Compare scenarios"}
          </button>
          {pinned && (
            <button
              onClick={clearPinned}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {!pinned || !other ? (
        <div className="p-5 text-sm text-muted-foreground">
          Nothing pinned yet. Pin the current setup (or hit “Compare” on a saved
          cycle), then adjust dissolved oxygen, temperature or feeding assumptions to
          see the trade-off.
        </div>
      ) : (
        <div className="p-5 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Metric</th>
                <th className="pb-2 font-medium">
                  {pinned.label}
                  <div className="normal-case tracking-normal text-[11px] text-muted-foreground/80">
                    {speciesName(pinned.speciesId)} · DO{" "}
                    {(pinned.params.dissolvedOxygen ?? 6).toFixed(1)} mg/L
                  </div>
                </th>
                <th className="pb-2 font-medium">
                  Current
                  <div className="normal-case tracking-normal text-[11px] text-muted-foreground/80">
                    {speciesName(speciesId)} · DO{" "}
                    {(params.dissolvedOxygen ?? 6).toFixed(1)} mg/L
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const a = r.pick?.(other) ?? null;
                const b = r.pick?.(current) ?? null;
                let winner: "a" | "b" | null = null;
                if (a !== null && b !== null && a !== b) {
                  const bWins = r.better === "low" ? b < a : b > a;
                  winner = bWins ? "b" : "a";
                }
                const win = "font-semibold text-[var(--color-success)]";
                return (
                  <tr key={r.label}>
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className={`py-2.5 tabular-nums ${winner === "a" ? win : ""}`}>
                      {r.fmt(other)}
                    </td>
                    <td className={`py-2.5 tabular-nums ${winner === "b" ? win : ""}`}>
                      {r.fmt(current)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
