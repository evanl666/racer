/** Screen state machine and the navigation between menu, race and results. */

import { submitFriendScore } from './leaderboard';
import { MODES } from './modes';
import type { Difficulty, ModeId, RunOutcome } from './modes/types';
import { modeById } from './modes';
import { run, startRun } from './run';
import { bestScore, careerPoints, submitScore } from './storage';

export type Screen = 'MENU' | 'PLAYING' | 'RESULT';

export interface ResultSummary {
  modeId: ModeId;
  difficulty: Difficulty;
  outcome: RunOutcome;
  score: number;
  best: number | null;
  newBest: boolean;
  scoreUnit: string;
}

export const app = {
  screen: 'MENU' as Screen,
  difficulty: 'normal' as Difficulty,
  /** Pixels the mode list is scrolled by; only used when the list overflows. */
  menuScroll: 0,
  result: null as ResultSummary | null
};

export function openMenu(): void {
  app.screen = 'MENU';
}

export function startMode(modeId: ModeId): void {
  startRun(modeId, app.difficulty);
  app.screen = 'PLAYING';
}

export function retryRun(): void {
  const summary = app.result;
  if (summary) startRun(summary.modeId, summary.difficulty);
  else startMode(MODES[0].id);
  app.screen = 'PLAYING';
}

/** Called once when a run stops, to bank the score and show the result screen. */
export function finishRun(): void {
  const mode = modeById(run.modeId);
  const lowerIsBetter = Boolean(mode.lowerIsBetter);

  // A timed-out Time Attack never finished the laps, so its clock is not a result.
  const scoreCounts = !(lowerIsBetter && run.outcome !== 'cleared');
  const newBest = scoreCounts &&
    submitScore(run.modeId, run.difficulty, run.score, lowerIsBetter);

  app.result = {
    modeId: run.modeId,
    difficulty: run.difficulty,
    outcome: run.outcome,
    score: run.score,
    best: bestScore(run.modeId, run.difficulty),
    newBest,
    scoreUnit: mode.scoreUnit
  };

  if (newBest) submitFriendScore(careerPoints());
  app.screen = 'RESULT';
}
