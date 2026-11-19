import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layers, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/dashboard/PageHeader";
import { ClassificationBadge, StatusBadge } from "@/components/dashboard/Badges";
import { useEntityList } from "@/hooks/useEntityList";
import { groupBySite } from "@/lib/monitoring";
import { formatCoordinate } from "@/lib/format";

function fusionScore(observations) {
  const sources = new Set(observations.map((item) => item.source).filter(Boolean));
  const avgConfidence =
    observations.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / (observations.length || 1);
  return Math.min(99, Math.round(avgConfidence + Math.max(0, sources.size - 1) * 7));
}

export const Route = createFileRoute("/_authed/evidence-fusion")({
  head: () => ({ meta: [{ title: "Evidence fusion — RESQFLOW" }] }),
  component: EvidenceFusionPage,
});

function EvidenceFusionPage() {
  const { items, loading, reload } = useEntityList("Observation", {}, { sort: "-detected_at", limit: 300 });
  const [pendingId, setPendingId] = useState(null);

  const fused = groupBySite(items)
    .map((site) => {
      const sources = Array.from(new Set(site.observations.map((item) => item.source).filter(Boolean)));
      const latest = site.observations
        .slice()
        .sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at))[0];
      return { ...site, sources, latest, score: fusionScore(site.observations) };
    })
    .sort((a, b) => b.score - a.score);

  async function escalate(site) {
    setPendingId(site.site_name);
    try {
      await base44.entities.Observation.update(site.latest.id, { status: "under review" });
      await reload();
      toast.success(`${site.site_name} sent to the verification queue.`);
    } catch (error) {
      toast.error(error?.message || "Could not update the observation.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Evidence fusion"
        title="Corroborated evidence by site"
        description="Observations from multiple satellite sources are fused per location to strengthen confidence before human verification."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="col-span-full py-12 text-center text-[13px] text-mist/50">Fusing evidence…</p>}
        {!loading && fused.length === 0 && (
          <div className="rf-panel col-span-full p-10 text-center text-[13px] text-mist/60">
            No observations available to fuse.
          </div>
        )}

        {fused.map((site) => (
          <article key={site.site_name} className="rf-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-medium text-soft">{site.site_name}</h3>
                <p className="mt-1 font-mono text-[10px] tracking-tight text-mist/50">
                  {formatCoordinate(site.latitude, site.longitude)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-light text-champagne">{site.score}</p>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-mist/50">Fusion score</p>
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-electric via-champagne to-ember transition-all duration-700"
                style={{ width: `${site.score}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {site.sources.map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-mist/70"
                >
                  <Layers className="h-2.5 w-2.5" />
                  {source}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
              <div className="flex items-center gap-2">
                <ClassificationBadge value={site.latest?.classification} />
                <StatusBadge value={site.latest?.status} />
              </div>
              <span className="font-mono text-[10px] text-mist/50">{site.observations.length} obs</span>
            </div>

            {site.latest?.status !== "under review" && site.latest?.status !== "verified" && (
              <button
                type="button"
                onClick={() => escalate(site)}
                disabled={pendingId === site.site_name}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-electric/30 bg-electric/10 text-[11.5px] font-medium text-[#a8d3fa] transition-colors hover:bg-electric/20 disabled:opacity-60"
              >
                {pendingId === site.site_name ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                Send to verification
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
