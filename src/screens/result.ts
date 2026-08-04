/** Result screen: score, personal best, friend ranking and the share hook. */

import { app, openMenu, retryRun } from '../app';
import { DIFFICULTY_LABEL } from '../difficulty';
import { leaderboardAvailable, requestFriendRanking, sharedCanvas } from '../leaderboard';
import { modeById } from '../modes';
import { ctx, DESIGN_H, DESIGN_W, DPR } from '../platform';
import { roundRect } from '../render/primitives';
import { shareRun } from '../share';
import { COLORS } from '../theme';

const PANEL_X = 20;
const PANEL_W = DESIGN_W - PANEL_X * 2;
const PANEL_Y = 372;
const PANEL_H = 268;

interface Button {
  id: 'retry' | 'menu' | 'share';
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  primary: boolean;
}

const BUTTONS: Button[] = [
  { id: 'retry', label: '再来一次', x: PANEL_X, y: 664, w: PANEL_W, h: 52, primary: true },
  { id: 'share', label: '分享成绩', x: PANEL_X, y: 724, w: PANEL_W / 2 - 5, h: 46, primary: false },
  { id: 'menu', label: '选择模式', x: PANEL_X + PANEL_W / 2 + 5, y: 724, w: PANEL_W / 2 - 5, h: 46, primary: false }
];

const OUTCOME_TEXT: Record<string, string> = {
  cleared: '目标达成',
  timeout: '时间到',
  wrecked: '撞毁',
  running: ''
};

let rankingRequested = false;

export function enterResultScreen(): void {
  rankingRequested = false;
}

export function drawResult(): void {
  const summary = app.result;
  if (!summary) return;
  const mode = modeById(summary.modeId);

  ctx.fillStyle = '#0C1A23';
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

  ctx.textAlign = 'center';

  ctx.fillStyle = COLORS.muted;
  ctx.font = '700 11px sans-serif';
  ctx.fillText(DIFFICULTY_LABEL[summary.difficulty], DESIGN_W / 2, 92);

  ctx.fillStyle = COLORS.text;
  ctx.font = '900 26px sans-serif';
  ctx.fillText(mode.name, DESIGN_W / 2, 124);

  ctx.fillStyle = summary.outcome === 'cleared' ? COLORS.accentLight : COLORS.muted;
  ctx.font = '700 14px sans-serif';
  ctx.fillText(OUTCOME_TEXT[summary.outcome] ?? '', DESIGN_W / 2, 152);

  // Score block.
  ctx.fillStyle = summary.newBest ? COLORS.accentLight : COLORS.text;
  ctx.font = '900 76px monospace';
  ctx.fillText(String(summary.score), DESIGN_W / 2, 244);

  ctx.fillStyle = COLORS.muted;
  ctx.font = '700 12px sans-serif';
  ctx.fillText(summary.scoreUnit, DESIGN_W / 2, 268);

  if (summary.newBest) {
    ctx.fillStyle = COLORS.accent;
    ctx.font = '900 15px sans-serif';
    ctx.fillText('NEW BEST!', DESIGN_W / 2, 300);
  } else if (summary.best !== null) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 12px monospace';
    ctx.fillText(`BEST  ${summary.best}`, DESIGN_W / 2, 300);
  }

  drawRankingPanel();
  drawButtons();
}

function drawRankingPanel(): void {
  roundRect(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 14);
  ctx.fillStyle = 'rgba(8,17,25,0.66)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.buttonEdge;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.muted;
  ctx.font = '900 11px sans-serif';
  ctx.fillText('好友排行榜', PANEL_X + 14, PANEL_Y + 24);
  ctx.textAlign = 'center';

  if (!leaderboardAvailable()) {
    ctx.fillStyle = 'rgba(247,244,234,0.32)';
    ctx.font = '600 11px sans-serif';
    ctx.fillText('好友榜仅在微信小游戏内可用', DESIGN_W / 2, PANEL_Y + PANEL_H / 2);
    return;
  }

  const listY = PANEL_Y + 36;
  const listH = PANEL_H - 46;
  if (!rankingRequested) {
    requestFriendRanking(PANEL_W - 20, listH, DPR);
    rankingRequested = true;
  }

  const shared = sharedCanvas();
  if (shared) {
    try {
      // The open data context renders at device resolution; scale it back down.
      ctx.drawImage(shared as unknown as CanvasImageSource, PANEL_X + 10, listY, PANEL_W - 20, listH);
    } catch (error) {
      /* the sub-context may not have painted yet */
    }
  }
}

function drawButtons(): void {
  for (const button of BUTTONS) {
    roundRect(ctx, button.x, button.y, button.w, button.h, 14);
    ctx.fillStyle = button.primary ? COLORS.buttonActive : COLORS.button;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = button.primary ? COLORS.accentLight : COLORS.buttonEdge;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = button.primary ? COLORS.accentLight : COLORS.text;
    ctx.font = '900 15px sans-serif';
    ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2 + 5);
  }
}

/** Returns true when the tap was consumed. */
export function handleResultTap(x: number, y: number): boolean {
  for (const button of BUTTONS) {
    if (x < button.x || x > button.x + button.w) continue;
    if (y < button.y || y > button.y + button.h) continue;

    if (button.id === 'retry') retryRun();
    else if (button.id === 'menu') openMenu();
    else shareRun();
    return true;
  }
  return false;
}
