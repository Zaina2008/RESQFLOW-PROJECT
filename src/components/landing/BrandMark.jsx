export default function BrandMark({ className = "" }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-full border border-champagne/30">
        <span className="absolute inset-[5px] rounded-full border border-electric/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-champagne shadow-[0_0_12px_2px_rgba(233,223,200,0.55)]" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[0.34em] text-soft">RESQFLOW</span>
    </span>
  );
}
