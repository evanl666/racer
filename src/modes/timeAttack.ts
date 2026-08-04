import { player } from '../state';
import { arc } from '../track';
import type { ModeDefinition } from './types';

const LAPS = 3;

let startDistance = 0;

/**
 * Time Attack (original, not from PixelJunk Racers).
 *
 * Three laps, stopwatch scoring. The only mode where a lower score wins, and the
 * only one where a crash costs you directly rather than resetting a combo.
 */
export const timeAttack: ModeDefinition = {
  id: 'time-attack',
  name: 'TIME ATTACK',
  rule: `跑完 ${LAPS} 圈 · 用时越短越好`,
  timeLimit: 180,
  scoreUnit: 'SECONDS',
  trafficScale: 0.9,
  lowerIsBetter: true,

  setup() {
    startDistance = player.distance;
  },

  update(_dt, run) {
    const lapsDone = (player.distance - startDistance) / arc.total;
    run.progress = Math.min(1, lapsDone / LAPS);
    // Score is the elapsed time, rounded to tenths, so it keeps ticking until the
    // run ends and then freezes at the finishing time.
    run.score = Math.round(run.elapsed * 10) / 10;
  },

  cleared() {
    return (player.distance - startDistance) / arc.total >= LAPS;
  }
};
