import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import BrandMark from "@/components/landing/BrandMark";

const EarthScene = lazy(() => import("@/components/landing/EarthScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQFLOW — Intelligent Monitoring. A Safer Tomorrow." },
      {
        name: "description",
        content: "Turning satellite intelligence into awareness through intelligent monitoring.",
      },
      { name: "theme-color", content: "#090D16" },
    ],
  }),
  component: CoverPage,
});

const ease = [0.22, 1, 0.36, 1];

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: 0.1 + i * 0.09, ease },
  }),
};

const TAGLINE = ["DETECT", "CLASSIFY", "MONITOR", "ALERT"];

function CoverPage() {
  const navigate = useNavigate();
  const explore = () => navigate({ to: "/explore" });

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-obsidian text-soft">
      {/* atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_78%_42%,rgba(23,43,77,0.85)_0%,rgba(9,13,22,0)_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_15%_15%,rgba(39,137,232,0.14)_0%,rgba(9,13,22,0)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_92%_88%,rgba(233,133,69,0.12)_0%,rgba(9,13,22,0)_70%)]" />
        <div className="rf-grid absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(75%_70%_at_50%_45%,black,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/25 to-transparent" />
      </div>

      <header className="relative z-20 flex items-center justify-between gap-4 px-6 py-6 sm:px-10 lg:px-14">
        <BrandMark />
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-mist sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            Systems nominal
          </span>
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-soft/80 transition-colors hover:text-champagne"
          >
            Sign in
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </header>

      {/* hero: text left, globe right */}
      <section className="relative z-10 mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-10 px-6 pb-12 pt-2 sm:px-10 md:grid-cols-[45fr_55fr] md:gap-8 md:pb-8 md:pt-0 lg:gap-10 lg:px-14 lg:pb-12">
        <div className="max-w-xl md:max-w-none md:pr-2 lg:pr-8">
          <motion.div variants={rise} custom={0} initial="hidden" animate="show">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-champagne/25 bg-champagne/[0.04] px-3.5 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-champagne" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne/90">
                Satellite thermal intelligence
              </span>
            </span>
          </motion.div>

          <motion.h1
            variants={rise}
            custom={1}
            initial="hidden"
            animate="show"
            className="mt-7 font-display text-[2.6rem] font-light leading-[1.06] tracking-[-0.03em] text-soft sm:text-6xl md:mt-6 md:text-[2.75rem] lg:mt-7 lg:text-[4.1rem]"
          >
            Intelligent
            <br />
            Monitoring.
            <br />
            <span className="font-accent italic font-normal text-champagne">A Safer Tomorrow.</span>
          </motion.h1>

          <motion.p
            variants={rise}
            custom={2}
            initial="hidden"
            animate="show"
            className="mt-7 max-w-md text-[15px] leading-relaxed text-mist sm:text-base md:mt-5 md:max-w-sm lg:mt-7 lg:max-w-md"
          >
            Turning satellite intelligence into awareness through intelligent monitoring.
          </motion.p>

          <motion.div
            variants={rise}
            custom={3}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.26em] text-soft/70 md:mt-6 lg:mt-8"
          >
            {TAGLINE.map((word, index) => (
              <span key={word} className="flex items-center gap-3">
                {index > 0 && <span className="h-1 w-1 rounded-full bg-ember/70" />}
                <span className={index === 0 ? "text-champagne/90" : ""}>{word}</span>
                {index < TAGLINE.length - 1 && <span className="text-mist/40">.</span>}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={rise}
            custom={4}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-7 lg:mt-10"
          >
            <button
              type="button"
              onClick={explore}
              className="group relative inline-flex h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full bg-electric px-8 text-sm font-medium text-white transition-all duration-300 hover:shadow-glow-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
            >
              <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-electric via-[#3f9bf0] to-ember/90 transition-transform duration-500 group-hover:translate-y-0" />
              <span className="relative">Explore</span>
              <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="inline-flex h-12 items-center justify-center rounded-full border border-champagne/25 px-8 text-sm font-medium text-champagne transition-all duration-300 hover:border-champagne/60 hover:bg-champagne/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/40"
            >
              Sign In
            </button>
          </motion.div>
        </div>

        {/* globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.25, ease }}
          className="relative mx-auto flex w-full max-w-[540px] items-center justify-center md:max-w-none"
        >
          <div className="relative aspect-square w-full max-w-[min(100%,calc(100vh-11rem))]">
            <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_38%_32%,rgba(39,137,232,0.30),rgba(23,43,77,0.16)_45%,rgba(9,13,22,0)_70%)] blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-[9%] rounded-full border border-white/[0.04]" />
            <div className="absolute inset-[16%] animate-spin-slow rounded-full border border-dashed border-champagne/10" />
            <div className="absolute inset-0">
              <ClientOnly fallback={<GlobeFallback />}>
                <Suspense fallback={<GlobeFallback />}>
                  <div className="h-full w-full animate-float-slow">
                    <EarthScene />
                  </div>
                </Suspense>
              </ClientOnly>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-2 border-t border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10 md:py-4 lg:px-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist/60">
          RESQFLOW · Thermal observation platform
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist/40">
          19.07° N · 72.87° E · Orbital sync active
        </p>
      </footer>
    </main>
  );
}

function GlobeFallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="relative h-[62%] w-[62%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#20405f,#0d1727_60%,#080c14)] shadow-[inset_-18px_-12px_50px_rgba(0,0,0,0.75),0_0_70px_-10px_rgba(39,137,232,0.5)]">
        <div className="absolute inset-0 animate-pulse-soft rounded-full border border-electric/30" />
      </div>
    </div>
  );
}
