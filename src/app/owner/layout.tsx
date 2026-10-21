"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Box,
  FileText,
  Calendar,
  Settings,
  MailCheck,
  Image,
  ExternalLink,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/owner", icon: LayoutDashboard },
  { label: "Products", href: "/owner/products", icon: Box },
  { label: "Updates", href: "/owner/updates", icon: FileText },
  { label: "Events", href: "/owner/events", icon: Calendar },
  { label: "Settings", href: "/owner/settings", icon: Settings },
  { label: "Inquiries", href: "/owner/inquiries", icon: MailCheck },
  { label: "Media", href: "/owner/media", icon: Image },
  { label: "Legacy Admin", href: "/admin", icon: ExternalLink },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
        <span className="text-xs font-mono tracking-widest uppercase">Verifying Studio Session...</span>
      </div>
    );
  }

  const isOwnerOrAdmin =
    session &&
    ((session.user as any)?.role === "OWNER" ||
      (session.user as any)?.role === "ADMIN" ||
      session.user?.email);

  if (!isOwnerOrAdmin) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);
      setSubmitting(true);

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      setSubmitting(false);
      if (res?.error) {
        setAuthError("Invalid master credentials. Access denied.");
      }
    };

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
              <Lock className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide text-zinc-100">HAYP.STUDIOS</h1>
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Owner Access Gateway</p>
            </div>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                Owner Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paulescuadra25@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                Master Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Enter Studio Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-zinc-800/80 text-center">
            <p className="text-[11px] text-zinc-600 font-mono">
              Unadvertised administrative interface. Unauthorized access is recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/owner" });
    setLoggingOut(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-zinc-900/40 border-r border-zinc-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-sm font-bold tracking-wider text-zinc-100 block">HAYP.STUDIOS</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Master Operating System</span>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-zinc-800 text-zinc-100 font-medium border border-zinc-700/60 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-zinc-100" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-zinc-200 truncate">
                {session?.user?.name || "Paul Escuadra"}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                {(session?.user as any)?.role || "Owner"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-transparent hover:border-red-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-950/60 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <span>Studio Control</span>
            <span>/</span>
            <span className="text-zinc-200 font-semibold">
              {NAV_ITEMS.find((n) => n.href === pathname)?.label || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] text-zinc-400 font-mono">
              Phase 12 • Package W4
            </span>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-auto bg-zinc-950">
          {children}
        </div>
      </main>
    </div>
  );
}
