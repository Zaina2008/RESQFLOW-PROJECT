import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowUpRight, BellRing, Flame, Factory, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import DetectionTrendChart from "@/components/dashboard/DetectionTrendChart";
import ClassificationChart from "@/components/dashboard/ClassificationChart";
import ObservationTable from "@/components/dashboard/ObservationTable";
import { SeverityBadge, StatusBadge } from "@/components/dashboard/Badges";
import { NAV_ITEMS } from "@/components/dashboard/navItems";
import { useEntityList } from "@/hooks/useEntityList";
import { buildDailyTrend, groupByClassification, isWithinDays } from "@/lib/monitoring";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — RESQFLOW" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const observations = useEntityList("Observation", {}, { sort: "-detected_at", limit: 300 });
  const alerts = useEntityList("Alert", {}, { sort: "-detected_at", limit: 50 });
  const facilities = useEntityList("Facility", {}, { sort: "name", limit: 100 });

  const recent = observations.items.filter((item) => isWithinDays(item.detected_at, 30));
  const industrialHeat = observations.items.filter((item) => item.classification === "Industrial heat").length;
  const awaiting = observations.items.filter(
    (item) => item.status === "new" || item.status === "under review",
  ).length;
  const openAlerts = alerts.items.filter((item) => item.status === "open");
  const monitored = facilities.items.filter((item) => item.status !== "paused").length;

  const trend = buildDailyTrend(observations.items, 14);
  const classification = groupByClassification(observations.items);
  const priorityAlerts = alerts.items
    .filter((item) => item.severity !== "information" || item.status === "open")
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        eyebrow="Operations overview"
        title="Monitoring command centre"
        description="Fused satellite thermal intelligence for industrial fire detection, classification and human verification."
        actions={
          <Link
            to="/live-monitoring"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-electric/30 bg-electric/10 px-4 text-[12px] font-medium text-[#a8d3fa] transition-colors hover:border-electric/60 hover:bg-electric/20"
          >
            <Activity className="h-3.5 w-3.5" />
            Open live monitoring
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Thermal events" value={observations.loading ? "—" : recent.length} hint="Detected in the last 30 days" icon={Activity} accent="electric" />
        <StatCard label="Active alerts" value={alerts.loading ? "—" : openAlerts.length} hint="Awaiting acknowledgement" icon={BellRing} accent="signal" />
        <StatCard label="Industrial heat" value={observations.loading ? "—" : industrialHeat} hint="Heat signatures tracked" icon={Flame} accent="ember" />
        <StatCard label="Awaiting verification" value={observations.loading ? "—" : awaiting} hint="Human review required" icon={ShieldCheck} accent="champagne" />
        <StatCard label="Monitored locations" value={facilities.loading ? "—" : monitored} hint="Facilities in the network" icon={Factory} accent="steel" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rf-panel p-5 lg:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-medium text-soft">Detection trend</h2>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">Daily thermal detections · 14 days</p>
            </div>
            <Link to="/historical-analysis" className="inline-flex items-center gap-1 text-[11px] text-electric/90 hover:text-champagne">
              History <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <DetectionTrendChart data={trend} />
        </section>

        <section className="rf-panel p-5">
          <div className="mb-5">
            <h2 className="text-[14px] font-medium text-soft">Classification mix</h2>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">All observations</p>
          </div>
          <ClassificationChart data={classification} />
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-soft">Recent detection activity</h2>
            <Link to="/live-monitoring" className="text-[11px] text-electric/90 hover:text-champagne">
              View all
            </Link>
          </div>
          <ObservationTable items={observations.items.slice(0, 5)} loading={observations.loading} />
        </section>

        <section className="rf-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-soft">High-priority alerts</h2>
            <Link to="/alerts" className="text-[11px] text-electric/90 hover:text-champagne">
              Manage
            </Link>
          </div>
          <div className="space-y-2.5">
            {alerts.loading && <p className="py-8 text-center text-[13px] text-mist/50">Loading alerts…</p>}
            {!alerts.loading && priorityAlerts.length === 0 && (
              <p className="py-8 text-center text-[13px] text-mist/50">No open alerts. All clear.</p>
            )}
            {priorityAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12.5px] font-medium leading-snug text-soft">{alert.title}</p>
                  <SeverityBadge value={alert.severity} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mist/50">
                  <span>{alert.site_name}</span>
                  <span>{formatDateTime(alert.detected_at)}</span>
                  <StatusBadge value={alert.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-[14px] font-medium text-soft">Every monitoring module</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {NAV_ITEMS.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-[12px] text-mist/80 transition-all hover:border-electric/30 hover:bg-electric/[0.06] hover:text-soft"
              >
                <Icon className="h-4 w-4 text-mist/50 transition-colors group-hover:text-electric" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
