import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { CLASSIFICATION_COLORS } from "@/components/dashboard/Badges";
import { useEntityList } from "@/hooks/useEntityList";

const ObservationMap = lazy(() => import("@/components/map/ObservationMap"));

const FILTERS = ["All", "Industrial fire", "Industrial heat", "Forest fire", "Agri burning"];

export const Route = createFileRoute("/_authed/gis-map")({
  head: () => ({ meta: [{ title: "GIS map — RESQFLOW" }] }),
  component: GisMapPage,
});

function GisMapPage() {
  const [filter, setFilter] = useState("All");
  const observations = useEntityList("Observation", {}, { sort: "-detected_at", limit: 300 });
  const facilities = useEntityList("Facility", {}, { sort: "name", limit: 100 });

  const visible = filter === "All"
    ? observations.items
    : observations.items.filter((item) => item.classification === filter);

  return (
    <div>
      <PageHeader
        eyebrow="GIS map"
        title="Geospatial observation map"
        description="Every thermal observation plotted against monitored facilities. Marker size reflects sensor confidence."
        actions={
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/50">
            {visible.length} plotted · {facilities.items.length} facilities
          </span>
        }
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={[
              "rounded-full border px-3.5 py-1.5 text-[11px] transition-colors",
              filter === option
                ? "border-electric/50 bg-electric/15 text-[#a8d3fa]"
                : "border-white/10 bg-white/[0.02] text-mist/70 hover:border-white/25 hover:text-soft",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-2xl border border-white/[0.07]">
        <ClientOnly
          fallback={
            <div className="grid h-full place-items-center bg-[#0a111d] text-[13px] text-mist/60">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="grid h-full place-items-center bg-[#0a111d] text-[13px] text-mist/60">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            }
          >
            <ObservationMap observations={visible} facilities={facilities.items} />
          </Suspense>
        </ClientOnly>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-xl border border-white/10 bg-[#0a111d]/90 px-3.5 py-2.5 backdrop-blur">
          <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-mist/50">Legend</p>
          <div className="space-y-1">
            {Object.entries(CLASSIFICATION_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2 text-[10px] text-mist/80">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 text-[10px] text-mist/60">
              <span className="h-2 w-2 rounded-full border border-champagne/70" />
              Facility
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
