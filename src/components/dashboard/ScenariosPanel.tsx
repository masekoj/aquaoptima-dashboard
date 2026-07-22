import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Save, Trash2, FolderOpen, LogIn } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  useScenarios,
  useSaveScenario,
  useDeleteScenario,
  type Scenario,
} from "@/hooks/use-scenarios";
import { useHarvestStore } from "@/store/harvest-store";

export function ScenariosPanel() {
  const { user, loading } = useAuth();
  const params = useHarvestStore((s) => s.params);
  const targetWeight = useHarvestStore((s) => s.targetWeight);
  const setParam = useHarvestStore((s) => s.setParam);
  const setTargetWeight = useHarvestStore((s) => s.setTargetWeight);

  const scenariosQuery = useScenarios(!!user);
  const saveMut = useSaveScenario();
  const deleteMut = useDeleteScenario();
  const [name, setName] = useState("");

  const onSave = async () => {
    if (!name.trim()) {
      toast.error("Give this scenario a name first.");
      return;
    }
    try {
      await saveMut.mutateAsync({ name: name.trim(), params, targetWeight });
      toast.success("Scenario saved");
      setName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const onLoad = (s: Scenario) => {
    (Object.keys(s.params) as Array<keyof typeof s.params>).forEach((k) =>
      setParam(k, s.params[k]),
    );
    setTargetWeight(Number(s.target_weight));
    toast.success(`Loaded "${s.name}"`);
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
          <h3 className="text-sm font-semibold">Save your scenarios to the cloud</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to persist growth-model parameter sets and revisit them later.
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
    <div className="rounded-xl border border-border bg-card">
      <div className="p-5 border-b border-border flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <FolderOpen className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Saved scenarios</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Persist current parameters or reload a previous set.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Scenario name (e.g. Cage A — spring)"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={onSave}
            disabled={saveMut.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>

        <div className="space-y-2">
          {scenariosQuery.isLoading && (
            <div className="text-sm text-muted-foreground">Loading scenarios…</div>
          )}
          {scenariosQuery.data?.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No scenarios yet. Save your first one above.
            </div>
          )}
          {scenariosQuery.data?.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  L∞ {s.params.Linf} · K {s.params.K} · target{" "}
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
                onClick={() => deleteMut.mutate(s.id)}
                className="text-muted-foreground hover:text-destructive p-1"
                aria-label="Delete scenario"
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
