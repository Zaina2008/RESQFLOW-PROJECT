import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Radio, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { NAV_ITEMS } from "./navItems";

function BrandMark() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3">
      <span className="relative grid h-9 w-9 place-items-center rounded-full border border-champagne/30">
        <span className="absolute inset-[5px] rounded-full border border-electric/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-champagne shadow-[0_0_12px_2px_rgba(233,223,200,0.5)]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[13px] font-semibold tracking-[0.3em] text-soft">RESQFLOW</span>
        <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-mist/60">Thermal intelligence</span>
      </span>
    </Link>
  );
}

function NavList({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={[
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200",
              active
                ? "bg-electric/[0.12] text-soft"
                : "text-mist/80 hover:bg-white/[0.04] hover:text-soft",
            ].join(" ")}
          >
            <span
              className={[
                "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full transition-opacity",
                active ? "bg-electric opacity-100" : "opacity-0",
              ].join(" ")}
            />
            <Icon
              className={[
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-electric" : "text-mist/60 group-hover:text-champagne/80",
              ].join(" ")}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AccountBlock({ user, onLogout }) {
  const name = user?.full_name || user?.email || "Operator";
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="border-t border-white/[0.06] p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-steel/40 text-[11px] font-medium text-champagne">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-soft">{name}</p>
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-mist/50">
            {user?.role || "operator"}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          className="rounded-lg p-2 text-mist/60 transition-colors hover:bg-white/[0.06] hover:text-signal"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-obsidian text-soft">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_85%_-10%,rgba(23,43,77,0.55),rgba(9,13,22,0)_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(60%_100%_at_20%_100%,rgba(39,137,232,0.08),rgba(9,13,22,0)_70%)]" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-white/[0.06] bg-[#0a111d]/95 lg:flex">
        <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
          <BrandMark />
        </div>
        <NavList pathname={pathname} />
        <AccountBlock user={user} onLogout={logout} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-[280px] flex-col border-r border-white/10 bg-[#0a111d]">
            <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
              <BrandMark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-mist/70 hover:bg-white/[0.06] hover:text-soft"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
            <AccountBlock user={user} onLogout={logout} />
          </div>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/[0.06] bg-obsidian/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-white/10 p-2 text-mist/80 transition-colors hover:text-soft lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist/60 sm:flex">
              <Radio className="h-3.5 w-3.5 text-electric" />
              Live monitoring
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/90">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Sources synced
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-mist/40 md:inline">
              {user?.email || ""}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
