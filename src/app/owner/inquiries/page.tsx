"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

type InquiryStatus = "ALL" | "NEW" | "PENDING" | "CONTACTED" | "IN_PROGRESS" | "ARCHIVED";

type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  engagementType: string;
  brief: string;
  status: string;
  feedbackMessage?: string | null;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Counts = Record<InquiryStatus, number>;

const STATUS_OPTIONS: InquiryStatus[] = ["ALL", "NEW", "PENDING", "CONTACTED", "IN_PROGRESS", "ARCHIVED"];

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus>("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Counts>({
    ALL: 0,
    NEW: 0,
    PENDING: 0,
    CONTACTED: 0,
    IN_PROGRESS: 0,
    ARCHIVED: 0,
  });
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "ALL" ? "/api/admin/inquiries" : `/api/admin/inquiries?status=${statusFilter}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load inquiries");
      }
      const data = await res.json();
      setInquiries((data.inquiries ?? []) as InquiryRecord[]);
      setCounts((data.statusCounts ?? counts) as Counts);
    } catch (error) {
      console.error("Load inquiries failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const filteredInquiries = useMemo(() => {
    if (!search.trim()) {
      return inquiries;
    }

    const value = search.toLowerCase();
    return inquiries.filter((item) => {
      return (
        item.name.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value) ||
        item.brief.toLowerCase().includes(value) ||
        item.engagementType.toLowerCase().includes(value)
      );
    });
  }, [inquiries, search]);

  const selectedInquiry = filteredInquiries.find((item) => item.id === selectedId) ?? inquiries.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedInquiry) {
      setInternalNotes("");
      return;
    }
    const nextNote = selectedInquiry.internalNotes ?? selectedInquiry.feedbackMessage ?? "";
    setInternalNotes(nextNote);
  }, [selectedInquiry]);

  const updateStatus = async (id: string, nextStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchInquiries();
      }
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes }),
      });
      if (res.ok) {
        await fetchInquiries();
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Delete this inquiry permanently?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedId(null);
        await fetchInquiries();
      }
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const normalized = status.toUpperCase();
    const classes = {
      NEW: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
      PENDING: "bg-amber-500/15 text-amber-300 border border-amber-500/40",
      CONTACTED: "bg-blue-500/15 text-blue-300 border border-blue-500/40",
      IN_PROGRESS: "bg-violet-500/15 text-violet-300 border border-violet-500/40",
      ARCHIVED: "bg-stone-700/80 text-stone-200 border border-stone-600",
    } as const;

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes[normalized as keyof typeof classes] ?? "bg-stone-700/70 text-stone-200 border border-stone-600"}`}>
        {normalized}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-100">Client Inquiries</h1>
          <p className="text-sm text-stone-400">Review briefs, triage leads, and progress client conversations.</p>
        </div>
        <button
          type="button"
          onClick={() => fetchInquiries()}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-medium text-stone-200 hover:bg-stone-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatusFilter(option)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                statusFilter === option
                  ? "border-amber-400 bg-amber-500 text-stone-950"
                  : "border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800"
              }`}
            >
              {option} <span className="ml-1 opacity-75">{counts[option] ?? 0}</span>
            </button>
          ))}
        </div>

        <label className="relative block w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-stone-700 bg-stone-900 py-2 pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
            placeholder="Search by name, email, or brief"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-10 text-center text-stone-400">Loading inquiries…</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-10 text-center text-stone-400">
              <Inbox className="mx-auto mb-3 h-8 w-8 text-stone-500" />
              No inquiries match this status or search.
            </div>
          ) : (
            filteredInquiries.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedId === item.id ? "border-amber-500/60 bg-amber-500/5" : "border-stone-800 bg-stone-900/60 hover:border-stone-700"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-stone-100">{item.name}</span>
                      {statusBadge(item.status)}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-400">
                      <Mail className="h-3.5 w-3.5" />
                      {item.email}
                    </div>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-stone-500">{item.engagementType}</div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-stone-300">{item.brief}</p>
              </button>
            ))
          )}
        </div>

        {selectedInquiry ? (
          <aside className="rounded-xl border border-stone-800 bg-stone-900/70 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-amber-400">Inquiry detail</p>
                <h2 className="mt-1 text-xl font-semibold text-stone-100">{selectedInquiry.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => deleteInquiry(selectedInquiry.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-stone-500">Lifecycle</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.filter((status) => status !== "ALL").map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(selectedInquiry.id, status)}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                        selectedInquiry.status === status
                          ? "border-amber-400 bg-amber-500 text-stone-950"
                          : "border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-sm text-stone-300">
                <div className="mb-2 flex items-center gap-2 text-stone-400">
                  <Mail className="h-4 w-4" />
                  {selectedInquiry.email}
                </div>
                <div className="mb-2 flex items-center gap-2 text-stone-400">
                  <Clock3 className="h-4 w-4" />
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {selectedInquiry.engagementType}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-stone-500">Client brief</p>
                <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-sm leading-6 text-stone-300 whitespace-pre-wrap">
                  {selectedInquiry.brief}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-stone-500">Internal notes</p>
                <textarea
                  value={internalNotes}
                  onChange={(event) => setInternalNotes(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-stone-700 bg-stone-950/60 p-3 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
                  placeholder="Add internal notes for the inquiry lifecycle."
                />
                <button
                  type="button"
                  onClick={() => saveNotes(selectedInquiry.id)}
                  disabled={saving}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60"
                >
                  <Archive className="h-3.5 w-3.5" />
                  {saving ? "Saving…" : "Save notes"}
                </button>
              </div>
            </div>
          </aside>
        ) : (
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-10 text-center text-stone-400">Select an inquiry to inspect its details.</div>
        )}
      </div>
    </div>
  );
}
