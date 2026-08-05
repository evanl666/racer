import { player } from '../state';
import type { ModeDefinition } from './types';

/**
 * Combo Racers: how many cars can you pass in a row before the clock stops you.
 *
 * A crash breaks the streak but never the record — the score is the best streak
 * of the run, so a mistake costs momentum rather than the whole attempt. There
 * is no clear condition; it is a pure score attack.
 */
export const comboRacers: ModeDefinition = {
  id: 'combo-racers',
  name: 'COMBO RACERS',
  rule: '限时 60 秒 · 看你能连超多少辆 · 撞车断连击',
  timeLimit: 60,
  scoreUnit: 'COMBO',
  trafficScale: 1,
  trackId: 'long-bay',
  stars: [12, 26, 40],

  update(_dt, run) {
    // bestCombo survives a crash, which is exactly what the score should be.
    run.score = player.bestCombo;
    run.progress = -1;
  },

  onCrash(run) {
    run.banner = 'COMBO LOST';
    run.bannerTimer = 1.1;
  }
};
