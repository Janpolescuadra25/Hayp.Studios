"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Archive,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Inbox,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type InquiryStatus = "NEW" | "IN_REVIEW" | "CONTACTED" | "ARCHIVED";
type InquiryFilter = "ALL" | InquiryStatus;

type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  engagementType: string;
  brief: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
};

const FILTER_OPTIONS: InquiryFilter[] = ["ALL", "NEW", "IN_REVIEW", "CONTACTED", "ARCHIVED"];
const STATUS_META: Record<InquiryStatus, { label: string; classes: string }> = {
  NEW: { label: "New", classes: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200" },
  IN_REVIEW: { label: "In Review", classes: "border-amber-500/30 bg-amber-500/10 text-amber-200" },
  CONTACTED: { label: "Contacted", classes: "border-violet-500/30 bg-violet-500/10 text-violet-200" },
  ARCHIVED: { label: "Archived", classes: "border-zinc-500/30 bg-zinc-500/10 text-zinc-200" },
};
const FALLBACK_ADMIN_EMAIL = "paulescuadra25@gmail.com";
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? FALLBACK_ADMIN_EMAIL).toLowerCase();

function isAdminSession(session: ReturnType<typeof useSession>["data"]) {
  const role = (session?.user as { role?: string } | undefined)?.role;
  const email = session?.user?.email?.toLowerCase() ?? "";
  return role === "ADMIN" || email === ADMIN_EMAIL;
}

export function HaypAdmin() {
  const { data: session, status } = useSession();
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<InquiryFilter>("ALL");
  const [engagementFilter, setEngagementFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isAdmin = status === "authenticated" && isAdminSession(session);

  const loadInquiries = async (nextFilter: InquiryFilter = statusFilter) => {
    if (status !== "authenticated" || !isAdmin) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (nextFilter !== "ALL") {
        params.set("status", nextFilter);
      }
      params.set("limit", "200");

      const response = await fetch(`/api/inquiry?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load inquiries.");
      }

      setInquiries(Array.isArray(payload.inquiries) ? payload.inquiries : []);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load inquiries.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      void loadInquiries(statusFilter);
    }
  }, [status, isAdmin, statusFilter]);

  const engagementOptions = useMemo(() => {
    const values = new Set(inquiries.map((inquiry) => inquiry.engagementType));
    return ["ALL", ...Array.from(values).sort()];
  }, [inquiries]);

  const visibleInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const statusMatch = statusFilter === "ALL" || inquiry.status === statusFilter;
      const engagementMatch = engagementFilter === "ALL" || inquiry.engagementType === engagementFilter;
      return statusMatch && engagementMatch;
    });
  }, [engagementFilter, inquiries, statusFilter]);

  const metrics = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter((inquiry) => inquiry.status === "NEW").length,
      inReview: inquiries.filter((inquiry) => inquiry.status === "IN_REVIEW").length,
      contacted: inquiries.filter((inquiry) => inquiry.status === "CONTACTED").length,
      archived: inquiries.filter((inquiry) => inquiry.status === "ARCHIVED").length,
    };
  }, [inquiries]);

  const handleUpdateStatus = async (id: string, nextStatus: InquiryStatus) => {
    setBusyId(id);
    setError(null);

    try {
      const response = await fetch("/api/inquiry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update inquiry status.");
      }

      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry.id === id
            ? { ...inquiry, status: nextStatus, updatedAt: new Date().toISOString() }
            : inquiry
        )
      );
      setExpandedId(id);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update inquiry status.");
    } finally {
      setBusyId(null);
    }
  };

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-28 sm:pt-32">
        <div className="space-y-4">
          <div className="h-12 w-56 animate-pulse rounded-full bg-zinc-800/80" />
          <div className="h-8 w-72 animate-pulse rounded-md bg-zinc-800/80" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-zinc-900/80" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-28 sm:pt-32">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Studio operations
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Studio Operations Hub — Restricted Access
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-400">
            Authentication as a studio administrator is required to inspect client project briefs and manage studio pipeline operations.
          </p>

          <button
            type="button"
            onClick={() => signIn()}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-900 transition hover:bg-zinc-200"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Sign In as Studio Admin
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-28 sm:pt-32">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Studio operations
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Studio Operations Hub
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
            Active admin: <span className="font-medium text-white">{session?.user?.email ?? "studio-admin"}</span>
          </div>

          <button
            type="button"
            onClick={() => void loadInquiries()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Inquiries", value: metrics.total, icon: Inbox },
          { label: "New", value: metrics.new, icon: Clock },
          { label: "In Review", value: metrics.inReview, icon: Filter },
          { label: "Contacted", value: metrics.contacted, icon: CheckCircle },
          { label: "Archived", value: metrics.archived, icon: Archive },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <div className="mb-4 flex items-center justify-between text-zinc-400">
              <span className="text-[11px] uppercase tracking-[0.18em]">{label}</span>
              <Icon className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  statusFilter === tab
                    ? "bg-white text-zinc-900"
                    : "border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-zinc-400">
            <span>Engagement</span>
            <select
              value={engagementFilter}
              onChange={(event) => setEngagementFilter(event.target.value)}
              className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-200 outline-none"
            >
              {engagementOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mt-7 space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {visibleInquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-10 text-center text-sm text-zinc-400">
            No inquiries match the current filters.
          </div>
        ) : (
          visibleInquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">{inquiry.name}</h2>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_META[inquiry.status].classes}`}>
                      {STATUS_META[inquiry.status].label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{inquiry.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                  <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-2.5 py-1">
                    {inquiry.engagementType}
                  </span>
                  <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setExpandedId((current) => (current === inquiry.id ? null : inquiry.id))}
                    className="rounded-full border border-zinc-700 bg-zinc-900/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                  >
                    {expandedId === inquiry.id ? "Hide brief" : "View brief"}
                  </button>
                </div>
              </div>

              {expandedId === inquiry.id && (
                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm leading-relaxed text-zinc-300">
                  {inquiry.brief}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {(FILTER_OPTIONS.filter((option) => option !== "ALL") as InquiryStatus[]).map((nextStatus) => {
                  const isCurrent = inquiry.status === nextStatus;
                  return (
                    <button
                      key={nextStatus}
                      type="button"
                      disabled={isCurrent || busyId === inquiry.id}
                      onClick={() => void handleUpdateStatus(inquiry.id, nextStatus)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                        isCurrent
                          ? "cursor-default border border-zinc-700 bg-zinc-800 text-zinc-500"
                          : "border border-zinc-700 bg-zinc-900/70 text-zinc-200 hover:border-zinc-500 hover:text-white"
                      }`}
                    >
                      {busyId === inquiry.id ? "Updating..." : `Mark ${STATUS_META[nextStatus].label}`}
                    </button>
                  );
                })}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
