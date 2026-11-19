import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/dashboard/PageHeader";
import { ClassificationBadge, StatusBadge } from "@/components/dashboard/Badges";
import { useEntityList } from "@/hooks/useEntityList";
import { useAuth } from "@/lib/AuthContext";
import { formatCoordinate, formatDateTime } from "@/lib/format";

const DECISIONS = [
  { value: "confirmed", label: "Confirm", icon: Check, className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20" },
  { value: "needs review", label: "Needs review", icon: ShieldCheck, className: "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20" },
  { value: "dismissed", label: "Dismiss", icon: X, className: "border-white/12 bg-white/[0.04] text-mist hover:bg-white/[0.08]" },
];

const STATUS_FOR_DECISION = { confirmed: "verified", dismissed: "dismissed", "needs review": "under review" };

export const Route = createFileRoute("/_authed/verification")({
  head: () => ({ meta: [{ title: "Verification centre — RESQFLOW" }] }),
  component: VerificationPage,
});

function VerificationPage() {
  const { user } = useAuth();
  const queue = useEntityList("Observation", { status: { $in: ["new", "under review"] } }, { sort: "-confidence", limit: 100 });
  const decisions = useEntityList("Verification", {}, { sort: "-reviewed_at", limit: 20 });
  const [busyId, setBusyId] = useState(null);

  async function decide(observation, decision) {
    setBusyId(observation.id);
    try {
      await base44.entities.Observation.update(observation.id, { status: STATUS_FOR_DECISION[decision] });
      await base44.entities.Verification.create({
        observation_id: observation.id,
        site_name: observation.site_name,
        decision,
        reviewer: user?.full_name || user?.email || "Operator",
        notes: `${observation.classification} at ${Math.round(Number(observation.confidence) || 0)}% confidence`,
        reviewed_at: new Date().toISOString(),
      });
      await queue.reload();
      await decisions.reload();
      toast.success(`Observation ${decision}.`);
    } catch (error) {
      toast.error(error?.message || "Could not record the decision.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Verification centre"
        title="Human review queue"
        description="Every automated detection is confirmed, escalated or dismissed by an operator before it enters the record."
        actions={
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/50">
            {queue.items.length} awaiting decision
          </span>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-2.5 xl:col-span-2">
          {queue.loading && <p className="py-12 text-center text-[13px] text-mist/50">Loading review queue…</p>}
          {!queue.loading && queue.items.length === 0 && (
            <div className="rf-panel p-10 text-center">
              <ShieldCheck className="mx-auto h-5 w-5 text-emerald-300/70" />
              <p className="mt-3 text-[13px] text-mist/60">Queue clear — every observation has been reviewed.</p>
            </div>
          )}

          {queue.items.map((observation) => (
            <article key={observation.id} className="rf-panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[13.5px] font-medium text-soft">{observation.site_name}</h3>
                  <p className="mt-1 font-mono text-[10px] tracking-tight text-mist/50">
                    {formatCoordinate(observation.latitude, observation.longitude)} · {observation.source}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ClassificationBadge value={observation.classification} />
                  <StatusBadge value={observation.status} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Confidence", value: `${Math.round(Number(observation.confidence) || 0)}%` },
                  { label: "FRP", value: `${Number(observation.frp || 0).toFixed(1)} MW` },
                  { label: "Detected", value: formatDateTime(observation.detected_at) },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-mist/50">{metric.label}</p>
                    <p className="mt-1 font-mono text-[11px] text-soft">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {DECISIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => decide(observation, option.value)}
                      disabled={busyId === observation.id}
                      className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 text-[11.5px] font-medium transition-colors disabled:opacity-60 ${option.className}`}
                    >
                      {busyId === observation.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <section className="rf-panel h-fit p-5">
          <h2 className="text-[14px] font-medium text-soft">Recent decisions</h2>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">Verification ledger</p>
          <div className="mt-4 space-y-2.5">
            {decisions.loading && <p className="py-6 text-center text-[12px] text-mist/50">Loading…</p>}
            {!decisions.loading && decisions.items.length === 0 && (
              <p className="py-6 text-center text-[12px] text-mist/50">No decisions recorded yet.</p>
            )}
            {decisions.items.map((record) => (
              <div key={record.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] text-soft">{record.site_name}</p>
                  <StatusBadge value={record.decision} />
                </div>
                <p className="mt-1.5 truncate text-[11px] text-mist/60">{record.notes}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-mist/40">
                  {record.reviewer} · {formatDateTime(record.reviewed_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
