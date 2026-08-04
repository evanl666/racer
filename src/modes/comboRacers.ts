import { player } from '../state';
import type { ModeDefinition } from './types';

/** Combo needed to clear the mode, standing in for catching the leader. */
const TARGET_COMBO = 40;

/**
 * Combo Racers: overtakes build the combo and the speed tier, a crash wipes both,
 * and the clock never stops. Clearing means reaching the target combo in time.
 */
export const comboRacers: ModeDefinition = {
  id: 'combo-racers',
  name: 'COMBO RACERS',
  rule: `限时 60 秒 · Combo 冲到 ${TARGET_COMBO} · 撞车清零`,
  timeLimit: 60,
  scoreUnit: 'COMBO',
  trafficScale: 1,

  update(_dt, run) {
    if (player.combo > run.score) run.score = player.combo;
    run.progress = Math.min(1, player.combo / TARGET_COMBO);
  },

  onCrash(run) {
    run.banner = 'COMBO LOST';
    run.bannerTimer = 1.1;
  },

  cleared(run) {
    return run.score >= TARGET_COMBO;
  }
};
