"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ExternalLink,
  Eye,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsData {
  totals: {
    totalEvents: number;
    pageViews: number;
    cardClicks: number;
    externalNavs: number;
    uniqueSessions: number;
  };
  eventsByType: Array<{ type: string; count: number }>;
  dailyActivity: Array<{ date: string; views: number; clicks: number; navs: number }>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    entityType: string | null;
    entityId: string | null;
    pathname: string | null;
    sessionId: string | null;
    createdAt: string;
  }>;
}

export function HaypAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const studioKey = process.env.NEXT_PUBLIC_STUDIO_ANALYTICS_KEY ?? "";
      const response = await fetch("/api/analytics/metrics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(studioKey ? { "x-studio-key": studioKey } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid or missing studio analytics key.");
        }
        throw new Error(`Failed to load analytics metrics (HTTP ${response.status}).`);
      }

      const payload = await response.json();
      if (!payload?.ok || !payload?.data) {
        throw new Error(payload?.error || "Malformed analytics payload.");
      }

      setData(payload.data);
      setLastRefreshed(new Date());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unexpected error loading telemetry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-28 sm:pt-32">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Studio telemetry
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Hayp Studios Analytics
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Product signals, session health, and outbound conversion insights for the studio portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh data
        </button>
      </div>

      {error && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-red-300" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchMetrics}
            className="rounded-full border border-red-500/40 bg-red-900/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-100 transition hover:bg-red-900/60"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="mb-4 flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase tracking-[0.18em]">Page views</span>
            <Eye className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">
            {loading && !data ? "..." : (data?.totals.pageViews ?? 0).toLocaleString()}
          </div>
          <p className="mt-2 text-xs text-zinc-500">Navigation flow across views</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="mb-4 flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase tracking-[0.18em]">Sessions</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">
            {loading && !data ? "..." : (data?.totals.uniqueSessions ?? 0).toLocaleString()}
          </div>
          <p className="mt-2 text-xs text-zinc-500">Anonymous session cohorts</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="mb-4 flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase tracking-[0.18em]">Card clicks</span>
            <MousePointerClick className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">
            {loading && !data ? "..." : (data?.totals.cardClicks ?? 0).toLocaleString()}
          </div>
          <p className="mt-2 text-xs text-zinc-500">Hub engagement signals</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="mb-4 flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase tracking-[0.18em]">Outbound nav</span>
            <ExternalLink className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">
            {loading && !data ? "..." : (data?.totals.externalNavs ?? 0).toLocaleString()}
          </div>
          <p className="mt-2 text-xs text-zinc-500">External product conversions</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <Activity className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">7-day engagement</span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Updated {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>

        <div className="h-72 w-full">
          {data && data.dailyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 12 }}
                  labelStyle={{ color: "#f4f4f5" }}
                />
                <Bar dataKey="views" name="Page views" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="clicks" name="Card clicks" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="navs" name="Outbound nav" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              {loading ? "Loading chart data..." : "No telemetry in the last 7 days."}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium">Recent ingested events</span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Top 25</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">Entity</th>
                <th className="pb-3 font-medium">Path</th>
                <th className="pb-3 font-medium">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {data && data.recentEvents.length > 0 ? (
                data.recentEvents.map((event) => (
                  <tr key={event.id} className="align-top">
                    <td className="py-3 pr-4 text-zinc-400">{new Date(event.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-200">
                        {event.eventType}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-200">{event.entityId ?? event.entityType ?? "—"}</td>
                    <td className="py-3 pr-4 text-zinc-400">{event.pathname ?? "—"}</td>
                    <td className="py-3 pr-4 text-zinc-500">{event.sessionId ?? "anonymous"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    {loading ? "Loading recent events..." : "No telemetry events recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
