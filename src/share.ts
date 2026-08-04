/**
 * Share hooks.
 *
 * WeChat shares a card into a chat; the title carries the score so the pull is
 * "beat this", not "try this game". Outside WeChat this is a no-op.
 */

import { app } from './app';
import { DIFFICULTY_LABEL } from './difficulty';
import { modeById } from './modes';

type ShareOptions = {
  title: string;
  query?: string;
  imageUrl?: string;
};

function shareTitle(): string {
  const summary = app.result;
  if (!summary) return 'Harbor Loop — 16 种模式的像素赛车';
  const mode = modeById(summary.modeId);
  return `我在 ${mode.name}(${DIFFICULTY_LABEL[summary.difficulty]}) 拿了 ${summary.score} ${summary.scoreUnit}，来超我`;
}

function shareQuery(): string {
  const summary = app.result;
  if (!summary) return '';
  // Lets a tapped card open straight into the mode that was shared.
  return `mode=${summary.modeId}&difficulty=${summary.difficulty}`;
}

export function shareRun(): void {
  const api = wx as unknown as { shareAppMessage?(options: ShareOptions): void };
  if (typeof api.shareAppMessage !== 'function') return;
  try {
    api.shareAppMessage({ title: shareTitle(), query: shareQuery() });
  } catch (error) {
    /* sharing is optional */
  }
}

/** Registers the pull-down / menu share entry so every share carries a score. */
export function installShareMenu(): void {
  const api = wx as unknown as {
    showShareMenu?(options: { withShareTicket?: boolean }): void;
    onShareAppMessage?(handler: () => ShareOptions): void;
  };
  try {
    api.showShareMenu?.({ withShareTicket: true });
    api.onShareAppMessage?.(() => ({ title: shareTitle(), query: shareQuery() }));
  } catch (error) {
    /* sharing is optional */
  }
}
