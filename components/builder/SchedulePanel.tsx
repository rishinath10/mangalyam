"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import type { InvitationSource } from "@/lib/invitation/compose";

type Item = InvitationSource["schedule"][number];

/**
 * The intra-ceremony timeline ("10am arrival, 11am ceremony"). Edited as an
 * ordered array and saved as a whole-list replace, which is why order here is
 * simply array position — there is no sort_order to keep in sync.
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
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Optional. Add the run of the day so guests know when to arrive.
      </p>

      {schedule.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">
          No timeline yet.
        </p>
      )}

      <ul className="space-y-3">
        {schedule.map((item, index) => (
          <li
            key={index}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
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
            <div className="mt-3">
              <Input
                aria-label={`Description for step ${index + 1}`}
                placeholder="Optional detail"
                maxLength={300}
                value={item.description ?? ""}
                onChange={(e) => update(index, { description: e.target.value || null })}
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="!px-2.5 !py-1.5 text-xs"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑ Up
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="!px-2.5 !py-1.5 text-xs"
                disabled={index === schedule.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓ Down
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="!px-2.5 !py-1.5 text-xs !text-red-700 hover:!bg-red-50"
                onClick={() => onChange(schedule.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {schedule.length < 30 && (
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange([...schedule, { time: "09:00", title: "", description: null }])
          }
        >
          + Add a step
        </Button>
      )}
      {schedule.length >= 30 && (
        <p className="text-xs text-neutral-500">
          A timeline holds up to 30 steps.
        </p>
      )}
    </div>
  );
}
