import { player } from '../state';
import type { ModeDefinition } from './types';

/**
 * Sunday Drivers: the traffic crawls, so the road is dense and the only question
 * is how many cars you can thread past. Crashes are counted because a clean run
 * is what the original rewards with gold.
 */
export const sundayDrivers: ModeDefinition = {
  id: 'sunday-drivers',
  name: 'SUNDAY DRIVERS',
  rule: '车流极慢 · 限时 60 秒超越尽可能多的车',
  timeLimit: 60,
  scoreUnit: 'PASSES',
  trafficScale: 0.42,

  update(_dt, run) {
    run.score = player.totalPasses;
    run.progress = -1;
  },

  onCrash(run) {
    run.banner = `CRASH x${run.crashes}`;
    run.bannerTimer = 0.9;
  }
};
