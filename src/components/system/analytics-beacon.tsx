"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";

export function AnalyticsBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    const name = pathname === "/" ? "landing_visit" : "page_view";
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, path: pathname }),
    });
  }, [pathname]);
  return null;
}
