"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import type { InvitationSource } from "@/lib/invitation/compose";

type Item = InvitationSource["schedule"][number];

const MAX_STEPS = 30;

/**
 * The intra-ceremony timeline. Edited as an ordered array and saved as a
 * whole-list replace, which is why order here is simply array position —
 * there is no sort_order to keep in sync.
 */
export function SchedulePanel({
  schedule,
  onChange,
}: {
  schedule: Item[];
  onChange: (schedule: Item[]) => void;
}) {
  const update = (index: number, patch: Partial<Item>) =>
    onChange(schedule.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= schedule.length) return;
    const next = [...schedule];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <p className="muted" style={{ fontSize: "var(--t-sm)" }}>
        Optional. Add the run of the day so guests know when to arrive.
      </p>

      {schedule.length === 0 && (
        <p className="dim" style={{ fontSize: "var(--t-sm)", border: "1px dashed var(--edge)", borderRadius: 14, padding: "1.2rem" }}>
          No timeline yet.
        </p>
      )}

      {schedule.map((item, index) => (
        <div key={index} className="tl-item">
          <div className="form-grid" style={{ gridTemplateColumns: "8rem 1fr" }}>
            <Input
              aria-label={`Time for step ${index + 1}`}
              type="time"
              value={item.time}
              onChange={(e) => update(index, { time: e.target.value })}
            />
            <Input
              aria-label={`Title for step ${index + 1}`}
              placeholder="Arrival of the bride"
              maxLength={80}
              value={item.title}
              onChange={(e) => update(index, { title: e.target.value })}
            />
          </div>
          <Input
            aria-label={`Description for step ${index + 1}`}
            placeholder="Optional detail"
            maxLength={300}
            value={item.description ?? ""}
            onChange={(e) => update(index, { description: e.target.value || null })}
          />
          <div className="acts">
            <Button type="button" variant="quiet" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>
              ↑ Up
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="sm"
              disabled={index === schedule.length - 1}
              onClick={() => move(index, 1)}
            >
              ↓ Down
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              style={{ marginLeft: "auto" }}
              onClick={() => onChange(schedule.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      {schedule.length < MAX_STEPS ? (
        <Button
          type="button"
          variant="line"
          onClick={() => onChange([...schedule, { time: "09:00", title: "", description: null }])}
        >
          + Add a step
        </Button>
      ) : (
        <p className="dim" style={{ fontSize: "var(--t-xs)" }}>
          A timeline holds up to {MAX_STEPS} steps.
        </p>
      )}
    </div>
  );
}
