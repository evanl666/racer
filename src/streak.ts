/**
 * Daily streak.
 *
 * "Come back tomorrow" is a much weaker pull than "come back tomorrow or lose
 * your seven days". The count advances on the first run of a calendar day and
 * resets if a day was missed, which is the whole mechanic.
 */

import { todayKey } from './daily';
import { loadStreak, saveStreak, type Streak } from './storage';

function previousDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  if (!year || !month || !date) return '';
  const stamp = new Date(year, month - 1, date);
  stamp.setDate(stamp.getDate() - 1);
  const pad = (value: number): string => (value < 10 ? `0${value}` : String(value));
  return `${stamp.getFullYear()}-${pad(stamp.getMonth() + 1)}-${pad(stamp.getDate())}`;
}

/** Called when a run starts. Returns the streak after this visit is counted. */
export function touchStreak(today: string = todayKey()): Streak {
  const current = loadStreak();
  if (current.lastDay === today) return current;

  const next: Streak = {
    days: current.lastDay === previousDay(today) ? current.days + 1 : 1,
    lastDay: today
  };
  saveStreak(next);
  return next;
}

export function currentStreak(today: string = todayKey()): number {
  const streak = loadStreak();
  if (streak.lastDay === today || streak.lastDay === previousDay(today)) return streak.days;
  // The chain is already broken; showing the stale number would be a lie.
  return 0;
}
