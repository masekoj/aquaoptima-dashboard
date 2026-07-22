import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { GrowthCurveCard } from "@/components/dashboard/GrowthCurveCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaOptima · Harvest Cycle Dashboard" },
      {
        name: "description",
        content:
          "Optimize fish harvest cycles with the Von Bertalanffy growth model. Reduce feed waste with data-driven predictions.",
      },
      { property: "og:title", content: "AquaOptima · Harvest Cycle Dashboard" },
      {
        property: "og:description",
        content:
          "Client-side VBGF growth simulator for optimizing aquaculture harvest cycles.",
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
            Tune growth coefficients and preview the harvest curve in real time.
          </p>
        </div>

        <GrowthCurveCard />

        <div className="grid md:grid-cols-3 gap-4">
          <InfoCard
            title="VBGF Engine"
            body="Length and weight are computed from L∞, K, and t₀ using the Von Bertalanffy equation, with W = a·Lᵇ."
          />
          <InfoCard
            title="Client-side first"
            body="All simulations run instantly in the browser. Persistence to Lovable Cloud will be added in the next step."
          />
          <InfoCard
            title="Next up"
            body="Cycle library, feed conversion (FCR) modelling, and multi-scenario comparison."
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
