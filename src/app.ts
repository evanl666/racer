/** Screen state machine and the navigation between menu, race and results. */

import { dailyPlan, dailyStage, todayKey } from './daily';
import { setShareContext, shareRun } from './share';
import { submitFriendScore, submitGlobalScore } from './leaderboard';
import { MODES } from './modes';
import type { Difficulty, ModeId, RunOutcome } from './modes/types';
import { modeById } from './modes';
import { modeUnlocked, starsFor } from './progress';
import { reviveAvailable, revive, run, startRun } from './run';
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
  /** 0 for an ordinary run, 1 or 2 for a daily stage. */
  stage: number;
  /** Score that would have cleared the stage. */
  stageTarget: number;
  day: string;
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

export function startMode(modeId: ModeId): boolean {
  // The menu already checks this; the guard keeps a deep link or a console call
  // from skipping the ladder.
  if (!modeUnlocked(modeId)) return false;
  startRun(modeId, app.difficulty);
  app.screen = 'PLAYING';
  return true;
}

/** Starts today's challenge at stage one. */
export function startDaily(): void {
  const plan = dailyPlan();
  const stage = dailyStage(plan, 1);
  startRun(plan.modeId, stage.difficulty, { seed: plan.seed, stage: 1, target: stage.target });
  app.screen = 'PLAYING';
}

function startDailyStageTwo(): void {
  const plan = dailyPlan();
  const stage = dailyStage(plan, 2);
  startRun(plan.modeId, stage.difficulty, { seed: plan.seed, stage: 2, target: stage.target });
  app.screen = 'PLAYING';
}

/**
 * Trades a share for a second chance.
 *
 * The mini game share API opens the picker but does not tell us whether the
 * player actually sent anything, and verifying it properly needs shareTicket
 * plus a server round trip. So the share fires and the revive is granted either
 * way; the point is to put sharing on the path of self-interest rather than to
 * police it.
 */
export function shareForRevive(): boolean {
  if (!reviveAvailable()) return false;
  setShareContext({
    modeId: run.modeId,
    difficulty: run.difficulty,
    score: run.score,
    scoreUnit: modeById(run.modeId).scoreUnit,
    stage: run.stage,
    stars: starsFor(run.modeId, run.difficulty)
  });
  shareRun();
  revive();
  app.screen = 'PLAYING';
  return true;
}

export function canRevive(): boolean {
  return reviveAvailable();
}

export function retryRun(): void {
  const summary = app.result;
  if (!summary) {
    startMode(MODES[0].id);
    return;
  }
  // Retrying a daily stage restarts that stage on the same seed, not a fresh one.
  if (summary.stage === 1) startDaily();
  else if (summary.stage === 2) startDailyStageTwo();
  else {
    startRun(summary.modeId, summary.difficulty);
    app.screen = 'PLAYING';
  }
}

/** Called once when a run stops, to bank the score and show the result screen. */
export function finishRun(): void {
  const mode = modeById(run.modeId);
  const lowerIsBetter = Boolean(mode.lowerIsBetter);

  // Clearing stage one drops straight into stage two: the whole point is the
  // cliff between them, and a result screen in between would soften it.
  if (run.daily && run.stage === 1 && run.outcome === 'cleared') {
    startDailyStageTwo();
    return;
  }

  // A timed-out Time Attack never finished the laps, so its clock is not a result,
  // and a zero is never worth recording as a personal best.
  const scoreCounts = run.score > 0 && !(lowerIsBetter && run.outcome !== 'cleared');
  // Daily runs use their own board and must not overwrite the mode's own best,
  // which was earned under the normal rules.
  const newBest = !run.daily && scoreCounts &&
    submitScore(run.modeId, run.difficulty, run.score, lowerIsBetter);

  app.result = {
    modeId: run.modeId,
    difficulty: run.difficulty,
    outcome: run.outcome,
    score: run.score,
    best: bestScore(run.modeId, run.difficulty),
    newBest,
    scoreUnit: mode.scoreUnit,
    stage: run.stage,
    stageTarget: run.stageTarget,
    day: run.daily ? todayKey() : ''
  };

  setShareContext({
    modeId: run.modeId,
    difficulty: run.difficulty,
    score: run.score,
    scoreUnit: mode.scoreUnit,
    stage: run.stage,
    stars: starsFor(run.modeId, run.difficulty)
  });

  if (run.daily) {
    // Daily scores go to their own board, partitioned by date.
    submitGlobalScore('daily' as ModeId, run.difficulty, run.score, false, todayKey());
    submitFriendScore(careerPoints());
  } else if (newBest) {
    submitFriendScore(careerPoints());
    submitGlobalScore(run.modeId, run.difficulty, run.score, lowerIsBetter);
  }
  app.screen = 'RESULT';
}
