/**
 * Difficulty profiles for the active run.
 *
 * Speed alone made the three settings feel like the same race at three tempos,
 * so each profile also changes how much traffic is on track, how aggressively it
 * changes lane, how much room it leaves the player, and how forgiving a crash is.
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
  normal: {
    label: 'NORMAL',
    blurb: '24 车 · 基准速度 · AI 会让路',
    playerSpeed: 1,
    trafficSpeed: 1,
    carCount: 24,
    aiSafetyScale: 0.85,
    aiDecisionScale: 0.85,
    maxSimultaneousAi: 3,
    invincibleSeconds: 1.25
  },
  turbo: {
    label: 'TURBO',
    blurb: '30 车 · 更快 · AI 更早并线',
    playerSpeed: 1.22,
    trafficSpeed: 1.2,
    carCount: 30,
    aiSafetyScale: 0.58,
    aiDecisionScale: 0.58,
    maxSimultaneousAi: 4,
    invincibleSeconds: 1.0
  },
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
  normal: DIFFICULTY_PROFILES.normal.label,
  turbo: DIFFICULTY_PROFILES.turbo.label,
  master: DIFFICULTY_PROFILES.master.label
};

export const DIFFICULTIES: Difficulty[] = ['normal', 'turbo', 'master'];

/** The profile in force, plus the mode's traffic scale folded into `traffic`. */
export const tuning = {
  profile: DIFFICULTY_PROFILES.normal,
  player: 1,
  traffic: 1
};

export function applyTuning(difficulty: Difficulty, trafficScale: number): void {
  const profile = DIFFICULTY_PROFILES[difficulty];
  tuning.profile = profile;
  tuning.player = profile.playerSpeed;
  tuning.traffic = profile.trafficSpeed * trafficScale;
}
