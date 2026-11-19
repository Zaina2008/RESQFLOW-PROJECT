import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/dashboard/PageHeader";
import { ClassificationBadge } from "@/components/dashboard/Badges";
import { useEntityList } from "@/hooks/useEntityList";
import { groupBySite } from "@/lib/monitoring";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/_authed/thermal-fingerprinting")({
  head: () => ({ meta: [{ title: "Thermal fingerprinting — RESQFLOW" }] }),
  component: ThermalFingerprintingPage,
});

function ThermalFingerprintingPage() {
  const { items, loading } = useEntityList("Observation", {}, { sort: "-detected_at", limit: 300 });

  const fingerprints = groupBySite(items)
    .map((site) => {
      const count = site.observations.length;
      const avgBrightness = site.observations.reduce((sum, o) => sum + Number(o.brightness || 0), 0) / (count || 1);
      const avgFrp = site.observations.reduce((sum, o) => sum + Number(o.frp || 0), 0) / (count || 1);
      const dominant = site.observations.reduce((acc, o) => {
        acc[o.classification] = (acc[o.classification] || 0) + 1;
        return acc;
      }, {});
      const signature = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        ...site,
        count,
        avgBrightness: Math.round(avgBrightness),
        avgFrp: Number(avgFrp.toFixed(1)),
        signature,
      };
    })
    .sort((a, b) => b.avgFrp - a.avgFrp);

  const chartData = fingerprints.slice(0, 7).map((site) => ({ name: site.site_name, frp: site.avgFrp }));

  return (
    <div>
      <PageHeader
        eyebrow="Thermal fingerprinting"
        title="Signature profiles by site"
        description="Recurring heat behaviour per location — brightness temperature and radiative power establish a baseline fingerprint."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rf-panel p-5 lg:col-span-2">
          <h2 className="text-[14px] font-medium text-soft">Mean radiative power</h2>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">Top sites · MW</p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="rgba(155,168,186,0.10)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#9BA8BA", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={54} />
                <YAxis tick={{ fill: "#9BA8BA", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, color: "#F4F6FA" }}
                />
                <Bar dataKey="frp" name="Mean FRP" fill="#E98545" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rf-panel overflow-hidden lg:col-span-3">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-[14px] font-medium text-soft">Fingerprint register</h2>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">
              {loading ? "Loading…" : `${fingerprints.length} sites profiled`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Site", "Dominant signature", "Brightness", "Mean FRP", "Detections"].map((heading) => (
                    <th key={heading} className="px-5 py-3 font-mono text-[9px] font-normal uppercase tracking-[0.2em] text-mist/50">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fingerprints.map((site) => (
                  <tr key={site.site_name} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <p className="text-soft">{site.site_name}</p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist/40">{site.region || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <ClassificationBadge value={site.signature} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-mist/70">{site.avgBrightness} K</td>
                    <td className="px-5 py-3.5 font-mono text-champagne">{site.avgFrp} MW</td>
                    <td className="px-5 py-3.5 font-mono text-mist/60">{formatNumber(site.count)}</td>
                  </tr>
                ))}
                {!loading && fingerprints.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-mist/60">
                      No fingerprint data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
