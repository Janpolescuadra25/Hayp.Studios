"use client";

import { useCallback, useEffect, useRef } from "react";

const SESSION_STORAGE_KEY = "hayp_analytics_sid";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = "ses_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return "anonymous";
  }
}

export interface AnalyticsEventInput {
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown> | string;
  pathname?: string;
}

export function useAnalytics() {
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  const sendEvent = useCallback((event: AnalyticsEventInput) => {
    if (typeof window === "undefined") return;

    const payload = {
      ...event,
      pathname: event.pathname || window.location.pathname || "/",
      sessionId: sessionIdRef.current || getOrCreateSessionId(),
    };

    const body = JSON.stringify(payload);

    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        const sent = navigator.sendBeacon("/api/analytics/event", blob);
        if (sent) return;
      }
    } catch {
      // Fall through to fetch if sendBeacon fails
    }

    try {
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Telemetry errors fail silently to protect UX
      });
    } catch {
      // Ignore network errors
    }
  }, []);

  const trackPageView = useCallback(
    (viewName: string) => {
      sendEvent({
        eventType: "page_view",
        entityType: "view",
        entityId: viewName,
      });
    },
    [sendEvent]
  );

  const trackCardClick = useCallback(
    (productId: string) => {
      sendEvent({
        eventType: "card_click",
        entityType: "product",
        entityId: productId,
      });
    },
    [sendEvent]
  );

  const trackExternalNav = useCallback(
    (url: string, productId: string) => {
      sendEvent({
        eventType: "external_nav",
        entityType: "product",
        entityId: productId,
        metadata: { targetUrl: url },
      });
    },
    [sendEvent]
  );

  return {
    sendEvent,
    trackPageView,
    trackCardClick,
    trackExternalNav,
  };
}
