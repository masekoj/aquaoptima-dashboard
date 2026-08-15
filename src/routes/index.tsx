import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { GrowthCurveCard } from "@/components/dashboard/GrowthCurveCard";
import { FeedPlanCard } from "@/components/dashboard/FeedPlanCard";
import { CycleLibraryPanel } from "@/components/dashboard/CycleLibraryPanel";
import { ComparisonPanel } from "@/components/dashboard/ComparisonPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaOptima · Harvest Cycle Dashboard" },
      {
        name: "description",
        content:
          "Optimize fish harvest cycles with the Von Bertalanffy growth model, FCR-based feeding schedules, and scenario comparison.",
      },
      { property: "og:title", content: "AquaOptima · Harvest Cycle Dashboard" },
      {
        property: "og:description",
        content:
          "Client-side aquaculture simulator with environmental stress modelling, FCR feed planning, and multi-scenario comparison.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Harvest Cycle Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tune growth coefficients, environmental conditions, and feeding assumptions — then compare scenarios side by side.
          </p>
        </div>

        <GrowthCurveCard />

        <FeedPlanCard />

        <div className="grid lg:grid-cols-2 gap-6">
          <CycleLibraryPanel />
          <ComparisonPanel />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <InfoCard
            title="VBGF Engine"
            body="Length and weight are computed from L∞, K, and t₀ using the Von Bertalanffy equation, with W = a·Lᵇ."
          />
          <InfoCard
            title="Environmental stress"
            body="Dissolved oxygen and temperature scale the effective growth coefficient K, flattening the curve when conditions worsen."
          />
          <InfoCard
            title="FCR & comparison"
            body="Species-specific feed conversion ratios, stage-based rations, and side-by-side scenario comparison keep feed waste in check."
          />
        </div>
      </div>
    </AppShell>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}
