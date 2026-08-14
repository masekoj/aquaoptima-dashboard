import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Fish,
  Ruler,
  Weight,
  Clock,
  Info,
  CheckCircle2,
  Droplets,
  Thermometer,
  ChevronDown,
  Activity,
} from "lucide-react";

import { useHarvestStore } from "@/store/harvest-store";
import { SPECIES, type SpeciesPreset } from "@/utils/species";
import {
  generateGrowthCurve,
  timeToTargetWeight,
  doStatus,
  environmentalMultiplier,
} from "@/utils/growth-models";
import type { VBGFParams } from "@/types/growth";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";



const fields: Array<{
  key: "Linf" | "K" | "t0" | "a" | "b" | "horizon";
  label: string;
  step: number;
  min?: number;
  hint?: string;
  explain?: { title: string; body: string };
}> = [
  {
    key: "Linf",
    label: "L∞ (cm)",
    step: 0.5,
    min: 0,
    hint: "Asymptotic length",
    explain: {
      title: "L∞ — Asymptotic length",
      body: "The theoretical maximum length the fish would approach if it lived indefinitely. Higher values mean a bigger species or strain.",
    },
  },
  {
    key: "K",
    label: "K",
    step: 0.01,
    min: 0,
    hint: "Growth coefficient",
    explain: {
      title: "K — Growth coefficient",
      body: "How quickly the fish approaches L∞. A larger K means faster growth toward the asymptote, typical of warmer waters or improved feed.",
    },
  },
  {
    key: "t0",
    label: "t₀",
    step: 0.05,
    hint: "Age at length 0",
    explain: {
      title: "t₀ — Theoretical age at length 0",
      body: "A curve-fitting offset (usually slightly negative) that shifts the growth curve along the time axis. It rarely needs large changes.",
    },
  },
  {
    key: "a",
    label: "a",
    step: 0.001,
    min: 0,
    hint: "W = a · Lᵇ",
    explain: {
      title: "a — Length–weight coefficient",
      body: "Scales length to body weight in the allometric equation W = a · Lᵇ. Species and condition factor determine its value.",
    },
  },
  {
    key: "b",
    label: "b",
    step: 0.05,
    min: 0,
    hint: "Length-weight exponent",
    explain: {
      title: "b — Length–weight exponent",
      body: "The shape exponent in W = a · Lᵇ. Values near 3 indicate isometric growth (proportional in all dimensions).",
    },
  },
  { key: "horizon", label: "Horizon (yr)", step: 0.5, min: 0.5 },
];

