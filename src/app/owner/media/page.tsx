"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Image as ImageIcon, RefreshCw, Trash2, Upload } from "lucide-react";

type MediaRecord = {
  id: string;
  url: string;
  caption?: string | null;
  mediaType: string;
  displayOrder: number;
  createdAt: string;
  product?: {
    id: string;
    title: string;
  } | null;
};

export default function OwnerMediaPage() {
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/admin/media" : `/api/admin/media?mediaType=${filter}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch media");
      }
      const payload = await res.json();
      setMedia(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Media fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filter]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const content = await res.json();
        throw new Error(content?.error || "Upload failed");
      }

      await fetchMedia();
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media asset from the library?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((current) => current.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const copyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyingId(id);
      window.setTimeout(() => setCopyingId(null), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-100">Media Library</h1>
          <p className="text-sm text-stone-400">Manage product and studio assets with quick copy and removal actions.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60"
            disabled={uploading}
          >
            {uploading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload Asset"}
          </button>

          <button
            type="button"
            onClick={() => fetchMedia()}
            className="rounded-lg border border-stone-700 bg-stone-900 p-2 text-stone-300 hover:bg-stone-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "IMAGE", "VIDEO"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
              filter === option ? "border-amber-400 bg-amber-500 text-stone-950" : "border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-12 text-center text-stone-400">Loading media assets…</div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-700 bg-stone-900/40 p-12 text-center text-stone-400">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-stone-500" />
          No media assets found for the selected filter.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900/60">
              <div className="relative aspect-video overflow-hidden bg-stone-950">
                {item.mediaType === "video" ? (
                  <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={item.url} alt={item.caption || "Media asset"} className="h-full w-full object-cover" />
                )}
                <span className="absolute left-2 top-2 rounded-full border border-stone-700 bg-stone-950/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-200">
                  {item.mediaType}
                </span>
              </div>

              <div className="space-y-3 p-3">
                <div>
                  <p className="text-sm font-medium text-stone-100">{item.caption || "Untitled asset"}</p>
                  {item.product ? <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-400">{item.product.title}</p> : null}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-stone-800 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => copyUrl(item.id, item.url)}
                    className="inline-flex items-center gap-1.5 text-stone-300 hover:text-stone-100"
                  >
                    {copyingId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copyingId === item.id ? "Copied" : "Copy URL"}
                  </button>

                  <div className="flex items-center gap-1">
                    <a href={item.url} target="_blank" rel="noreferrer" className="rounded-md border border-stone-700 p-1.5 text-stone-300 hover:bg-stone-800">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md border border-red-800/60 bg-red-500/10 p-1.5 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
