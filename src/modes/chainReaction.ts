import { player } from '../state';
import type { ModeDefinition } from './types';

const CHAIN_WINDOW = 3.2;
const ARM_COMBO = 5;

let chain = 0;
let best = 0;

/**
 * Chain Reaction (original, not from PixelJunk Racers).
 *
 * Five clean overtakes arm the car; each kill re-arms it but only for a short
 * window, so the mode is a race against your own timer rather than the clock.
 */
export const chainReaction: ModeDefinition = {
  id: 'chain-reaction',
  name: 'CHAIN REACTION',
  rule: `${ARM_COMBO} 次超车装填 · 每次摧毁刷新 ${CHAIN_WINDOW} 秒窗口`,
  timeLimit: 75,
  scoreUnit: 'CHAIN',
  trafficScale: 0.9,
  trackId: 'long-bay',
  stars: [3, 6, 10],

  setup() {
    chain = 0;
    best = 0;
    player.fireball = 0;
  },

  update(_dt, run) {
    if (player.fireball <= 0 && chain > 0) {
      chain = 0;
      run.banner = 'CHAIN BROKEN';
      run.bannerTimer = 0.9;
    }
    if (player.fireball <= 0 && player.combo > 0 && player.combo % ARM_COMBO === 0) {
      player.fireball = CHAIN_WINDOW;
    }
    run.score = best;
    run.progress = player.fireball > 0 ? Math.min(1, player.fireball / CHAIN_WINDOW) : -1;
  },

  onContact() {
    return player.fireball > 0 ? 'destroy' : 'crash';
  },

  onDestroy(_car, run) {
    chain += 1;
    if (chain > best) best = chain;
    player.fireball = CHAIN_WINDOW;
    run.banner = `CHAIN x${chain}`;
    run.bannerTimer = 0.7;
  },

  onCrash(run) {
    chain = 0;
    run.banner = 'CHAIN LOST';
    run.bannerTimer = 0.9;
  }
};
