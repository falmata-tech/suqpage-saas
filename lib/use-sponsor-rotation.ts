import { useEffect, useState } from "react";

export const SPONSOR_TURN_MS = 6_000;

/** Shared client timing; each renderer owns visibility and accessibility signals. */
export function useSponsorRotation(count: number, active: boolean, preferPaused: boolean) {
  const [index, setIndex] = useState(0);
  const [manualPause, setManualPause] = useState<boolean | null>(null);
  const paused = manualPause ?? preferPaused;
  const running = count > 1 && active && !paused;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setIndex(value => (value + 1) % count), SPONSOR_TURN_MS);
    return () => clearTimeout(timer);
  }, [count, index, running]);
  return {
    index: count ? index % count : 0,
    paused,
    running,
    step: (direction: number) => setIndex(value => (value + direction + count) % count),
    toggle: () => setManualPause(!paused),
  };
}
