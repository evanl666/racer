/**
 * Global speed tuning for the active run.
 *
 * PixelJunk Racers ships each core mode at Normal / Turbo / Master, which differ
 * only in how fast everything moves. Keeping the multipliers in their own tiny
 * module lets player.ts and ai.ts read them without importing the run or mode
 * machinery, which would create an import cycle.
 */

import type { Difficulty } from './modes/types';

export const DIFFICULTY_SCALE: Record<Difficulty, number> = {
  normal: 1,
  turbo: 1.25,
  master: 1.5
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  normal: 'NORMAL',
  turbo: 'TURBO',
  master: 'MASTER'
};

export const DIFFICULTIES: Difficulty[] = ['normal', 'turbo', 'master'];

export const tuning = {
  /** Multiplies every player speed target. */
  player: 1,
  /** Multiplies every AI base speed. Mode traffic scaling is folded in here. */
  traffic: 1
};

export function applyTuning(difficulty: Difficulty, trafficScale: number): void {
  const scale = DIFFICULTY_SCALE[difficulty];
  tuning.player = scale;
  tuning.traffic = scale * trafficScale;
}
