import { player } from '../state';
import type { ModeDefinition } from './types';

const RAMP_PER_SECOND = 0.011;

let baseline: number[] = [];

/**
 * Rush Hour (original, not from PixelJunk Racers).
 *
 * Traffic accelerates for the whole run, so the gaps you learned in the first
 * twenty seconds stop existing by the last twenty.
 */
export const rushHour: ModeDefinition = {
  id: 'rush-hour',
  name: 'RUSH HOUR',
  rule: '车流持续提速 · 撑满 75 秒超越尽可能多的车',
  timeLimit: 75,
  scoreUnit: 'PASSES',
  trafficScale: 0.8,
  stars: [18, 33, 50],

  setup(_run, cars) {
    baseline = cars.map((car) => car.baseSpeed);
  },

  update(_dt, run, cars) {
    const ramp = 1 + run.elapsed * RAMP_PER_SECOND;
    cars.forEach((car, index) => {
      const original = baseline[index];
      if (original !== undefined) car.baseSpeed = original * ramp;
    });
    run.score = player.totalPasses;
    run.progress = Math.min(1, (ramp - 1) / (RAMP_PER_SECOND * 75));
  }
};
