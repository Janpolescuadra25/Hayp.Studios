"use client";

import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { HaypAdmin } from "@/components/hayp/hayp-admin";
import { HaypAdminPortfolio } from "@/components/hayp/hayp-admin-portfolio";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function isAdminSession(session: ReturnType<typeof useSession>["data"]) {
  const role = (session?.user as { role?: string } | undefined)?.role;
  const email = session?.user?.email?.toLowerCase() ?? "";
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "paulescuadra25@gmail.com").toLowerCase();
  return role === "ADMIN" || email === adminEmail;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("portfolio");

  const isAdmin = status === "authenticated" && isAdminSession(session);

  if (status === "loading") {
    return <div className="p-8 text-sm text-zinc-400">Loading admin access…</div>;
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl shadow-black/30">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Studio operations
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Studio Admin Access Required
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-400">
            Sign in as a studio administrator to manage client inquiries and the resident portfolio.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Phase 12 Transition Banner */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Master Owner Dashboard Active</p>
            <p className="mt-1 text-sm text-zinc-300">
              Studio operations are consolidating into the unified <code className="text-emerald-400">/owner</code> console. Existing portfolio and inquiry tools remain available below.
            </p>
          </div>
        </div>
        <a
          href="/owner"
          className="inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-zinc-950/50 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10"
        >
          Go to /owner →
        </a>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Hayp studios admin
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Operations Console</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-300">
            Active admin: <span className="font-medium text-white">{session?.user?.email ?? "studio-admin"}</span>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-2">
          <TabsTrigger value="portfolio">Portfolio & Artists</TabsTrigger>
          <TabsTrigger value="inquiries">Client Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <HaypAdminPortfolio />
        </TabsContent>

        <TabsContent value="inquiries">
          <HaypAdmin />
        </TabsContent>
      </Tabs>
    </main>
  );
}
