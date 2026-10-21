"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Globe, Radio, RefreshCw, Save, Shield, Sliders } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_SETTINGS = [
  { key: "site_title", label: "Studio brand name", description: "Public brand title used in headers and SEO" },
  { key: "hero_headline", label: "Hero headline", description: "Primary headline for the landing page" },
  { key: "contact_email", label: "Contact email", description: "Public inquiry destination" },
  { key: "announcement_banner", label: "Announcement banner", description: "Optional site-wide banner message" },
  { key: "booking_enabled", label: "Booking enabled", description: "Boolean flag for live booking intake" },
];

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchSettings() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        const next: Record<string, string> = {};

        for (const item of DEFAULT_SETTINGS) {
          next[item.key] = item.key === "bookings_enabled" ? "true" : "";
        }

        for (const item of data) {
          next[item.key] = item.value;
        }

        setSettings(next);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        settings: Object.entries(settings).map(([key, value]) => ({
          key,
          value,
          description: DEFAULT_SETTINGS.find((item) => item.key === key)?.description ?? null,
        })),
      };

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage("Settings saved successfully.");
      } else {
        setMessage("Failed to save settings.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100">
            <Sliders className="h-6 w-6 text-amber-500" />
            Studio Settings
          </h1>
          <p className="text-sm text-zinc-400">Update public brand content and studio operational flags.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchSettings()} disabled={loading || saving} className="border-zinc-800 text-zinc-300">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Reload
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading || saving} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      <div className="space-y-4">
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-200">
              <Globe className="h-4 w-4 text-amber-500" />
              Studio Identity
            </CardTitle>
            <CardDescription className="text-zinc-400">Branding, public contact, and visibility details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Site title</label>
              <Input
                value={settings.site_title ?? ""}
                onChange={(event) => setSettings((prev) => ({ ...prev, site_title: event.target.value }))}
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Contact email</label>
              <Input
                value={settings.contact_email ?? ""}
                onChange={(event) => setSettings((prev) => ({ ...prev, contact_email: event.target.value }))}
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-200">
              <Radio className="h-4 w-4 text-amber-500" />
              Page Content
            </CardTitle>
            <CardDescription className="text-zinc-400">Maintain the live hero copy and optional banner text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Hero headline</label>
              <Input
                value={settings.hero_headline ?? ""}
                onChange={(event) => setSettings((prev) => ({ ...prev, hero_headline: event.target.value }))}
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Announcement banner</label>
              <Textarea
                value={settings.announcement_banner ?? ""}
                onChange={(event) => setSettings((prev) => ({ ...prev, announcement_banner: event.target.value }))}
                rows={3}
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-200">
              <Shield className="h-4 w-4 text-amber-500" />
              Operations
            </CardTitle>
            <CardDescription className="text-zinc-400">Booleans for booking and feature toggles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Booking enabled</label>
              <Input
                value={settings.booking_enabled ?? "true"}
                onChange={(event) => setSettings((prev) => ({ ...prev, booking_enabled: event.target.value }))}
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
