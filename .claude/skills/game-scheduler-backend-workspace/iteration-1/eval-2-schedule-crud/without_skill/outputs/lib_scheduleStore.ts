import type { Schedule } from "@/types/schedule";

const schedules: Map<string, Schedule> = new Map();

function generateId(): string {
  return crypto.randomUUID();
}

export function getAllSchedules(): Schedule[] {
  return Array.from(schedules.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSchedulesByGroupId(groupId: string): Schedule[] {
  return Array.from(schedules.values())
    .filter((schedule) => schedule.groupId === groupId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getScheduleById(id: string): Schedule | undefined {
  return schedules.get(id);
}

export function createSchedule(
  data: Omit<Schedule, "id" | "participants" | "createdAt" | "updatedAt">
): Schedule {
  const now = new Date().toISOString();
  const schedule: Schedule = {
    id: generateId(),
    ...data,
    participants: [],
    createdAt: now,
    updatedAt: now,
  };
  schedules.set(schedule.id, schedule);
  return schedule;
}

export function updateSchedule(
  id: string,
  data: Partial<Omit<Schedule, "id" | "createdAt" | "updatedAt">>
): Schedule | undefined {
  const existing = schedules.get(id);
  if (!existing) return undefined;

  const updated: Schedule = {
    ...existing,
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  schedules.set(id, updated);
  return updated;
}

export function deleteSchedule(id: string): boolean {
  return schedules.delete(id);
}
