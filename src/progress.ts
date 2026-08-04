/**
 * Progression: stars, and the ladder they unlock.
 *
 * Stars are the single currency. Each (mode, difficulty) awards 0-3 of them by
 * comparing your best score against that mode's thresholds, so every star comes
 * from a score you actually posted. Modes and difficulties past the starting set
 * are gated on the running total, which means progress never dead-ends: any mode
 * you can already play will eventually open the next one.
 */

import { DIFFICULTIES, DIFFICULTY_PROFILES } from './difficulty';
import { MODES, modeById } from './modes';
import type { Difficulty, ModeDefinition, ModeId } from './modes/types';
import { bestScore } from './storage';

export const MAX_STARS_PER_ENTRY = 3;

/**
 * Debug/test escape hatch. The headless suites need to drive every mode without
 * first grinding the ladder, and it is handy from the devtools console. Nothing
 * in the game turns this on.
 */
let unlockOverride = false;

export function setUnlockOverride(value: boolean): void {
  unlockOverride = value;
}

/** Modes playable from a standing start, in menu order. */
const STARTING_MODE_COUNT = 3;

/**
 * Stars required for the 4th mode onwards. Each entry stays well under the
 * (unlocked modes x 9) a player could already have banked, so the ladder can
 * always be climbed with the modes currently available.
 */
const MODE_UNLOCK_COST = [3, 6, 10, 14, 19, 24, 30, 36, 43, 50, 58, 66, 75];

const DIFFICULTY_UNLOCK_COST: Record<Difficulty, number> = {
  normal: 0,
  turbo: 6,
  master: 20
};

/** Harder settings demand a higher score for the same star. */
const DIFFICULTY_STAR_SCALE: Record<Difficulty, number> = {
  normal: 1,
  turbo: 1.15,
  master: 1.3
};

function starTarget(mode: ModeDefinition, tier: number, difficulty: Difficulty): number {
  const base = mode.stars[tier];
  const scale = DIFFICULTY_STAR_SCALE[difficulty];
  // Time Attack scores seconds, so a tighter requirement is a smaller number.
  return mode.lowerIsBetter ? base / scale : base * scale;
}

/** Stars earned for one mode at one difficulty, 0-3. */
export function starsFor(modeId: ModeId, difficulty: Difficulty): number {
  const best = bestScore(modeId, difficulty);
  if (best === null) return 0;

  const mode = modeById(modeId);
  let earned = 0;
  for (let tier = 0; tier < MAX_STARS_PER_ENTRY; tier++) {
    const target = starTarget(mode, tier, difficulty);
    const reached = mode.lowerIsBetter ? best <= target : best >= target;
    if (reached) earned = tier + 1;
  }
  return earned;
}

/** Stars earned across every mode and difficulty. */
export function totalStars(): number {
  let total = 0;
  for (const mode of MODES) {
    for (const difficulty of DIFFICULTIES) {
      total += starsFor(mode.id, difficulty);
    }
  }
  return total;
}

export function maxStars(): number {
  return MODES.length * DIFFICULTIES.length * MAX_STARS_PER_ENTRY;
}

/** Stars needed to open a mode, or 0 when it is available from the start. */
export function modeUnlockCost(modeId: ModeId): number {
  const index = MODES.findIndex((mode) => mode.id === modeId);
  if (index < STARTING_MODE_COUNT) return 0;
  return MODE_UNLOCK_COST[index - STARTING_MODE_COUNT] ?? 0;
}

export function modeUnlocked(modeId: ModeId, stars = totalStars()): boolean {
  return unlockOverride || stars >= modeUnlockCost(modeId);
}

export function difficultyUnlockCost(difficulty: Difficulty): number {
  return DIFFICULTY_UNLOCK_COST[difficulty];
}

export function difficultyUnlocked(difficulty: Difficulty, stars = totalStars()): boolean {
  return unlockOverride || stars >= DIFFICULTY_UNLOCK_COST[difficulty];
}

/** The next thing the ladder will open, for the menu's progress line. */
export function nextUnlock(): { label: string; cost: number } | null {
  const stars = totalStars();

  for (const difficulty of DIFFICULTIES) {
    const cost = DIFFICULTY_UNLOCK_COST[difficulty];
    if (stars < cost) return { label: DIFFICULTY_PROFILES[difficulty].label, cost };
  }
  for (const mode of MODES) {
    const cost = modeUnlockCost(mode.id);
    if (stars < cost) return { label: mode.name, cost };
  }
  return null;
}

/** Score needed for the next star in a mode, for the result screen's nudge. */
export function nextStarTarget(modeId: ModeId, difficulty: Difficulty): number | null {
  const mode = modeById(modeId);
  const earned = starsFor(modeId, difficulty);
  if (earned >= MAX_STARS_PER_ENTRY) return null;
  return Math.round(starTarget(mode, earned, difficulty));
}
