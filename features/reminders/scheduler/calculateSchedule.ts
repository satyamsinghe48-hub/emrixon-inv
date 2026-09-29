import type { ReminderOffsetType } from "../types";

function localDateTimeParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function zonedDateToUtc(localIso: string, timeZone: string) {
  const desired = new Date(localIso + "Z");
  if (Number.isNaN(desired.getTime())) throw new Error("Invalid local date/time.");
  let guess = desired;
  for (let i = 0; i < 3; i += 1) {
    const p = localDateTimeParts(guess, timeZone);
    const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
    guess = new Date(guess.getTime() + (desired.getTime() - asUtc));
  }
  return guess;
}

export function calculateReminderAt(
  dueDate: string,
  offsetDays: number,
  offsetType: ReminderOffsetType,
  timeZone: string,
  hour = 9,
): Date {
  const [y, m, d] = dueDate.split("-").map(Number);
  const delta = offsetType === "before_due" ? -offsetDays : offsetType === "after_due" ? offsetDays : 0;
  const target = new Date(Date.UTC(y, m - 1, d + delta, hour, 0, 0));
  const targetIso = target.toISOString().slice(0, 16);
  return zonedDateToUtc(targetIso, timeZone);
}

export function isFutureSchedule(date: Date, now = new Date()) {
  return date.getTime() > now.getTime();
}
