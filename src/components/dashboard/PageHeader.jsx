export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-champagne/70">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-display text-2xl font-light tracking-tight text-soft sm:text-[28px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-mist/80">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
