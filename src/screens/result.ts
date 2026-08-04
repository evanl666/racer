/** Result screen: score card, friend ranking and the three actions. */

import { app, openMenu, retryRun } from '../app';
import { DIFFICULTY_PROFILES } from '../difficulty';
import { leaderboardAvailable, requestFriendRanking, sharedCanvas } from '../leaderboard';
import { modeById } from '../modes';
import { nextStarTarget, starsFor } from '../progress';
import { drawStar } from '../render/icons';
import { ctx, DESIGN_H, DESIGN_W, DPR } from '../platform';
import {
  chip,
  chunkyButton,
  headline,
  hits,
  panel,
  screenBackground,
  type Rect
} from '../render/ui';
import { shareRun } from '../share';
import { UI } from '../theme';

const MARGIN = 20;
const CONTENT_W = DESIGN_W - MARGIN * 2;

const SCORE_CARD: Rect = { x: MARGIN, y: 96, w: CONTENT_W, h: 214 };
const RANK_CARD: Rect = { x: MARGIN, y: 328, w: CONTENT_W, h: 300 };

const RETRY: Rect = { x: MARGIN, y: 648, w: CONTENT_W, h: 56 };
const SHARE: Rect = { x: MARGIN, y: 716, w: CONTENT_W / 2 - 5, h: 50 };
const MENU: Rect = { x: MARGIN + CONTENT_W / 2 + 5, y: 716, w: CONTENT_W / 2 - 5, h: 50 };

const OUTCOME: Record<string, { text: string; fill: string }> = {
  cleared: { text: '目标达成', fill: UI.good },
  timeout: { text: '时间到', fill: UI.primary },
  wrecked: { text: '撞毁', fill: UI.bad },
  running: { text: '', fill: UI.primary }
};

let rankingRequested = false;

export function enterResultScreen(): void {
  rankingRequested = false;
}

export function drawResult(): void {
  const summary = app.result;
  if (!summary) return;
  const mode = modeById(summary.modeId);
  const outcome = OUTCOME[summary.outcome] ?? OUTCOME.running;

  screenBackground(DESIGN_W, DESIGN_H);

  headline(mode.name, DESIGN_W / 2, 56, 24, UI.card, 'center');

  ctx.font = '900 11px sans-serif';
  const diffLabel = DIFFICULTY_PROFILES[summary.difficulty].label;
  const diffWidth = Math.max(72, ctx.measureText(diffLabel).width + 32);
  chip(
    { x: (DESIGN_W - diffWidth) / 2, y: 66, w: diffWidth, h: 22 },
    diffLabel,
    UI.chip,
    UI.primary
  );

  // --- score card ---
  panel(SCORE_CARD, { fill: UI.card, radius: 18, lift: 6 });

  ctx.textAlign = 'center';
  ctx.fillStyle = outcome.fill;
  ctx.font = '900 17px sans-serif';
  ctx.fillText(outcome.text, DESIGN_W / 2, SCORE_CARD.y + 34);

  ctx.fillStyle = UI.ink;
  ctx.font = '900 70px monospace';
  ctx.fillText(String(summary.score), DESIGN_W / 2, SCORE_CARD.y + 116);

  ctx.fillStyle = UI.inkSoft;
  ctx.font = '900 11px sans-serif';
  ctx.fillText(summary.scoreUnit, DESIGN_W / 2, SCORE_CARD.y + 138);

  // Stars are the progression currency, so they get the most weight after the score.
  const earned = starsFor(summary.modeId, summary.difficulty);
  for (let i = 0; i < 3; i++) {
    drawStar(DESIGN_W / 2 - 34 + i * 34, SCORE_CARD.y + 162, 14, i < earned ? UI.primary : 'rgba(34,50,63,0.16)', i < earned);
  }

  const target = nextStarTarget(summary.modeId, summary.difficulty);
  ctx.textAlign = 'center';
  ctx.fillStyle = UI.inkSoft;
  ctx.font = '700 10px sans-serif';
  if (summary.newBest) {
    ctx.fillStyle = UI.primaryDeep;
    ctx.font = '900 11px sans-serif';
    ctx.fillText('NEW BEST!', DESIGN_W / 2, SCORE_CARD.y + 192);
  } else if (target !== null) {
    ctx.fillText(`下一颗星：${target} ${summary.scoreUnit}`, DESIGN_W / 2, SCORE_CARD.y + 192);
  } else if (summary.best !== null) {
    ctx.fillText(`BEST ${summary.best}`, DESIGN_W / 2, SCORE_CARD.y + 192);
  }

  drawRankingPanel();

  chunkyButton(RETRY, '再来一次', 'primary', 18);
  chunkyButton(SHARE, '分享成绩', 'good', 15);
  chunkyButton(MENU, '选择模式', 'plain', 15);
}

function drawRankingPanel(): void {
  panel(RANK_CARD, { fill: UI.chip, radius: 16, lift: 5 });

  ctx.textAlign = 'left';
  ctx.fillStyle = UI.card;
  ctx.font = '900 12px sans-serif';
  ctx.fillText('好友排行榜', RANK_CARD.x + 14, RANK_CARD.y + 26);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,246,228,0.45)';
  ctx.font = '600 9px sans-serif';
  ctx.fillText('按生涯积分排名', RANK_CARD.x + RANK_CARD.w - 14, RANK_CARD.y + 26);
  ctx.textAlign = 'center';

  const listY = RANK_CARD.y + 38;
  const listH = RANK_CARD.h - 48;

  if (!leaderboardAvailable()) {
    ctx.fillStyle = 'rgba(255,246,228,0.38)';
    ctx.font = '600 11px sans-serif';
    ctx.fillText('好友榜仅在微信小游戏内可用', DESIGN_W / 2, RANK_CARD.y + RANK_CARD.h / 2);
    return;
  }

  if (!rankingRequested) {
    requestFriendRanking(RANK_CARD.w - 20, listH, DPR);
    rankingRequested = true;
  }

  const shared = sharedCanvas();
  if (shared) {
    try {
      // The open data context renders at device resolution; scale it back down.
      ctx.drawImage(shared as unknown as CanvasImageSource, RANK_CARD.x + 10, listY, RANK_CARD.w - 20, listH);
    } catch (error) {
      /* the sub-context may not have painted yet */
    }
  }
}

/** Returns true when the tap was consumed. */
export function handleResultTap(x: number, y: number): boolean {
  if (hits(RETRY, x, y)) {
    retryRun();
    return true;
  }
  if (hits(MENU, x, y)) {
    openMenu();
    return true;
  }
  if (hits(SHARE, x, y)) {
    shareRun();
    return true;
  }
  return false;
}
