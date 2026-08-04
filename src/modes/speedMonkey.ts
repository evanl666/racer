import { player } from '../state';
import type { ModeDefinition } from './types';

/**
 * Speed Monkey: the combo never resets on its own, so the car just keeps getting
 * faster. One contact ends the run, which is the whole tension of the mode.
 */
export const speedMonkey: ModeDefinition = {
  id: 'speed-monkey',
  name: 'SPEED MONKEY',
  rule: '速度只增不减 · 撞一次就结束',
  timeLimit: Infinity,
  scoreUnit: 'COMBO',
  trafficScale: 1,
  trackId: 'long-bay',
  stars: [10, 26, 48],

  update(_dt, run) {
    run.progress = -1;
    if (player.combo > run.score) run.score = player.combo;
  },

  onCrash(run) {
    run.outcome = 'wrecked';
  }
};
