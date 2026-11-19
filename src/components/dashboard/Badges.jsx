const CLASS_STYLES = {
  "Industrial fire": "border-signal/35 bg-signal/12 text-[#ffa39d]",
  "Industrial heat": "border-ember/35 bg-ember/12 text-[#ffc79a]",
  "Forest fire": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  "Agri burning": "border-purple-400/35 bg-purple-400/10 text-purple-200",
};

const SEVERITY_STYLES = {
  critical: "border-signal/40 bg-signal/12 text-[#ffa39d]",
  warning: "border-ember/40 bg-ember/12 text-[#ffc79a]",
  information: "border-electric/35 bg-electric/10 text-[#9ecbf7]",
};

const STATUS_STYLES = {
  new: "border-electric/35 bg-electric/10 text-[#9ecbf7]",
  "under review": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  verified: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  dismissed: "border-white/12 bg-white/[0.04] text-mist",
  open: "border-signal/35 bg-signal/10 text-[#ffa39d]",
  acknowledged: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  resolved: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  confirmed: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  "needs review": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  monitored: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  paused: "border-white/12 bg-white/[0.04] text-mist",
};

function Pill({ children, className }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${className}`}
    >
      {children}
    </span>
  );
}

export function ClassificationBadge({ value }) {
  return <Pill className={CLASS_STYLES[value] || STATUS_STYLES.dismissed}>{value || "Unclassified"}</Pill>;
}

export function SeverityBadge({ value }) {
  return <Pill className={SEVERITY_STYLES[value] || STATUS_STYLES.dismissed}>{value || "—"}</Pill>;
}

export function StatusBadge({ value }) {
  return <Pill className={STATUS_STYLES[value] || STATUS_STYLES.dismissed}>{value || "—"}</Pill>;
}

export const CLASSIFICATION_COLORS = {
  "Industrial fire": "#E6534B",
  "Industrial heat": "#E98545",
  "Forest fire": "#E9B949",
  "Agri burning": "#A78BFA",
};
