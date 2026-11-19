import { CLASSIFICATION_COLORS } from "@/components/dashboard/Badges";
import { formatNumber } from "@/lib/format";

export default function ClassificationChart({ data = [] }) {
  const total = data.reduce((sum, row) => sum + (Number(row.count) || 0), 0);

  if (!data.length) {
    return <p className="py-10 text-center text-[13px] text-mist/60">No detections recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((row) => {
        const count = Number(row.count) || 0;
        const share = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={row.classification || row.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-[12px] text-soft/90">{row.classification || row.label}</span>
              <span className="font-mono text-[11px] text-mist/60">
                {formatNumber(count)} · {share}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${share}%`,
                  background: CLASSIFICATION_COLORS[row.classification || row.label] || "#2789E8",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
