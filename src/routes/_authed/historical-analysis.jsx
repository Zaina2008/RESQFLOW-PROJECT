import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import DetectionTrendChart from "@/components/dashboard/DetectionTrendChart";
import ClassificationChart from "@/components/dashboard/ClassificationChart";
import { useEntityList } from "@/hooks/useEntityList";
import { buildMonthlyTrend, groupByClassification, groupBySite, isWithinDays } from "@/lib/monitoring";
import { formatNumber } from "@/lib/format";
import { CalendarRange, Flame, TrendingUp } from "lucide-react";

const RANGES = [
  { label: "30 days", value: 30, months: 6 },
  { label: "90 days", value: 90, months: 6 },
  { label: "12 months", value: 365, months: 12 },
];

export const Route = createFileRoute("/_authed/historical-analysis")({
  head: () => ({ meta: [{ title: "Historical analysis — RESQFLOW" }] }),
  component: HistoricalAnalysisPage,
});

function HistoricalAnalysisPage() {
  const [range, setRange] = useState(RANGES[0]);
  const { items, loading } = useEntityList("Observation", {}, { sort: "-detected_at", limit: 500 });

  const filtered = items.filter((item) => isWithinDays(item.detected_at, range.value));
  const trend = buildMonthlyTrend(filtered, range.months);
  const classification = groupByClassification(filtered);
  const sites = groupBySite(filtered)
    .map((site) => ({ name: site.site_name, count: site.observations.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const sourceCounts = filtered.reduce((acc, item) => {
    const key = item.source || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const fireCount = filtered.filter((item) => item.classification === "Industrial fire").length;
  const peakSite = sites[0];

  return (
    <div>
      <PageHeader
        eyebrow="Historical analysis"
        title="Longitudinal detection history"
        description="How thermal activity has evolved across your monitored network over the selected window."
        actions={
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
            {RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option)}
                className={[
                  "rounded-lg px-3 py-1.5 text-[11px] transition-colors",
                  range.value === option.value ? "bg-electric/20 text-[#a8d3fa]" : "text-mist/60 hover:text-soft",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Detections" value={loading ? "—" : formatNumber(filtered.length)} hint={range.label} icon={TrendingUp} accent="electric" />
        <StatCard label="Industrial fires" value={loading ? "—" : formatNumber(fireCount)} hint="Classified as active fire" icon={Flame} accent="signal" />
        <StatCard label="Most active site" value={peakSite ? peakSite.name : "—"} hint={peakSite ? `${peakSite.count} detections` : "No activity"} icon={CalendarRange} accent="champagne" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rf-panel p-5 lg:col-span-2">
          <h2 className="text-[14px] font-medium text-soft">Monthly detections</h2>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">{range.label} · all sources</p>
          <div className="mt-4">
            <DetectionTrendChart data={trend} height={250} />
          </div>
        </section>

        <section className="rf-panel p-5">
          <h2 className="text-[14px] font-medium text-soft">Signature distribution</h2>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">Within window</p>
          <div className="mt-5">
            <ClassificationChart data={classification} />
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rf-panel p-5">
          <h2 className="text-[14px] font-medium text-soft">Most active sites</h2>
          <div className="mt-4 space-y-3">
            {sites.length === 0 && <p className="py-6 text-center text-[13px] text-mist/60">No activity in this window.</p>}
            {sites.map((site) => {
              const share = filtered.length ? Math.round((site.count / filtered.length) * 100) : 0;
              return (
                <div key={site.name}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[12.5px] text-soft/90">{site.name}</span>
                    <span className="font-mono text-[11px] text-mist/60">{site.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-electric to-champagne" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rf-panel p-5">
          <h2 className="text-[14px] font-medium text-soft">Source contribution</h2>
          <div className="mt-4 space-y-2.5">
            {Object.entries(sourceCounts).length === 0 && (
              <p className="py-6 text-center text-[13px] text-mist/60">No source activity recorded.</p>
            )}
            {Object.entries(sourceCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => (
                <div
                  key={source}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5"
                >
                  <span className="text-[12px] text-mist/80">{source}</span>
                  <span className="font-mono text-[11px] text-champagne">{count}</span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
