"use client";

import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {
            // Silent fail: local development should still continue.
          });
        });
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent fail: the app must work even without SW support.
    });
  }, []);

  return null;
}
