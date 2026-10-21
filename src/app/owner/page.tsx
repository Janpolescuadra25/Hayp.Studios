import React from "react";
import { Box, Calendar, Mail, Activity, ArrowUpRight } from "lucide-react";

export default function OwnerOverviewPage() {
  const metricCards = [
    { title: "Canonical Products", value: "2", detail: "Vortex & Qyra Live", icon: Box, href: "/owner/products" },
    { title: "Studio Events", value: "1", detail: "Launch Showcase", icon: Calendar, href: "/owner/events" },
    { title: "Client Inquiries", value: "1", detail: "1 Inbound Lead", icon: Mail, href: "/owner/inquiries" },
    { title: "Database Health", value: "100%", detail: "PostgreSQL & Prisma Sync", icon: Activity, href: "/owner/settings" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Studio Overview</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Master operations console for Hayp Studios products, release notes, events, and telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.title}
              href={card.href}
              className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">{card.title}</span>
                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-zinc-100">{card.value}</p>
              <p className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                <span>{card.detail}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 font-mono mb-4">
            Phase 12 Operating Modules
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl">
              <div>
                <p className="text-sm font-medium text-zinc-200">Products & Updates Console</p>
                <p className="text-xs text-zinc-500">Package W5 • Deliverable 12.3</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-md">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl">
              <div>
                <p className="text-sm font-medium text-zinc-200">Events & Studio Settings</p>
                <p className="text-xs text-zinc-500">Package W6 • Deliverable 12.4</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-md">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl">
              <div>
                <p className="text-sm font-medium text-zinc-200">Media & Inquiries Telemetry</p>
                <p className="text-xs text-zinc-500">Package W7 • Deliverable 12.5</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-md">ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 font-mono mb-4">
            Security & Session Telemetry
          </h2>
          <div className="space-y-3 text-xs text-zinc-400 font-mono">
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-500">Database Engine:</span>
              <span className="text-zinc-300">PostgreSQL (Local / VPS)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-500">Session Provider:</span>
              <span className="text-zinc-300">NextAuth v4 (JWT Strategy)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-500">Database Model:</span>
              <span className="text-emerald-400">OwnerAccount (Active)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Active Shell:</span>
              <span className="text-emerald-400">Master Owner Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
