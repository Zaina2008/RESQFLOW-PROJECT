const ACCENTS = {
  electric: "text-electric border-electric/25 bg-electric/[0.08]",
  ember: "text-ember border-ember/25 bg-ember/[0.08]",
  signal: "text-signal border-signal/25 bg-signal/[0.08]",
  champagne: "text-champagne border-champagne/25 bg-champagne/[0.08]",
  steel: "text-[#9fc3ea] border-steel bg-steel/30",
};

export default function StatCard({ label, value, hint, icon: Icon, accent = "electric" }) {
  return (
    <div className="rf-panel relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-mist/60">{label}</p>
          <p className="mt-3 font-display text-3xl font-light tracking-tight text-soft">{value}</p>
          {hint && <p className="mt-1.5 text-[11px] text-mist/60">{hint}</p>}
        </div>
        {Icon && (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${ACCENTS[accent]}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}
