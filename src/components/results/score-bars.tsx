"use client";

export function ScoreBars({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.label}</span>
            <span className="tabular-nums text-ink-soft">{item.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sand">
            <div
              className="score-bar h-full rounded-full transition-all duration-700"
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
