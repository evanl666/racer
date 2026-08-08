/**
 * Daily challenge.
 *
 * One fixed mode and one fixed traffic seed per calendar day, identical for
 * everyone, so scores are directly comparable and there is a shared thing to
 * talk about. That is what turns a leaderboard from a list into a conversation.
 *
 * It runs in two stages on purpose. Stage one is set at the bronze target and
 * most players clear it, which is what makes stage two — set well past gold —
 * land as a wall rather than a shrug. The frustration is the point: a challenge
 * everybody beats gives nobody anything to say.
 *
 * Both stages now race the same Master field, since that is the only setting
 * left, so the whole step between them is the target score. Stage one is a
 * harder ask than it was when it ran on Normal; the bronze threshold is what
 * keeps it a warm-up rather than a second wall.
 */

import { DEFAULT_DIFFICULTY } from './difficulty';
import { RELEASED_MODES, modeById } from './modes';
import type { Difficulty, ModeId } from './modes/types';
import { hashSeed } from './rng';

/** Time Attack scores in seconds where lower wins, which breaks a target-based stage. */
const DAILY_POOL: ModeId[] = RELEASED_MODES.filter((mode) => !mode.lowerIsBetter).map((mode) => mode.id);

export interface DailyPlan {
  /** YYYY-MM-DD, the leaderboard partition key. */
  day: string;
  modeId: ModeId;
  seed: number;
}

export interface DailyStage {
  stage: 1 | 2;
  difficulty: Difficulty;
  target: number;
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function todayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function dailyPlan(day: string = todayKey()): DailyPlan {
  const seed = hashSeed(`harbor-loop:${day}`);
  // Derive the mode from a second hash so it is not correlated with the seed.
  const modeIndex = hashSeed(`mode:${day}`) % DAILY_POOL.length;
  return { day, modeId: DAILY_POOL[modeIndex], seed };
}

export function dailyStage(plan: DailyPlan, stage: 1 | 2): DailyStage {
  const mode = modeById(plan.modeId);
  if (stage === 1) {
    return { stage: 1, difficulty: DEFAULT_DIFFICULTY, target: mode.stars[0] };
  }
  // Past gold: designed so almost nobody clears it.
  return { stage: 2, difficulty: DEFAULT_DIFFICULTY, target: Math.round(mode.stars[2] * 1.45) };
}
