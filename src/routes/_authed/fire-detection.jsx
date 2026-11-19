import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Gauge, Thermometer } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import { ClassificationBadge, StatusBadge } from "@/components/dashboard/Badges";
import { useEntityList } from "@/hooks/useEntityList";
import { formatCoordinate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/fire-detection")({
  head: () => ({ meta: [{ title: "Fire detection — RESQFLOW" }] }),
  component: FireDetectionPage,
});

function FireDetectionPage() {
  const [threshold, setThreshold] = useState(70);
  const { items, loading } = useEntityList("Observation", { classification: "Industrial fire" }, { sort: "-confidence", limit: 100 });

  const visible = items.filter((item) => Number(item.confidence) >= threshold);
  const avgConfidence = visible.length
    ? Math.round(visible.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / visible.length)
    : 0;
  const peakFrp = visible.reduce((max, item) => Math.max(max, Number(item.frp) || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Fire detection"
        title="Industrial fire signatures"
        description="Detections classified as active industrial fire, ranked by sensor confidence."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Fire signatures" value={loading ? "—" : visible.length} hint={`Confidence ≥ ${threshold}%`} icon={Flame} accent="signal" />
        <StatCard label="Mean confidence" value={loading ? "—" : `${avgConfidence}%`} hint="Across matched detections" icon={Gauge} accent="electric" />
        <StatCard label="Peak FRP" value={loading ? "—" : `${peakFrp.toFixed(1)} MW`} hint="Fire radiative power" icon={Thermometer} accent="ember" />
      </div>

      <div className="rf-panel mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-mist/60">Confidence threshold</p>
          <p className="mt-1 text-[12px] text-mist/70">Hide low-confidence detections from the response queue.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={40}
            max={95}
            step={1}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
            className="h-1.5 w-48 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#2789E8]"
          />
          <span className="w-10 font-mono text-[12px] text-champagne">{threshold}%</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="py-12 text-center text-[13px] text-mist/50">Loading detections…</p>}
        {!loading && visible.length === 0 && (
          <div className="rf-panel col-span-full p-10 text-center text-[13px] text-mist/60">
            No fire signatures above {threshold}% confidence.
          </div>
        )}
        {visible.map((item) => (
          <article key={item.id} className="rf-panel relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-medium text-soft">{item.site_name}</h3>
                <p className="mt-1 font-mono text-[10px] tracking-tight text-mist/50">
                  {formatCoordinate(item.latitude, item.longitude)}
                </p>
              </div>
              <StatusBadge value={item.status} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Confidence", value: `${Math.round(Number(item.confidence) || 0)}%` },
                { label: "FRP", value: `${Number(item.frp || 0).toFixed(1)} MW` },
                { label: "Brightness", value: `${Math.round(Number(item.brightness) || 0)} K` },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-mist/50">{metric.label}</p>
                  <p className="mt-1 font-mono text-[12px] text-soft">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
              <ClassificationBadge value={item.classification} />
              <span className="font-mono text-[10px] text-mist/50">{formatDateTime(item.detected_at)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
