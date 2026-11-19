import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/dashboard/PageHeader";
import { SeverityBadge, StatusBadge } from "@/components/dashboard/Badges";
import { useEntityList } from "@/hooks/useEntityList";
import { formatDateTime } from "@/lib/format";

const TABS = ["All", "Open", "Critical"];

export const Route = createFileRoute("/_authed/alerts")({
  head: () => ({ meta: [{ title: "Alerts — RESQFLOW" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const [tab, setTab] = useState("All");
  const [busyId, setBusyId] = useState(null);
  const { items, loading, reload } = useEntityList("Alert", {}, { sort: "-detected_at", limit: 100 });

  const visible = items.filter((alert) => {
    if (tab === "Open") return alert.status === "open";
    if (tab === "Critical") return alert.severity === "critical";
    return true;
  });

  async function setStatus(alert, status) {
    setBusyId(alert.id);
    try {
      await base44.entities.Alert.update(alert.id, { status });
      await reload();
      toast.success(status === "acknowledged" ? "Alert acknowledged." : "Alert resolved.");
    } catch (error) {
      toast.error(error?.message || "Could not update the alert.");
    } finally {
      setBusyId(null);
    }
  }

  const openCount = items.filter((alert) => alert.status === "open").length;
  const criticalCount = items.filter((alert) => alert.severity === "critical" && alert.status !== "resolved").length;

  return (
    <div>
      <PageHeader
        eyebrow="Alerts"
        title="Response queue"
        description="Thermal alerts raised by the monitoring pipeline, ordered by detection time."
        actions={
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/50">
            {openCount} open · {criticalCount} critical
          </span>
        }
      />

      <div className="mb-4 flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1 sm:w-fit">
        {TABS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTab(option)}
            className={[
              "flex-1 rounded-lg px-4 py-1.5 text-[11px] transition-colors sm:flex-none",
              tab === option ? "bg-electric/20 text-[#a8d3fa]" : "text-mist/60 hover:text-soft",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {loading && <p className="py-12 text-center text-[13px] text-mist/50">Loading alerts…</p>}
        {!loading && visible.length === 0 && (
          <div className="rf-panel p-10 text-center">
            <BellRing className="mx-auto h-5 w-5 text-mist/40" />
            <p className="mt-3 text-[13px] text-mist/60">No alerts in this view.</p>
          </div>
        )}

        {visible.map((alert) => (
          <article key={alert.id} className="rf-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[13.5px] font-medium text-soft">{alert.title}</h3>
                <SeverityBadge value={alert.severity} />
                <StatusBadge value={alert.status} />
              </div>
              {alert.message && <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-mist/70">{alert.message}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mist/45">
                <span>{alert.site_name || "—"}</span>
                <span>{alert.region || "—"}</span>
                <span>{formatDateTime(alert.detected_at)}</span>
              </div>
            </div>

            {alert.status !== "resolved" && (
              <div className="flex shrink-0 gap-2">
                {alert.status === "open" && (
                  <button
                    type="button"
                    onClick={() => setStatus(alert, "acknowledged")}
                    disabled={busyId === alert.id}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 text-[11px] font-medium text-amber-200 transition-colors hover:bg-amber-400/20 disabled:opacity-60"
                  >
                    {busyId === alert.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Acknowledge
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStatus(alert, "resolved")}
                  disabled={busyId === alert.id}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 text-[11px] font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20 disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                  Resolve
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
