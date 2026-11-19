import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BellRing,
  Fingerprint,
  Layers,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import BrandMark from "@/components/landing/BrandMark";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "About RESQFLOW — Satellite thermal intelligence" },
      {
        name: "description",
        content:
          "RESQFLOW turns open satellite thermal data into clear, verifiable awareness of industrial and environmental heat events. Learn what this website offers and how to sign in.",
      },
      { name: "theme-color", content: "#090D16" },
    ],
  }),
  component: ExplorePage,
});

const ease = [0.22, 1, 0.36, 1];

const rise = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.06 + i * 0.07, ease } }),
};

const FEATURES = [
  {
    icon: Satellite,
    title: "Thermal monitoring",
    body: "Open satellite thermal detections are gathered continuously and presented in one readable stream, with source, confidence and location attached.",
  },
  {
    icon: Fingerprint,
    title: "Classification",
    body: "Each detection is typed and profiled against the site it belongs to, so routine industrial heat is separated from the unusual.",
  },
  {
    icon: Layers,
    title: "Evidence fusion",
    body: "Independent sensors are cross-referenced, so an event only reaches a person once more than one source agrees it is real.",
  },
  {
    icon: ShieldCheck,
    title: "Human verification",
    body: "Reviewers confirm or dismiss every event. Confirmed incidents raise alerts for the teams that respond.",
  },
  {
    icon: BellRing,
    title: "Alerts & response",
    body: "A single response queue keeps severity, ownership and acknowledgement status visible until each incident is closed.",
  },
];

const STEPS = [
  { step: "01", title: "Read about the platform", body: "This page explains what RESQFLOW does and who it is for." },
  { step: "02", title: "Sign in securely", body: "Access is granted to registered members with an email and password." },
  { step: "03", title: "Enter your workspace", body: "After sign-in you continue to the monitoring dashboard." },
];

function ExplorePage() {
  const navigate = useNavigate();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-obsidian text-soft">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_80%_0%,rgba(23,43,77,0.85)_0%,rgba(9,13,22,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_10%_10%,rgba(39,137,232,0.12)_0%,rgba(9,13,22,0)_70%)]" />
        <div className="rf-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/25 to-transparent" />
      </div>

      <header className="relative z-20 flex items-center justify-between gap-4 px-6 py-6 sm:px-10 lg:px-14">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <BrandMark />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mist/70 transition-colors hover:text-champagne sm:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cover
          </Link>
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-champagne/25 px-5 text-[11px] font-medium uppercase tracking-[0.2em] text-champagne transition-all duration-300 hover:border-champagne/60 hover:bg-champagne/[0.06]"
          >
            Sign In
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-[1120px] px-6 pb-14 pt-6 sm:px-10 lg:px-14 lg:pt-10">
        <motion.p
          variants={rise}
          custom={0}
          initial="hidden"
          animate="show"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-champagne/70"
        >
          About this website
        </motion.p>

        <motion.h1
          variants={rise}
          custom={1}
          initial="hidden"
          animate="show"
          className="mt-5 max-w-3xl font-display text-[2.1rem] font-light leading-[1.1] tracking-[-0.02em] text-soft sm:text-[2.9rem] lg:text-[3.3rem]"
        >
          Satellite intelligence,
          <br />
          <span className="font-accent italic font-normal text-champagne">made understandable.</span>
        </motion.h1>

        <motion.p
          variants={rise}
          custom={2}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-2xl text-[15px] leading-relaxed text-mist sm:text-base"
        >
          RESQFLOW is a web platform that turns open satellite thermal data into clear, verifiable
          awareness of industrial and environmental heat events around the world.
        </motion.p>

        <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2">
          <motion.div variants={rise} custom={3} initial="hidden" animate="show" className="rf-panel p-6 sm:p-7">
            <h2 className="font-display text-[17px] font-medium tracking-tight text-soft">What this website is</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-mist/85">
              This website introduces RESQFLOW and gives registered teams one place to watch for heat
              anomalies, understand what they mean and respond with confidence.
            </p>
          </motion.div>
          <motion.div variants={rise} custom={4} initial="hidden" animate="show" className="rf-panel p-6 sm:p-7">
            <h2 className="font-display text-[17px] font-medium tracking-tight text-soft">What to expect</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-mist/85">
              Visitors can read how the platform works. Signed-in members continue into the monitoring
              workspace, where live observations, maps and response tools are available.
            </p>
          </motion.div>
        </div>

        <div className="mt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-champagne/70">Platform overview</p>
          <h2 className="mt-4 font-display text-[1.55rem] font-light tracking-tight text-soft sm:text-[1.9rem]">
            The main features, in plain terms
          </h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }, index) => (
              <motion.article
                key={title}
                variants={rise}
                custom={index}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="rf-panel flex flex-col p-5 sm:p-6"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03]">
                  <Icon className="h-4 w-4 text-electric" />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-medium tracking-tight text-soft">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mist/80">{body}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-champagne/70">Getting started</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="border-t border-white/[0.08] pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne/60">{step}</span>
                <h3 className="mt-2 font-display text-[15px] font-medium text-soft">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mist/80">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 rounded-2xl border border-electric/20 bg-[linear-gradient(120deg,rgba(39,137,232,0.12),rgba(233,133,69,0.06))] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div>
            <h2 className="font-display text-[1.3rem] font-light tracking-tight text-soft">
              Access the monitoring workspace
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-mist/85">
              Accounts are issued to monitoring and response teams. Sign in with your email and password
              to continue to the dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full bg-electric px-8 text-sm font-medium text-white transition-all duration-300 hover:shadow-glow-blue"
          >
            Sign In
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col gap-2 border-t border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10 md:py-4 lg:px-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist/60">
          RESQFLOW · Thermal observation platform
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist/40">Public information page</p>
      </footer>
    </main>
  );
}
