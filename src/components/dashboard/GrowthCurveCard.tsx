import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Fish, Ruler, Weight, Clock } from "lucide-react";

import { useHarvestStore } from "@/store/harvest-store";
import {
  generateGrowthCurve,
  timeToTargetWeight,
} from "@/utils/growth-models";
import type { VBGFParams } from "@/types/growth";

const fields: Array<{
  key: keyof VBGFParams;
  label: string;
  step: number;
  min?: number;
  hint?: string;
}> = [
  { key: "Linf", label: "L∞ (cm)", step: 0.5, min: 0, hint: "Asymptotic length" },
  { key: "K", label: "K", step: 0.01, min: 0, hint: "Growth coefficient" },
  { key: "t0", label: "t₀", step: 0.05, hint: "Age at length 0" },
  { key: "a", label: "a", step: 0.001, min: 0, hint: "W = a · Lᵇ" },
  { key: "b", label: "b", step: 0.05, min: 0, hint: "Length-weight exponent" },
  { key: "horizon", label: "Horizon (yr)", step: 0.5, min: 0.5 },
];

export function GrowthCurveCard() {
  const params = useHarvestStore((s) => s.params);
  const setParam = useHarvestStore((s) => s.setParam);
  const targetWeight = useHarvestStore((s) => s.targetWeight);
  const setTargetWeight = useHarvestStore((s) => s.setTargetWeight);

  const curve = useMemo(() => generateGrowthCurve(params), [params]);
  const tHarvest = useMemo(
    () => timeToTargetWeight(params, targetWeight),
    [params, targetWeight],
  );

  const finalLength = curve[curve.length - 1]?.length ?? 0;
  const finalWeight = curve[curve.length - 1]?.weight ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="p-5 md:p-6 border-b border-border flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <Fish className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Growth Curve Simulator</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Von Bertalanffy: L(t) = L∞ · (1 − e<sup>−K(t − t₀)</sup>)
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-0">
        <div className="p-5 md:p-6 md:border-r border-border space-y-4">
          {fields.map((f) => (
            <label key={f.key} className="block">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{f.label}</span>
                {f.hint && (
                  <span className="text-[11px] text-muted-foreground">{f.hint}</span>
                )}
              </div>
              <input
                type="number"
                value={params[f.key]}
                step={f.step}
                min={f.min}
                onChange={(e) => setParam(f.key, Number(e.target.value))}
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
          <div className="grid grid-cols-3 gap-3">
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
            />
          </div>

          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="lenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  tickFormatter={(v: number) => v.toFixed(1)}
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  label={{
                    value: "Time (years)",
                    position: "insideBottom",
                    offset: -2,
                    fontSize: 11,
                    fill: "var(--color-muted-foreground)",
                  }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v: number) => v.toFixed(0)}
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
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#lenFill)"
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
