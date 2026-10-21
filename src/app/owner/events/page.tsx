"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Edit, ExternalLink, MapPin, Plus, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface StudioEvent {
  id: string;
  title: string;
  slug: string;
  eventType: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  registrationUrl: string | null;
  isPublished: boolean;
}

export default function OwnerEventsPage() {
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StudioEvent | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formType, setFormType] = useState("workshop");
  const [formDescription, setFormDescription] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formRegistrationUrl, setFormRegistrationUrl] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(false);

  async function fetchEvents() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  function openCreateDialog() {
    setEditingEvent(null);
    setFormTitle("");
    setFormSlug("");
    setFormType("workshop");
    setFormDescription("");
    setFormStartDate(new Date().toISOString().slice(0, 16));
    setFormEndDate("");
    setFormLocation("");
    setFormRegistrationUrl("");
    setFormIsPublished(false);
    setDialogOpen(true);
  }

  function openEditDialog(event: StudioEvent) {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormSlug(event.slug);
    setFormType(event.eventType);
    setFormDescription(event.description ?? "");
    setFormStartDate(new Date(event.startDate).toISOString().slice(0, 16));
    setFormEndDate(event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "");
    setFormLocation(event.location ?? "");
    setFormRegistrationUrl(event.registrationUrl ?? "");
    setFormIsPublished(event.isPublished);
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: formTitle,
        slug: formSlug || undefined,
        eventType: formType,
        description: formDescription || null,
        startDate: new Date(formStartDate).toISOString(),
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        location: formLocation || null,
        registrationUrl: formRegistrationUrl || null,
        isPublished: formIsPublished,
      };

      const endpoint = editingEvent ? `/api/admin/events/${editingEvent.id}` : "/api/admin/events";
      const method = editingEvent ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setDialogOpen(false);
        await fetchEvents();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event?")) {
      return;
    }

    const response = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (response.ok) {
      await fetchEvents();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-500" />
            Events & Workshops
          </h1>
          <p className="text-sm text-zinc-400">Manage studio sessions, workshops, and public showcases.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchEvents()} disabled={loading} className="border-zinc-800 text-zinc-300">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreateDialog} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Title</label>
                <Input
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  required
                  className="border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Slug</label>
                <Input
                  value={formSlug}
                  onChange={(event) => setFormSlug(event.target.value)}
                  placeholder="optional"
                  className="border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Type</label>
                <Input
                  value={formType}
                  onChange={(event) => setFormType(event.target.value)}
                  className="border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Start</label>
                <Input
                  type="datetime-local"
                  value={formStartDate}
                  onChange={(event) => setFormStartDate(event.target.value)}
                  required
                  className="border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">End</label>
                <Input
                  type="datetime-local"
                  value={formEndDate}
                  onChange={(event) => setFormEndDate(event.target.value)}
                  className="border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Location</label>
                <Input
                  value={formLocation}
                  onChange={(event) => setFormLocation(event.target.value)}
                  className="border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Registration URL</label>
                <Input
                  value={formRegistrationUrl}
                  onChange={(event) => setFormRegistrationUrl(event.target.value)}
                  className="border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Description</label>
              <Textarea
                value={formDescription}
                onChange={(event) => setFormDescription(event.target.value)}
                rows={4}
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">Publish event</p>
                <p className="text-xs text-zinc-500">Display publicly once saved.</p>
              </div>
              <Switch checked={formIsPublished} onCheckedChange={setFormIsPublished} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-zinc-700 text-zinc-300">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                {saving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardContent className="p-8 text-center text-zinc-400">Loading events...</CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200">No events scheduled</h3>
            <p className="mt-2 text-sm text-zinc-500">Create your first public workshop or event now.</p>
            <Button onClick={openCreateDialog} className="mt-5 bg-amber-500 text-zinc-950 hover:bg-amber-400">
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="border-zinc-800 bg-zinc-900/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300">
                    {event.eventType}
                  </Badge>
                  <Badge variant={event.isPublished ? "default" : "secondary"} className={event.isPublished ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-400"}>
                    {event.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-lg text-zinc-100">{event.title}</CardTitle>
                <CardDescription className="text-zinc-400">{event.description ?? "No description provided."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-1 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span>{new Date(event.startDate).toLocaleString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-zinc-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(event)} className="h-8 px-2 text-zinc-300 hover:text-zinc-100">
                      <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} className="h-8 px-2 text-rose-400 hover:text-rose-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {event.registrationUrl && (
                    <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-300">
                      Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
