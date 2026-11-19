import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/dashboard/PageHeader";
import { useAuth } from "@/lib/AuthContext";

const REGIONS = ["All regions", "Gujarat", "Madhya Pradesh", "Chhattisgarh", "Odisha", "Maharashtra", "Punjab", "Tamil Nadu"];

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12.5px] text-soft outline-none focus:border-electric/50";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings — RESQFLOW" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, refresh, logout } = useAuth();
  const [threshold, setThreshold] = useState(70);
  const [notifications, setNotifications] = useState(true);
  const [region, setRegion] = useState("All regions");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setThreshold(Number(user.alert_threshold ?? 70));
    setNotifications(user.notifications_enabled ?? true);
    setRegion(user.home_region || "All regions");
  }, [user]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({
        alert_threshold: Number(threshold),
        notifications_enabled: notifications,
        home_region: region,
      });
      await refresh();
      toast.success("Monitoring preferences saved.");
    } catch (error) {
      toast.error(error?.message || "Could not save your preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Your operator profile and the monitoring thresholds that drive alerting."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rf-panel p-5 lg:col-span-2">
          <h2 className="text-[14px] font-medium text-soft">Monitoring preferences</h2>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">Applies to your session</p>

          <form onSubmit={save} className="mt-5 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="alert-threshold" className="text-[12.5px] text-soft/90">
                  Alert confidence threshold
                </label>
                <span className="font-mono text-[12px] text-champagne">{threshold}%</span>
              </div>
              <input
                id="alert-threshold"
                type="range"
                min={40}
                max={95}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
                className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#2789E8]"
              />
              <p className="mt-2 text-[11px] text-mist/50">
                Detections below this confidence stay in the queue without raising an alert.
              </p>
            </div>

            <div>
              <label htmlFor="home-region" className="mb-2 block text-[12.5px] text-soft/90">
                Primary region
              </label>
              <select id="home-region" value={region} onChange={(event) => setRegion(event.target.value)} className={inputClass}>
                {REGIONS.map((option) => (
                  <option key={option} value={option} className="bg-[#0d1420]">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div>
                <p className="text-[12.5px] text-soft/90">Email alert notifications</p>
                <p className="mt-0.5 text-[11px] text-mist/50">Receive critical thermal alerts by email.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() => setNotifications((value) => !value)}
                className={[
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  notifications ? "bg-electric" : "bg-white/12",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    notifications ? "translate-x-[22px]" : "translate-x-0.5",
                  ].join(" ")}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-electric px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#3298f5] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : "Save preferences"}
            </button>
          </form>
        </section>

        <section className="rf-panel h-fit p-5">
          <h2 className="text-[14px] font-medium text-soft">Operator account</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-mist/50">Name</p>
              <p className="mt-1 text-[12.5px] text-soft">{user?.full_name || "Not set"}</p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-mist/50">Email</p>
              <p className="mt-1 truncate text-[12.5px] text-soft">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-mist/50">Role</p>
              <p className="mt-1 text-[12.5px] capitalize text-soft">{user?.role || "user"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-signal/30 bg-signal/[0.08] text-[12px] font-medium text-[#ffb3ad] transition-colors hover:bg-signal/15"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}
