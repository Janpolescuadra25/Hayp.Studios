'use client';

import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useToast } from '@/hooks/use-toast';

interface HaypContactFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function HaypContactForm({ onSuccess, className = '' }: HaypContactFormProps) {
  const { toast } = useToast();
  const { sendEvent } = useAnalytics();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'General Inquiry',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: 'Complete the brief',
        description: 'Please provide your name, email, and a short project description.',
        variant: 'destructive',
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: 'Check the email field',
        description: 'Please enter a valid email contact for follow-up.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.message.trim().length < 12) {
      toast({
        title: 'Add more detail',
        description: 'A few more words about the scope or timeline will help us respond well.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    sendEvent({
      eventType: 'contact_form_submitted',
      entityType: 'contact',
      metadata: {
        projectType: formData.projectType,
      },
    });

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    try {
      if (!serviceId || !templateId || !publicKey) {
        // Fallback simulation mode
        console.log('[EmailJS Dev Simulation] Message captured:', formData);
        await new Promise((resolve) => setTimeout(resolve, 800));

        toast({
          title: 'Message Received (Dev Mode)',
          description: 'Thank you! Your inquiry was recorded locally in simulation mode.',
        });
      } else {
        // Production EmailJS REST API dispatch
        const payload = {
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            from_name: formData.name,
            reply_to: formData.email,
            project_type: formData.projectType,
            message: formData.message,
          },
        };

        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('EmailJS dispatch failed');
        }

        toast({
          title: 'Inquiry Dispatched',
          description: 'Your project brief has reached the Hayp team. We will connect shortly.',
        });
      }

      setSubmitted(true);
      if (onSuccess) {
        setTimeout(onSuccess, 1200);
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      toast({
        title: 'Submission Notice',
        description: 'Unable to deliver message over network. Please reach out to hello@haypstudios.com directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
        <CheckCircle2 className="w-12 h-12 text-primary animate-in zoom-in-75 duration-300" />
        <h3 className="text-xl font-bold text-foreground">Message Transmitted</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Thank you for reaching out to Hayp Studios. Our directors will review your brief promptly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
          Name / Studio
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Elena Rostova"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background/80 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
          Email Contact
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="elena@domain.com"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background/80 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
          Engagement Type
        </label>
        <select
          value={formData.projectType}
          onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background/80 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="Kinetic Identity">Kinetic Identity & Branding</option>
          <option value="Interactive Web Experience">Interactive Web Experience</option>
          <option value="Motion & 3D Spatial">Motion & 3D Spatial Systems</option>
          <option value="General Inquiry">General Creative Partnership</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
          Project Brief / Message
        </label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Outline the scope, timeline, and vision..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background/80 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Transmitting...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Direct Brief</span>
          </>
        )}
      </button>
    </form>
  );
}