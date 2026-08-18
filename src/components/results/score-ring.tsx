"use client";

import { cn } from "@/lib/utils";

export function ScoreRing({ score, size = 168 }: { score: number; size?: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e8dfd0" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#0e5c4a"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className={cn("font-display text-4xl tabular-nums tracking-tight")}>{score}</p>
        <p className="text-xs text-ink-soft">/100</p>
      </div>
    </div>
  );
}
