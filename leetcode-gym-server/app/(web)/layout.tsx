"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, BarChart3, BookOpen, LogOut, User, Settings, ChevronDown } from "lucide-react";

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

// ─── Nav config (spec: Dashboard, Analytics, Study Plan, Settings) ──────────────
const navLinks = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/analytics",    label: "Analytics",   icon: BarChart3       },
  { href: "/study-plan",   label: "Study Plan",  icon: BookOpen        },
  { href: "/settings",     label: "Settings",    icon: Settings       },
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
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // ── App shell (Grindset: green accent, no blur) ─────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          height: "64px",
          padding: "16px 24px",
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="w-full max-w-5xl mx-auto h-full flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="w-8 h-8 rounded flex items-center justify-center border transition-all group-hover:opacity-90"
                style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}
              >
                <span className="font-black text-sm leading-none" style={{ color: "var(--green)" }}>λ</span>
              </div>
              <span className="font-bold text-xl tracking-tight transition-colors" style={{ color: "var(--text)" }}>
                Grindset
              </span>
            </Link>

            <nav
              className="hidden sm:flex items-center gap-0.5 rounded px-1.5 py-1.5 border"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[13px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-[var(--surface)] ${
                      active ? "text-black" : ""
                    }`}
                    style={
                      active
                        ? { backgroundColor: "var(--green)", color: "#000000" }
                        : { color: "var(--text-2)" }
                    }
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <nav className="sm:hidden flex items-center gap-0.5">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={label}
                      className={`p-2 rounded transition-all ${active ? "text-black" : ""}`}
                      style={
                        active
                          ? { backgroundColor: "var(--green)", color: "#000000" }
                          : { color: "var(--muted)" }
                      }
                    >
                      <Icon size={16} />
                    </Link>
                  );
                })}
              </nav>

              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen((p) => !p); }}
                    className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded border transition-all text-xs"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--text-2)",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border"
                      style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}
                    >
                      <span className="text-xs font-bold uppercase leading-none" style={{ color: "var(--green)" }}>
                        {user.email[0]}
                      </span>
                    </div>
                    <span className="hidden md:block max-w-[120px] truncate font-medium">{user.email}</span>
                    <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 w-48 rounded overflow-hidden py-1.5 border"
                      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Signed in as</p>
                        <p className="text-xs font-medium mt-0.5 truncate" style={{ color: "var(--text-2)" }}>{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs transition-colors hover:bg-[var(--card)]"
                        style={{ color: "var(--text-2)" }}
                      >
                        <User size={13} />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs transition-colors hover:bg-[var(--card)]"
                        style={{ color: "var(--text-2)" }}
                      >
                        <Settings size={13} />
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs transition-colors hover:bg-[var(--red-dim)] hover:text-[var(--red)]"
                        style={{ color: "var(--text-2)" }}
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
      </header>

      <main className="flex-1">
        <div className="w-full max-w-5xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>

      <footer className="border-t mt-auto" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="w-full max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded flex items-center justify-center border"
                style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}
              >
                <span className="font-black text-xs" style={{ color: "var(--green)" }}>λ</span>
              </div>
              <div>
                <p className="font-bold text-sm leading-none" style={{ color: "var(--text-2)" }}>Grindset</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Your DSA revision companion</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
              <Link href="/how-it-works" className="transition-colors hover:text-[var(--green)]">How it works</Link>
              <Link href="/settings" className="transition-colors hover:text-[var(--green)]">Settings</Link>
              <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--green)]">LeetCode ↗</a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Log workouts on LeetCode · Revise here · Ace the interview</p>
            <p className="text-xs" style={{ color: "var(--muted-2)" }}>© {new Date().getFullYear()} Grindset</p>
          </div>
        </div>
      </footer>
    </div>
  );
}