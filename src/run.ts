/** Run lifecycle: starting a mode, ticking its rules, deciding when it ends. */

import { applyTuning } from './difficulty';
import { resetEffects } from './effects';
import { MODES, modeById } from './modes';
import type { Difficulty, ModeDefinition, ModeId, RunState } from './modes/types';
import { aiCars, player, resetGame } from './state';

export const run: RunState = {
  modeId: MODES[0].id,
  difficulty: 'normal',
  elapsed: 0,
  timeRemaining: Infinity,
  score: 0,
  destroyed: 0,
  crashes: 0,
  outcome: 'running',
  progress: -1,
  banner: '',
  bannerTimer: 0
};

export let activeMode: ModeDefinition = MODES[0];

export function startRun(modeId: ModeId, difficulty: Difficulty): void {
  activeMode = modeById(modeId);

  // Tuning must be applied before resetGame so the AI cars are built at the
  // right speeds for this difficulty.
  applyTuning(difficulty, activeMode.trafficScale);
  resetGame();
  resetEffects();

  run.modeId = modeId;
  run.difficulty = difficulty;
  run.elapsed = 0;
  run.timeRemaining = activeMode.timeLimit;
  run.score = 0;
  run.destroyed = 0;
  run.crashes = 0;
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

  if (activeMode.cleared?.(run, aiCars)) run.outcome = 'cleared';
  else if (activeMode.failed?.(run, aiCars)) run.outcome = 'wrecked';
  else if (run.timeRemaining <= 0) run.outcome = 'timeout';
}

export function runIsOver(): boolean {
  return run.outcome !== 'running';
}

/** Score is only worth recording when the player actually got going. */
export function runProducedScore(): boolean {
  return run.elapsed > 1 && (run.score > 0 || player.totalPasses > 0);
}
