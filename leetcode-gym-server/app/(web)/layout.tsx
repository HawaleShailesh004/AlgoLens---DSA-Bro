"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, HelpCircle, Settings, ChevronDown } from "lucide-react";

// ─── Auth helpers (unchanged) ─────────────────────────────────────────────────
const WEB_TOKEN_KEY = "gymToken";
const WEB_USER_KEY  = "gymUser";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WEB_TOKEN_KEY);
}

export function setStoredAuth(token: string, user: { id: string; email: string }) {
  localStorage.setItem(WEB_TOKEN_KEY, token);
  localStorage.setItem(WEB_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(WEB_TOKEN_KEY);
  localStorage.removeItem(WEB_USER_KEY);
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const navLinks = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/how-it-works", label: "How it works", icon: HelpCircle      },
  { href: "/settings",     label: "Settings",     icon: Settings         },
];

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function WebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [mounted,         setMounted]         = useState(false);
  const [user,            setUser]            = useState<{ id: string; email: string } | null>(null);
  const [userMenuOpen,    setUserMenuOpen]    = useState(false);
  const [scrolled,        setScrolled]        = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(WEB_USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { clearStoredAuth(); }

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-login when opening site from extension with ?token= in URL
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (!tokenFromUrl) return;
    try {
      const payloadPart = tokenFromUrl.split(".")[1];
      if (!payloadPart) return;
      const payloadJson = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson) as { sub?: string; email?: string };
      const id = payload.sub;
      const email = payload.email ?? "";
      if (id) {
        setStoredAuth(tokenFromUrl, { id, email });
        setUser({ id, email });
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    } catch {
      // ignore invalid token
    }
  }, [mounted]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    router.push("/login");
  };

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  // ── Auth pages: bare shell ─────────────────────────────────────────────────
  if (!mounted || isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // ── App shell ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-xl shadow-slate-950/50"
            : "bg-slate-950/60 backdrop-blur-md border-b border-slate-800/40"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center group-hover:bg-violet-500/22 group-hover:border-violet-500/40 transition-all">
                <span className="text-violet-300 font-black text-sm leading-none">λ</span>
              </div>
              <span className="font-bold text-base text-slate-100 tracking-tight group-hover:text-white transition-colors">
                AlgoLens
              </span>
            </Link>

            {/* Centre nav */}
            <nav className="hidden sm:flex items-center gap-0.5 bg-slate-900/50 border border-slate-800/60 rounded-xl px-1.5 py-1.5">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      active
                        ? "bg-violet-600/90 text-white shadow-sm shadow-violet-900/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-violet-200" : ""} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: user + logout */}
            <div className="flex items-center gap-2">

              {/* Mobile nav (icon-only pills) */}
              <nav className="sm:hidden flex items-center gap-0.5">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={label}
                      className={`p-2 rounded-lg transition-all ${
                        active
                          ? "bg-violet-600/80 text-white"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Icon size={16} />
                    </Link>
                  );
                })}
              </nav>

              {/* User email / logout menu */}
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setUserMenuOpen(p => !p); }}
                    className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-xs text-slate-400 hover:text-slate-200"
                  >
                    {/* Avatar dot */}
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-violet-300 uppercase leading-none">
                        {user.email[0]}
                      </span>
                    </div>
                    <span className="hidden md:block max-w-[120px] truncate font-medium">
                      {user.email}
                    </span>
                    <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950/80 overflow-hidden py-1.5"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-800/80">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                      >
                        <Settings size={13} />
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/8 transition-colors"
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/12 border border-violet-500/20 flex items-center justify-center">
                <span className="text-violet-400 font-black text-xs">λ</span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-300 leading-none">AlgoLens</p>
                <p className="text-xs text-slate-600 mt-0.5">Your DSA revision companion</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link
                href="/how-it-works"
                className="hover:text-violet-400 transition-colors"
              >
                How it works
              </Link>
              <Link
                href="/settings"
                className="hover:text-violet-400 transition-colors"
              >
                Settings
              </Link>
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-violet-400 transition-colors"
              >
                LeetCode ↗
              </a>
            </div>
          </div>

          {/* Divider + tagline */}
          <div className="mt-6 pt-5 border-t border-slate-800/40 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-600">
              Log workouts on LeetCode · Revise here · Ace the interview
            </p>
            <p className="text-xs text-slate-700">
              © {new Date().getFullYear()} AlgoLens
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}