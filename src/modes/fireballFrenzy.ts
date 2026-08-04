import { player } from '../state';
import type { ModeDefinition } from './types';

const COMBO_PER_FIREBALL = 10;
const FIREBALL_DURATION = 6;

/** Combo threshold already spent, reset per run. */
let lastCharge = 0;

/**
 * Fireball Frenzy: every ten overtakes ignites the car. While lit, contact stops
 * being a crash and starts being a kill, which flips the whole risk model of the
 * game for a few seconds at a time.
 */
export const fireballFrenzy: ModeDefinition = {
  id: 'fireball-frenzy',
  name: 'FIREBALL FRENZY',
  rule: `每 ${COMBO_PER_FIREBALL} 次超车化身火球 · 火球状态撞车即摧毁`,
  timeLimit: 60,
  scoreUnit: 'POINTS',
  trafficScale: 1,
  stars: [400, 1200, 2600],

  setup() {
    lastCharge = 0;
  },

  update(_dt, run) {
    const charge = Math.floor(player.combo / COMBO_PER_FIREBALL);
    if (charge > lastCharge) {
      lastCharge = charge;
      player.fireball = FIREBALL_DURATION;
      run.banner = 'FIREBALL!';
      run.bannerTimer = 1.2;
    }
    run.score = run.destroyed * 200 + player.totalPasses * 10;
    run.progress = player.fireball > 0 ? player.fireball / FIREBALL_DURATION : -1;
  },

  onContact(_car) {
    return player.fireball > 0 ? 'destroy' : 'crash';
  },

  onCrash(run) {
    lastCharge = 0;
    run.banner = 'BURNED OUT';
    run.bannerTimer = 1.0;
  }
};
