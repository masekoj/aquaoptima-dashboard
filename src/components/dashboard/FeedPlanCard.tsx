import { useMemo } from "react";
import { Utensils, Gauge, Users, Timer, Boxes, Scale } from "lucide-react";

import { useHarvestStore } from "@/store/harvest-store";
import { generateGrowthCurve } from "@/utils/growth-models";
import {
  DEFAULT_BASE_FCR,
  SPECIES_BASE_FCR,
  cycleMetrics,
  feedPlanAt,
} from "@/utils/fcr-models";
import { speciesName } from "@/utils/species";

export function FeedPlanCard() {
  const params = useHarvestStore((s) => s.params);
  const targetWeight = useHarvestStore((s) => s.targetWeight);
  const population = useHarvestStore((s) => s.population);
  const setPopulation = useHarvestStore((s) => s.setPopulation);
  const speciesId = useHarvestStore((s) => s.speciesId);

  const baseFCR = (speciesId && SPECIES_BASE_FCR[speciesId]) || DEFAULT_BASE_FCR;

  const { plan, metrics } = useMemo(() => {
    const curve = generateGrowthCurve(params);
    // Feed the fish at the target size when reachable, else at the horizon size.
    const point =
      curve.find((p) => p.weight >= targetWeight) ?? curve[curve.length - 1]!;
    return {
      plan: feedPlanAt(params, population, point, baseFCR),
      metrics: cycleMetrics(params, targetWeight, population, baseFCR),
    };
  }, [params, targetWeight, population, baseFCR]);

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="p-5 md:p-6 border-b border-border flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-primary text-primary-foreground grid place-items-center">
          <Utensils className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-primary">
            FCR &amp; Feeding Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {speciesName(speciesId)} · {plan.stage} stage · base FCR{" "}
            {baseFCR.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-5">
        <label className="block max-w-xs">
          <span className="text-sm font-medium inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--color-ring)]" />
            Population (fish stocked)
          </span>
          <input
            type="number"
            min={1}
            step={100}
            value={population}
            onChange={(e) => setPopulation(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric
            icon={Gauge}
            label="Estimated FCR"
            value={plan.fcr.toFixed(2)}
            sub="feed kg / kg gain"
            highlight
          />
          <Metric
            icon={Scale}
            label="Biomass"
            value={`${plan.biomassKg.toFixed(0)} kg`}
            sub={`${(plan.avgWeightG / 1000).toFixed(2)} kg avg`}
          />
          <Metric
            icon={Utensils}
            label="Daily ration"
            value={`${plan.dailyFeedKg.toFixed(1)} kg`}
            sub={`${plan.ratePercent}% body weight`}
          />
          <Metric
            icon={Boxes}
            label="Cycle feed"
            value={`${metrics.totalFeedKg.toFixed(0)} kg`}
            sub={`avg FCR ${metrics.avgFCR.toFixed(2)}`}
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold text-primary">Feed recommendations</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <Recommendation
              icon={Utensils}
              term="Daily feed weight"
              value={`${plan.dailyFeedKg.toFixed(2)} kg/day`}
            />
            <Recommendation
              icon={Timer}
              term="Meal frequency"
              value={`${plan.meals}× daily`}
            />
            <Recommendation icon={Boxes} term="Pellet size" value={plan.pellet} />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Split the daily ration evenly across meals. Environmental stress is at{" "}
            <span className="font-semibold text-foreground">
              {Math.round(metrics.envMultiplier * 100)}%
            </span>{" "}
            growth potential — low dissolved oxygen suppresses appetite, so reduce
            rations and re-aerate before feeding.
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight
          ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10"
          : "border-border bg-muted/40"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wide ${
          highlight ? "text-[var(--color-success)]" : "text-muted-foreground"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-semibold tabular-nums ${
          highlight ? "text-[var(--color-success)]" : ""
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Recommendation({
  icon: Icon,
  term,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  term: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-[var(--color-ring)]" />
        {term}
      </dt>
      <dd className="mt-1 text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
