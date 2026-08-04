import { player } from '../state';
import type { ModeDefinition } from './types';

const RAMP_PER_SECOND = 0.008;

let baseline: number[] = [];

/**
 * Endurance (original, not from PixelJunk Racers).
 *
 * No clock, one life, traffic that never stops getting faster. Every run ends in
 * a crash eventually, which makes it the natural leaderboard mode.
 */
export const endurance: ModeDefinition = {
  id: 'endurance',
  name: 'ENDURANCE',
  rule: '无时间限制 · 一条命 · 车流永远在加速',
  timeLimit: Infinity,
  scoreUnit: 'PASSES',
  trafficScale: 0.75,
  stars: [15, 35, 62],

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
    run.progress = -1;
  },

  onCrash(run) {
    run.outcome = 'wrecked';
  }
};
