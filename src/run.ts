/** Run lifecycle: starting a mode, ticking its rules, deciding when it ends. */

import { applyTuning } from './difficulty';
import { resetEffects } from './effects';
import { MODES, modeById } from './modes';
import { clearSeed, setSeed } from './rng';
import type { Difficulty, ModeDefinition, ModeId, RunState } from './modes/types';
import { resetClock } from './clock';
import { clearParticles } from './render/particles';
import { resetFeel } from './feel';
import { aiCars, player, resetGame } from './state';
import { setTrack } from './track';

export const run: RunState = {
  modeId: MODES[0].id,
  difficulty: 'normal',
  elapsed: 0,
  timeRemaining: Infinity,
  score: 0,
  destroyed: 0,
  crashes: 0,
  closeCalls: 0,
  daily: false,
  stage: 0,
  stageTarget: 0,
  outcome: 'running',
  progress: -1,
  banner: '',
  bannerTimer: 0
};

export let activeMode: ModeDefinition = MODES[0];

export interface DailyRunOptions {
  seed: number;
  stage: 1 | 2;
  target: number;
}

export function startRun(modeId: ModeId, difficulty: Difficulty, daily?: DailyRunOptions): void {
  activeMode = modeById(modeId);

  // Seed before anything that draws randomness, so the whole run is reproducible.
  if (daily) setSeed(daily.seed);
  else clearSeed();

  // Order matters: the circuit defines the lap length that car placement uses,
  // and tuning defines the speeds they are built with.
  setTrack(activeMode.trackId);
  applyTuning(difficulty, activeMode.trafficScale);
  resetGame();
  resetEffects();
  resetFeel();
  clearParticles();
  // However long the menu was open must not land on the first frame of the run.
  resetClock();

  run.modeId = modeId;
  run.difficulty = difficulty;
  run.elapsed = 0;
  run.timeRemaining = activeMode.timeLimit;
  run.score = 0;
  run.destroyed = 0;
  run.crashes = 0;
  run.closeCalls = 0;
  run.daily = Boolean(daily);
  run.stage = daily ? daily.stage : 0;
  run.stageTarget = daily ? daily.target : 0;
  run.outcome = 'running';
  run.progress = -1;
  run.banner = '';
  run.bannerTimer = 0;

  activeMode.setup?.(run, aiCars);
}

export function updateRun(dt: number): void {
  if (run.outcome !== 'running') return;

  run.elapsed += dt;
  if (Number.isFinite(run.timeRemaining)) {
    run.timeRemaining = Math.max(0, run.timeRemaining - dt);
  }

  run.bannerTimer = Math.max(0, run.bannerTimer - dt);
  if (run.bannerTimer <= 0) run.banner = '';

  activeMode.update?.(dt, run, aiCars);

  // A mode's own update may already have ended the run (Speed Monkey on contact).
  if (run.outcome !== 'running') return;

  // A daily stage is cleared by its own target, not the mode's usual objective.
  if (run.daily) {
    if (run.score >= run.stageTarget) run.outcome = 'cleared';
  } else if (activeMode.cleared?.(run, aiCars)) run.outcome = 'cleared';
  if (run.outcome !== 'running') return;
  if (activeMode.failed?.(run, aiCars)) run.outcome = 'wrecked';
  else if (run.timeRemaining <= 0) run.outcome = 'timeout';
}

export function runIsOver(): boolean {
  return run.outcome !== 'running';
}

/** Score is only worth recording when the player actually got going. */
export function runProducedScore(): boolean {
  return run.elapsed > 1 && (run.score > 0 || player.totalPasses > 0);
}
