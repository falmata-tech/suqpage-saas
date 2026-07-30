"use client";

import { useEffect } from "react";

export default function ShowroomVisitBeacon({
  handle,
  source,
  occurrenceId,
  hubKey,
}: {
  handle: string;
  source: "direct" | "expo" | "directory";
  occurrenceId?: string;
  hubKey?: string;
}) {
  useEffect(() => {
    void fetch("/api/analytics/visit", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, source, occurrenceId, hubKey }),
    }).catch(() => undefined);
  }, [handle, source, occurrenceId, hubKey]);
  return null;
}
