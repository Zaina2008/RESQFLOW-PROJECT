import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { MfaFlow } from "@/components/auth/MfaFlow";
import { MfaScreen } from "@/components/auth/MfaParts";
import { loginWithMfa } from "@/lib/authMfa";
import { signInWithProvider } from "@/lib/authMfaFlow";
import { returnToSearch, safeReturnTo } from "@/lib/authReturnTo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const resolved = safeReturnTo();
  // The cover page is not a destination after signing in — go straight to the dashboard.
  const returnTo = resolved === "/" ? "/dashboard" : resolved;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setFieldErrors(next);
    if (Object.keys(next).length) return;

    setError("");
    setBusy(true);
    try {
      const result = await loginWithMfa(email.trim(), password);
      if (result.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      // A hard redirect: the app re-initializes with the new session.
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Unable to sign in. Check your email and password.");
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setGoogleBusy(true);
    try {
      await signInWithProvider("google", returnTo);
    } catch (err) {
      setError(err.message || "Google sign-in is unavailable right now.");
      setGoogleBusy(false);
    }
  }

  // The second sign-in step (authenticator app or text message) replaces the whole page.
  if (mfaChallenge) {
    return (
      <MfaScreen>
        <MfaFlow challenge={mfaChallenge} returnTo={returnTo} />
      </MfaScreen>
    );
  }

  return (
    <main className="relative flex min-h-screen bg-obsidian text-soft">
      {/* brand panel */}
      <aside className="relative hidden w-[46%] max-w-[620px] flex-col justify-between overflow-hidden border-r border-white/[0.06] px-12 py-10 lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_30%_20%,rgba(23,43,77,0.9),rgba(9,13,22,1))]" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_85%,rgba(233,133,69,0.14),transparent_70%)]" />
          <div className="rf-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_40%_40%,black,transparent)]" />
          <div className="absolute -right-40 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full border border-electric/15" />
          <div className="absolute -right-24 top-1/2 h-[380px] w-[380px] -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-champagne/15" />
          <div className="absolute right-16 top-1/2 h-[210px] w-[210px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#1d4568,#0b1420_65%)] shadow-[inset_-20px_-16px_60px_rgba(0,0,0,0.8),0_0_80px_-16px_rgba(39,137,232,0.55)]" />
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-champagne/30">
            <span className="absolute inset-[5px] rounded-full border border-electric/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
          </span>
          <span className="font-display text-[13px] font-semibold tracking-[0.32em] text-soft">RESQFLOW</span>
        </Link>

        <div className="relative max-w-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-champagne/70">Secure access</p>
          <h2 className="mt-4 font-display text-[34px] font-light leading-[1.15] tracking-tight text-soft">
            Mission control for
            <span className="font-accent italic text-champagne"> thermal awareness.</span>
          </h2>
          <p className="mt-4 text-[13px] leading-relaxed text-mist/80">
            Sign in to monitor live detections, verify observations and coordinate response across every facility in
            your network.
          </p>
        </div>

        <p className="relative font-mono text-[9px] uppercase tracking-[0.24em] text-mist/40">
          RESQFLOW · Thermal observation platform
        </p>
      </aside>

      {/* form panel */}
      <section className="relative flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/25 to-transparent lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="relative grid h-8 w-8 place-items-center rounded-full border border-champagne/30">
                <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
              </span>
              <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-soft">RESQFLOW</span>
            </Link>
            <Link to="/" className="text-[11px] text-mist/60 hover:text-champagne">
              Cover
            </Link>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-champagne/70">Welcome back</p>
          <h1 className="mt-3 font-display text-[30px] font-light tracking-tight text-soft">Sign in to RESQFLOW</h1>
          <p className="mt-2 text-[13px] text-mist/70">Access your monitoring workspace.</p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-signal/30 bg-signal/[0.08] px-3.5 py-3 text-[12px] text-[#ffb3ad]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.22em] text-mist/60">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/50" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@resqflow.io"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={!!fieldErrors.email}
                  className={`h-12 w-full rounded-xl border bg-white/[0.03] pl-10 pr-3 text-[13px] text-soft placeholder:text-mist/40 transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? "border-signal/50 focus:ring-signal/30"
                      : "border-white/10 focus:border-electric/50 focus:ring-electric/25"
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="mt-1.5 text-[11px] text-signal">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="login-password" className="font-mono text-[9px] uppercase tracking-[0.22em] text-mist/60">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  search={returnToSearch(returnTo)}
                  className="text-[11px] text-electric/90 transition-colors hover:text-champagne"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/50" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  className={`h-12 w-full rounded-xl border bg-white/[0.03] pl-10 pr-11 text-[13px] text-soft placeholder:text-mist/40 transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? "border-signal/50 focus:ring-signal/30"
                      : "border-white/10 focus:border-electric/50 focus:ring-electric/25"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-mist/60 transition-colors hover:text-soft"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1.5 text-[11px] text-signal">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={busy || googleBusy}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-electric text-[13px] font-medium text-white transition-all duration-300 hover:bg-[#3298f5] hover:shadow-glow-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/[0.08]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mist/40">or continue with</span>
            <span className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy || googleBusy}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.02] text-[13px] font-medium text-soft transition-colors hover:border-white/25 hover:bg-white/[0.05] disabled:opacity-60"
          >
            {googleBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}
            Continue with Google
          </button>

          <p className="mt-8 text-center text-[12px] text-mist/60">
            Need an account?{" "}
            <Link to="/register" search={returnToSearch(returnTo)} className="text-electric/90 hover:text-champagne">
              Request access
            </Link>
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-[11px] text-mist/40 transition-colors hover:text-mist/80">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to cover
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
