/**
 * The difficulty profile for the active run.
 *
 * There is exactly one now. Master is the race the game was tuned around — a
 * full field, top speed, and traffic that will not move over for you — and
 * shipping softer settings alongside it just let players opt out of the thing
 * worth playing.
 *
 * The profile is still a record keyed by difficulty rather than a bare object,
 * so a second setting is a data change here plus a menu control, not a refactor
 * of everything that reads `tuning`.
 *
 * Kept in its own tiny module so player.ts and ai.ts can read it without
 * importing the run or mode machinery, which would create an import cycle.
 */

import type { Difficulty } from './modes/types';

export interface DifficultyProfile {
  label: string;
  /** Menu subtitle: what actually changes at this setting. */
  blurb: string;
  /** Multiplies every player speed target. */
  playerSpeed: number;
  /** Multiplies every AI base speed, before the mode's own traffic scale. */
  trafficSpeed: number;
  /** How many black cars are on track. */
  carCount: number;
  /** Scales the no-lane-change zone AI keeps around the player. Lower = ruder. */
  aiSafetyScale: number;
  /** Scales the delay between AI lane-change decisions. Lower = busier traffic. */
  aiDecisionScale: number;
  /** How many AI cars may be signalling or changing lane at once. */
  maxSimultaneousAi: number;
  /** Post-crash invulnerability, in seconds. */
  invincibleSeconds: number;
}

export const DIFFICULTY_PROFILES: Record<Difficulty, DifficultyProfile> = {
  master: {
    label: 'MASTER',
    blurb: '36 车 · 最快 · AI 几乎不让路',
    playerSpeed: 1.45,
    trafficSpeed: 1.42,
    carCount: 36,
    aiSafetyScale: 0.36,
    aiDecisionScale: 0.4,
    maxSimultaneousAi: 6,
    invincibleSeconds: 0.75
  }
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  master: DIFFICULTY_PROFILES.master.label
};

/** The only setting, and the one every run starts on. */
export const DEFAULT_DIFFICULTY: Difficulty = 'master';

export const DIFFICULTIES: Difficulty[] = ['master'];

/** The profile in force, plus the mode's traffic scale folded into `traffic`. */
export const tuning = {
  profile: DIFFICULTY_PROFILES.master,
  player: DIFFICULTY_PROFILES.master.playerSpeed,
  traffic: DIFFICULTY_PROFILES.master.trafficSpeed
};

export function applyTuning(difficulty: Difficulty, trafficScale: number): void {
  const profile = DIFFICULTY_PROFILES[difficulty];
  tuning.profile = profile;
  tuning.player = profile.playerSpeed;
  tuning.traffic = profile.trafficSpeed * trafficScale;
}
