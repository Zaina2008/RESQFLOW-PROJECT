import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Factory, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/Badges";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEntityList } from "@/hooks/useEntityList";
import { formatCoordinate } from "@/lib/format";

const FACILITY_TYPES = ["Refinery", "Steel plant", "Thermal power", "Chemical", "Cement", "Port terminal"];

const EMPTY_FORM = { name: "", facility_type: "Refinery", operator: "", region: "", latitude: "", longitude: "" };

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12.5px] text-soft placeholder:text-mist/40 outline-none focus:border-electric/50";

export const Route = createFileRoute("/_authed/industrial-facilities")({
  head: () => ({ meta: [{ title: "Industrial facilities — RESQFLOW" }] }),
  component: IndustrialFacilitiesPage,
});

function IndustrialFacilitiesPage() {
  const { items, loading, reload } = useEntityList("Facility", {}, { sort: "name", limit: 100 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function createFacility(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Give the facility a name.");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Facility.create({
        name: form.name.trim(),
        facility_type: form.facility_type,
        operator: form.operator.trim(),
        region: form.region.trim(),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        status: "monitored",
        heat_signatures: 0,
      });
      await reload();
      setForm(EMPTY_FORM);
      setOpen(false);
      toast.success("Facility added to the monitoring network.");
    } catch (error) {
      toast.error(error?.message || "Could not add the facility.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(facility) {
    setBusyId(facility.id);
    try {
      await base44.entities.Facility.update(facility.id, {
        status: facility.status === "paused" ? "monitored" : "paused",
      });
      await reload();
    } catch (error) {
      toast.error(error?.message || "Could not update the facility.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Industrial facilities"
        title="Monitored network"
        description="Every industrial site under thermal observation, with its live heat-signature count."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-electric px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#3298f5]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add facility
              </button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-[#0d1420] text-soft sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-lg font-light">Add a facility</DialogTitle>
                <DialogDescription className="text-[12px] text-mist/70">
                  New sites immediately join the monitoring network.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createFacility} className="mt-2 space-y-3">
                <input value={form.name} onChange={update("name")} placeholder="Facility name" className={inputClass} />
                <select value={form.facility_type} onChange={update("facility_type")} className={inputClass}>
                  {FACILITY_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#0d1420]">
                      {type}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.operator} onChange={update("operator")} placeholder="Operator" className={inputClass} />
                  <input value={form.region} onChange={update("region")} placeholder="Region" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.latitude} onChange={update("latitude")} placeholder="Latitude" type="number" step="any" className={inputClass} />
                  <input value={form.longitude} onChange={update("longitude")} placeholder="Longitude" type="number" step="any" className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-electric text-[12.5px] font-medium text-white transition-colors hover:bg-[#3298f5] disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {saving ? "Adding…" : "Add to network"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="col-span-full py-12 text-center text-[13px] text-mist/50">Loading facilities…</p>}
        {!loading && items.length === 0 && (
          <div className="rf-panel col-span-full p-10 text-center">
            <Factory className="mx-auto h-5 w-5 text-mist/40" />
            <p className="mt-3 text-[13px] text-mist/60">No facilities yet — add the first site to start monitoring.</p>
          </div>
        )}

        {items.map((facility) => (
          <article key={facility.id} className="rf-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-medium text-soft">{facility.name}</h3>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-mist/50">{facility.facility_type}</p>
              </div>
              <StatusBadge value={facility.status} />
            </div>

            <div className="mt-4 space-y-1.5 text-[12px] text-mist/70">
              <p>{facility.operator || "Operator not recorded"}</p>
              <p className="font-mono text-[10px] tracking-tight text-mist/45">
                {facility.region || "Region unknown"} · {formatCoordinate(facility.latitude, facility.longitude)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <div>
                <p className="font-display text-xl font-light text-champagne">{facility.heat_signatures || 0}</p>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-mist/50">Heat signatures</p>
              </div>
              <button
                type="button"
                onClick={() => toggleStatus(facility)}
                disabled={busyId === facility.id}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-[11px] text-mist/80 transition-colors hover:border-white/25 hover:text-soft disabled:opacity-60"
              >
                {busyId === facility.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {facility.status === "paused" ? "Resume" : "Pause"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
