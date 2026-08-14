import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Save, Trash2, Library, LogIn, Pin } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  useScenarios,
  useSaveScenario,
  useDeleteScenario,
  type Scenario,
} from "@/hooks/use-scenarios";
import { useHarvestStore } from "@/store/harvest-store";
import { speciesName } from "@/utils/species";

export function CycleLibraryPanel() {
  const { user, loading } = useAuth();
  const params = useHarvestStore((s) => s.params);
  const targetWeight = useHarvestStore((s) => s.targetWeight);
  const population = useHarvestStore((s) => s.population);
  const speciesId = useHarvestStore((s) => s.speciesId);
  const setParam = useHarvestStore((s) => s.setParam);
  const setTargetWeight = useHarvestStore((s) => s.setTargetWeight);
  const setPopulation = useHarvestStore((s) => s.setPopulation);
  const setSpeciesId = useHarvestStore((s) => s.setSpeciesId);
  const pinCurrent = useHarvestStore((s) => s.pinCurrent);

  const scenariosQuery = useScenarios(!!user);
  const saveMut = useSaveScenario();
  const deleteMut = useDeleteScenario();
  const [name, setName] = useState("");

  const onSave = async () => {
    if (!name.trim()) {
      toast.error("Name this cycle first (e.g. \u201cPond 1 — Tilapia wet season\u201d).");
      return;
    }
    try {
      await saveMut.mutateAsync({
        name: name.trim(),
        params: { ...params, population, speciesId },
        targetWeight,
      });
      toast.success("Cycle saved to library");
      setName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const onLoad = (s: Scenario) => {
    const { population: pop, speciesId: sid, ...growth } = s.params;
    (Object.keys(growth) as Array<keyof typeof growth>).forEach((k) =>
      setParam(k, growth[k]),
    );
    setTargetWeight(Number(s.target_weight));
    if (typeof pop === "number") setPopulation(pop);
    setSpeciesId(sid ?? null);
    toast.success(`Loaded "${s.name}"`);
  };

  const onPin = (s: Scenario) => {
    const { population: pop, speciesId: sid, ...growth } = s.params;
    useHarvestStore.setState({
      pinned: {
        label: s.name,
        params: growth,
        targetWeight: Number(s.target_weight),
        population: typeof pop === "number" ? pop : population,
        speciesId: sid ?? null,
      },
    });
    toast.success(`Pinned "${s.name}" for comparison`);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <LogIn className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Build your cycle library</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to save named batches (species, target weight, horizon and
            environmental baselines) and reload them in one click.
          </p>
          <Link
            to="/auth"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-5 border-b border-border flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
          <Library className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary">Cycle Library</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Save the current batch setup or reload a previous cycle.
          </p>
        </div>
        <button
          onClick={() => pinCurrent("Current setup")}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
        >
          <Pin className="h-3.5 w-3.5" />
          Pin current
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Batch name (e.g. Pond 1 — Tilapia wet season)"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={onSave}
            disabled={saveMut.isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Save cycle
          </button>
        </div>

        <div className="space-y-2">
          {scenariosQuery.isLoading && (
            <div className="text-sm text-muted-foreground">Loading library…</div>
          )}
          {scenariosQuery.data?.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No cycles yet. Save your first batch above.
            </div>
          )}
          {scenariosQuery.data?.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <div className="flex-1 min-w-[10rem]">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  {speciesName(s.params.speciesId)} ·{" "}
                  {s.params.population?.toLocaleString() ?? "—"} fish · DO{" "}
                  {(s.params.dissolvedOxygen ?? 6).toFixed(1)} mg/L · target{" "}
                  {(Number(s.target_weight) / 1000).toFixed(1)} kg
                </div>
              </div>
              <button
                onClick={() => onLoad(s)}
                className="text-xs rounded-md border border-input bg-background px-2.5 py-1 hover:bg-accent"
              >
                Load
              </button>
              <button
                onClick={() => onPin(s)}
                className="text-xs rounded-md border border-input bg-background px-2.5 py-1 hover:bg-accent inline-flex items-center gap-1"
              >
                <Pin className="h-3 w-3" />
                Compare
              </button>
              <button
                onClick={() => deleteMut.mutate(s.id)}
                className="text-muted-foreground hover:text-destructive p-1"
                aria-label="Delete cycle"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
