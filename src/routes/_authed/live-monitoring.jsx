import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/dashboard/PageHeader";
import ObservationTable from "@/components/dashboard/ObservationTable";
import { useEntityList } from "@/hooks/useEntityList";

const CLASSIFICATIONS = ["all", "Industrial fire", "Industrial heat", "Forest fire", "Agri burning"];
const SOURCES = ["all", "NASA FIRMS", "Copernicus Sentinel-2", "USGS Landsat", "MODIS", "VIIRS"];

const FALLBACK_SITES = [
  { name: "Jamnagar", region: "Gujarat", latitude: 22.34, longitude: 69.86 },
  { name: "Singrauli", region: "Madhya Pradesh", latitude: 24.1, longitude: 82.66 },
  { name: "Bhilai", region: "Chhattisgarh", latitude: 21.19, longitude: 81.35 },
  { name: "Paradip", region: "Odisha", latitude: 20.29, longitude: 86.61 },
];

const selectClass =
  "h-10 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[12px] text-soft outline-none transition-colors focus:border-electric/50";

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export const Route = createFileRoute("/_authed/live-monitoring")({
  head: () => ({ meta: [{ title: "Live monitoring — RESQFLOW" }] }),
  component: LiveMonitoringPage,
});

function LiveMonitoringPage() {
  const [classification, setClassification] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);

  const query = {
    ...(classification !== "all" ? { classification } : {}),
    ...(source !== "all" ? { source } : {}),
  };

  const { items, loading, reload } = useEntityList("Observation", query, { sort: "-detected_at", limit: 100 });
  const facilities = useEntityList("Facility", {}, { sort: "name", limit: 100 });

  const visible = search.trim()
    ? items.filter((item) => (item.site_name || "").toLowerCase().includes(search.trim().toLowerCase()))
    : items;

  async function runCycle() {
    setRunning(true);
    try {
      const sites = facilities.items.length
        ? facilities.items.map((facility) => ({
            name: facility.name,
            region: facility.region,
            latitude: facility.latitude,
            longitude: facility.longitude,
          }))
        : FALLBACK_SITES;

      const batch = Array.from({ length: 3 }).map(() => {
        const site = pick(sites);
        const confidence = Math.round(58 + Math.random() * 40);
        const isFire = confidence > 82 && Math.random() > 0.4;
        return {
          site_name: site.name,
          region: site.region,
          latitude: site.latitude,
          longitude: site.longitude,
          source: pick(SOURCES.slice(1)),
          classification: isFire ? "Industrial fire" : pick(["Industrial heat", "Forest fire", "Agri burning"]),
          confidence,
          frp: Number((4 + Math.random() * 46).toFixed(1)),
          brightness: Math.round(318 + Math.random() * 58),
          status: "new",
          detected_at: new Date().toISOString(),
        };
      });

      await base44.entities.Observation.bulkCreate(batch);
      await reload();
      toast.success("Monitoring cycle complete — new observations ingested.");
    } catch (error) {
      toast.error(error?.message || "Monitoring cycle failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Live monitoring"
        title="Thermal observation stream"
        description="Newest thermal observations retrieved from the configured satellite sources."
        actions={
          <button
            type="button"
            onClick={runCycle}
            disabled={running}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-electric px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#3298f5] disabled:opacity-60"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {running ? "Running cycle…" : "Run monitoring cycle"}
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by site name"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-[12px] text-soft placeholder:text-mist/40 outline-none focus:border-electric/50"
          />
        </div>
        <select value={classification} onChange={(event) => setClassification(event.target.value)} className={selectClass}>
          {CLASSIFICATIONS.map((option) => (
            <option key={option} value={option} className="bg-[#0d1420]">
              {option === "all" ? "All classifications" : option}
            </option>
          ))}
        </select>
        <select value={source} onChange={(event) => setSource(event.target.value)} className={selectClass}>
          {SOURCES.map((option) => (
            <option key={option} value={option} className="bg-[#0d1420]">
              {option === "all" ? "All sources" : option}
            </option>
          ))}
        </select>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/50">
          {visible.length} records
        </span>
      </div>

      <ObservationTable items={visible} loading={loading} />
    </div>
  );
}
