import { ClassificationBadge } from "@/components/dashboard/Badges";
import { formatDateTime, formatCoordinate } from "@/lib/format";

export default function ObservationTable({ items = [], loading = false, emptyLabel = "No observations match these filters." }) {
  return (
    <div className="rf-panel w-full overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Site", "Classification", "Source", "Confidence", "Detected"].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 font-mono text-[9px] font-normal uppercase tracking-[0.22em] text-mist/50"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-white/[0.04]">
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-mist/60">
                  {emptyLabel}
                </td>
              </tr>
            )}

            {!loading &&
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-soft">{item.site_name}</p>
                    <p className="mt-1 font-mono text-[10px] tracking-tight text-mist/50">
                      {formatCoordinate(item.latitude, item.longitude)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <ClassificationBadge value={item.classification} />
                  </td>
                  <td className="px-5 py-4 text-[12px] text-mist/80">{item.source || "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-electric to-champagne"
                          style={{ width: `${Math.min(100, Math.max(0, Number(item.confidence) || 0))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-mist/70">{Math.round(Number(item.confidence) || 0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-mist/60">{formatDateTime(item.detected_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
