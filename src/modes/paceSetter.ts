import { player } from '../state';
import type { ModeDefinition } from './types';

const BAND_HALF_WIDTH = 26;
const BAND_MIN = 150;
const BAND_MAX = 430;
const BAND_PERIOD = 13;

let inBandSeconds = 0;

/** Centre of the required speed band at a given point in the run. */
export function paceTarget(elapsed: number): number {
  const t = (Math.sin((elapsed / BAND_PERIOD) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  return BAND_MIN + (BAND_MAX - BAND_MIN) * t;
}

export function paceBandHalfWidth(): number {
  return BAND_HALF_WIDTH;
}

/**
 * Pace Setter (original, not from PixelJunk Racers).
 *
 * A moving speed window is the whole objective: too slow scores nothing, too
 * fast scores nothing, and traffic is only in the way. It is the one mode where
 * lifting off is the skill.
 */
export const paceSetter: ModeDefinition = {
  id: 'pace-setter',
  name: 'PACE SETTER',
  rule: '把车速保持在移动的目标区间内 · 计时 60 秒',
  timeLimit: 60,
  scoreUnit: 'POINTS',
  trafficScale: 0.85,
  trackId: 'grand-oval',
  stars: [1200, 2600, 4100],

  setup() {
    inBandSeconds = 0;
  },

  update(dt, run) {
    const target = paceTarget(run.elapsed);
    const delta = Math.abs(player.speed - target);
    const inside = delta <= BAND_HALF_WIDTH && player.state !== 'CRASHED';
    if (inside) inBandSeconds += dt;

    run.score = Math.floor(inBandSeconds * 100);
    run.progress = Math.max(0, 1 - delta / (BAND_HALF_WIDTH * 3));
  }
};