export function GrowthCurveCard() {
  const params = useHarvestStore((s) => s.params);
  const setParam = useHarvestStore((s) => s.setParam);
  const targetWeight = useHarvestStore((s) => s.targetWeight);
  const setTargetWeight = useHarvestStore((s) => s.setTargetWeight);
  const activeSpecies = useHarvestStore((s) => s.speciesId);
  const setActiveSpecies = useHarvestStore((s) => s.setSpeciesId);

  const curve = useMemo(() => generateGrowthCurve(params), [params]);
  const tHarvest = useMemo(
    () => timeToTargetWeight(params, targetWeight),
    [params, targetWeight],
  );

  const finalLength = curve[curve.length - 1]?.length ?? 0;
  const finalWeight = curve[curve.length - 1]?.weight ?? 0;

  const dissolvedOxygen = params.dissolvedOxygen ?? 6;
  const temperature = params.temperature ?? 26;
  const envMultiplier = environmentalMultiplier(params);


  const applySpecies = (s: SpeciesPreset) => {
    (Object.keys(s.params) as Array<keyof typeof s.params>).forEach((k) =>
      setParam(k, s.params[k]),
    );
    setActiveSpecies(s.id);
  };

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="p-5 md:p-6 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Fish className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-primary">
              Growth Curve Simulator
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Von Bertalanffy: L(t) = L∞ · (1 − e<sup>−K(t − t₀)</sup>)
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
            Species preset
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIES.map((s) => {
              const active = activeSpecies === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => applySpecies(s)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-transparent bg-[var(--color-ring)] text-white"
                      : "border-input bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <EnvironmentalCard
          dissolvedOxygen={dissolvedOxygen}
          temperature={temperature}
          multiplier={envMultiplier}
          onChange={(key, value) => setParam(key, value)}
        />

      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-0">
        <div className="p-5 md:p-6 md:border-r border-border space-y-4">
          {fields.map((f) => (
            <label key={f.key} className="block">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium inline-flex items-center gap-1">
                  {f.label}
                  {f.explain && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`About ${f.label}`}
                          className="text-muted-foreground hover:text-[var(--color-ring)]"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="w-64 text-sm">
                        <div className="font-semibold text-primary">
                          {f.explain.title}
                        </div>
                        <p className="mt-1 text-muted-foreground leading-relaxed">
                          {f.explain.body}
                        </p>
                      </PopoverContent>
                    </Popover>
                  )}
                </span>
                {f.hint && (
                  <span className="text-[11px] text-muted-foreground">{f.hint}</span>
                )}
              </div>
              <input
                type="number"
                value={Number(params[f.key] ?? 0)}
                step={f.step}
                min={f.min}
                onChange={(e) => {
                  setParam(f.key, Number(e.target.value));
                  setActiveSpecies(null);
                }}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          ))}

          <label className="block pt-2 border-t border-border">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Target harvest weight</span>
              <span className="text-[11px] text-muted-foreground">grams</span>
            </div>
            <input
              type="number"
              value={targetWeight}
              step={100}
              min={0}
              onChange={(e) => setTargetWeight(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat icon={Ruler} label="Final length" value={`${finalLength.toFixed(1)} cm`} />
            <Stat
              icon={Weight}
              label="Final weight"
              value={`${(finalWeight / 1000).toFixed(2)} kg`}
            />
            <Stat
              icon={Clock}
              label="Time to target"
              value={tHarvest ? `${tHarvest.toFixed(2)} yr` : "—"}
              highlight={tHarvest !== null}
            />
            <Stat
              icon={Activity}
              label="Growth potential"
              value={`${Math.round(envMultiplier * 100)}%`}
            />
          </div>


          <div className="h-72 md:h-80 w-full -mx-2 md:mx-0 touch-pan-y">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve} margin={{ top: 8, right: 12, bottom: 16, left: -4 }}>
                <defs>
                  <linearGradient id="lenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-line)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-line)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  tickFormatter={(v: number) => v.toFixed(1)}
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickMargin={6}
                  label={{
                    value: "Time (years)",
                    position: "insideBottom",
                    offset: -6,
                    fontSize: 11,
                    fill: "var(--color-muted-foreground)",
                  }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickMargin={4}
                  width={40}
                  tickFormatter={(v: number) => v.toFixed(0)}
                  label={{
                    value: "Length (cm)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 12,
                    fontSize: 11,
                    fill: "var(--color-muted-foreground)",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "length") return [`${value.toFixed(2)} cm`, "Length"];
                    if (name === "weight") return [`${value.toFixed(1)} g`, "Weight"];
                    return [value, name];
                  }}
                  labelFormatter={(t: number) => `t = ${t.toFixed(2)} yr`}
                />
                <Area
                  type="monotone"
                  dataKey="length"
                  stroke="var(--chart-line)"
                  strokeWidth={2.5}
                  fill="url(#lenFill)"
                  activeDot={{ r: 5, fill: "var(--chart-line)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
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
    </div>
  );
}

const TONE_CLASSES: Record<string, string> = {
  success:
    "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]",
  warning: "border-amber-400/50 bg-amber-400/10 text-amber-600",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
};

function EnvironmentalCard({
  dissolvedOxygen,
  temperature,
  multiplier,
  onChange,
}: {
  dissolvedOxygen: number;
  temperature: number;
  multiplier: number;
  onChange: (key: keyof VBGFParams, value: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const status = doStatus(dissolvedOxygen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
      <div className="rounded-lg border border-border bg-background">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Droplets className="h-4 w-4 text-[var(--color-ring)]" />
            Environmental Parameters
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE_CLASSES[status.tone]}`}
            >
              {status.label}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-5 border-t border-border px-4 py-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <Droplets className="h-3.5 w-3.5 text-[var(--color-ring)]" />
                  Dissolved Oxygen
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {dissolvedOxygen.toFixed(1)} mg/L
                </span>
              </div>
              <Slider
                className="mt-3"
                value={[dissolvedOxygen]}
                min={1}
                max={10}
                step={0.1}
                onValueChange={(v) => onChange("dissolvedOxygen", v[0] ?? 6)}
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>1.0</span>
                <span>Optimal &gt; 5.0 · Stress 3–5 · Hypoxia &lt; 3.0</span>
                <span>10.0</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <Thermometer className="h-3.5 w-3.5 text-[var(--color-ring)]" />
                  Water Temperature
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {temperature.toFixed(0)} °C
                </span>
              </div>
              <Slider
                className="mt-3"
                value={[temperature]}
                min={15}
                max={35}
                step={0.5}
                onValueChange={(v) => onChange("temperature", v[0] ?? 26)}
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>15 °C</span>
                <span>Optimum ≈ 28 °C</span>
                <span>35 °C</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Environmental stress scales the growth coefficient K to{" "}
              <span className="font-semibold text-foreground">
                {Math.round(multiplier * 100)}%
              </span>{" "}
              of its nominal value, flattening the curve and delaying harvest.
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
