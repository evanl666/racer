/** Mode select: progress header, difficulty pills, and one card per mode. */

import { app, startDaily, startMode } from '../app';
import { dailyPlan } from '../daily';
import { DIFFICULTIES, DIFFICULTY_PROFILES } from '../difficulty';
import { MODES, ORIGINAL_MODE_IDS } from '../modes';
import { trackById } from '../tracks';
import { ctx, DESIGN_H, DESIGN_W } from '../platform';
import {
  difficultyUnlockCost,
  difficultyUnlocked,
  maxStars,
  modeUnlockCost,
  modeUnlocked,
  nextUnlock,
  starsFor,
  totalStars
} from '../progress';
import { drawLock, drawStar } from '../render/icons';
import { chip, headline, hits, panel, screenBackground, type Rect } from '../render/ui';
import { bestScore } from '../storage';
import { UI } from '../theme';

const MARGIN = 14;
const PILL_Y = 78;
const PILL_H = 34;
const DAILY_Y = 142;
const DAILY_H = 44;
const LIST_TOP = 196;
const ROW_H = 36;
const ROW_GAP = 2;

/** Transient message shown when a locked row is tapped. */
const toast = { text: '', timer: 0 };

export function updateMenu(dt: number): void {
  toast.timer = Math.max(0, toast.timer - dt);
  if (toast.timer <= 0) toast.text = '';
}

function pillRect(index: number): Rect {
  const w = (DESIGN_W - MARGIN * 2 - 12) / 3;
  return { x: MARGIN + index * (w + 6), y: PILL_Y, w, h: PILL_H };
}

const DAILY_RECT: Rect = { x: MARGIN, y: DAILY_Y, w: DESIGN_W - MARGIN * 2, h: DAILY_H };

function rowRect(index: number): Rect {
  return {
    x: MARGIN,
    y: LIST_TOP + index * (ROW_H + ROW_GAP),
    w: DESIGN_W - MARGIN * 2,
    h: ROW_H
  };
}

export function drawMenu(): void {
  screenBackground(DESIGN_W, DESIGN_H);
  const stars = totalStars();

  headline('HARBOR LOOP', MARGIN, 42, 28, UI.card);

  // Star total is the progression currency, so it gets the loud slot.
  const starText = `${stars}/${maxStars()}`;
  ctx.font = '900 12px sans-serif';
  const starWidth = Math.max(78, ctx.measureText(starText).width + 42);
  const starChip: Rect = { x: DESIGN_W - MARGIN - starWidth, y: 22, w: starWidth, h: 26 };
  chip(starChip, '', UI.chip, UI.primary);
  drawStar(starChip.x + 17, starChip.y + 13, 7, UI.primary, true);
  ctx.textAlign = 'left';
  ctx.fillStyle = UI.primary;
  ctx.font = '900 12px sans-serif';
  ctx.fillText(starText, starChip.x + 28, starChip.y + 17);

  const next = nextUnlock();
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,246,228,0.55)';
  ctx.font = '600 10px sans-serif';
  ctx.fillText(
    next ? `再拿 ${next.cost - stars} 颗星解锁 ${next.label}` : '全部模式和难度已解锁',
    MARGIN,
    60
  );

  // Difficulty.
  DIFFICULTIES.forEach((difficulty, index) => {
    const rect = pillRect(index);
    const unlocked = difficultyUnlocked(difficulty, stars);
    const selected = app.difficulty === difficulty && unlocked;
    panel(rect, {
      fill: selected ? UI.primary : UI.chip,
      radius: rect.h / 2,
      lift: selected ? 4 : 2
    });

    ctx.textAlign = 'center';
    if (!unlocked) {
      const cost = String(difficultyUnlockCost(difficulty));
      ctx.font = '900 11px sans-serif';
      const width = ctx.measureText(cost).width;
      const centre = rect.x + rect.w / 2;
      drawLock(centre - width / 2 - 16, rect.y + rect.h / 2, 9, 'rgba(255,246,228,0.5)');
      drawStar(centre - width / 2 - 2, rect.y + rect.h / 2 - 1, 5, 'rgba(255,246,228,0.5)', true);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,246,228,0.5)';
      ctx.fillText(cost, centre - width / 2 + 6, rect.y + rect.h / 2 + 4);
    } else {
      ctx.fillStyle = selected ? UI.ink : UI.card;
      ctx.font = '900 13px sans-serif';
      ctx.fillText(DIFFICULTY_PROFILES[difficulty].label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 5);
    }
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,246,228,0.72)';
  ctx.font = '600 11px sans-serif';
  ctx.fillText(DIFFICULTY_PROFILES[app.difficulty].blurb, DESIGN_W / 2, 130);

  drawDailyCard();

  MODES.forEach((mode, index) => {
    drawModeRow(mode.id, index, stars);
  });

  if (toast.text) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, toast.timer * 2.5);
    const width = 250;
    panel({ x: (DESIGN_W - width) / 2, y: DESIGN_H / 2 - 26, w: width, h: 52 }, {
      fill: UI.chip,
      radius: 14,
      lift: 4
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = UI.card;
    ctx.font = '900 13px sans-serif';
    ctx.fillText(toast.text, DESIGN_W / 2, DESIGN_H / 2 + 5);
    ctx.restore();
  }

  ctx.textAlign = 'center';
}

/**
 * The daily challenge sits above the ladder and ignores it: it is the one thing
 * every player has in common on a given day, so gating it would defeat it.
 */
function drawDailyCard(): void {
  const plan = dailyPlan();
  const mode = MODES.find((entry) => entry.id === plan.modeId);
  panel(DAILY_RECT, { fill: UI.primary, radius: 13, lift: 4 });

  ctx.textAlign = 'left';
  ctx.fillStyle = UI.ink;
  ctx.font = '900 14px sans-serif';
  ctx.fillText('每日挑战', DAILY_RECT.x + 14, DAILY_RECT.y + 20);

  ctx.font = '600 9.5px sans-serif';
  ctx.fillStyle = 'rgba(34,50,63,0.7)';
  ctx.fillText(
    `${plan.day} · ${mode ? mode.name : ''} · 两关 · 全服同一份车流`,
    DAILY_RECT.x + 14,
    DAILY_RECT.y + 35
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = UI.ink;
  ctx.font = '900 12px sans-serif';
  ctx.fillText('开始 ▸', DAILY_RECT.x + DAILY_RECT.w - 14, DAILY_RECT.y + 27);
}

function drawModeRow(modeId: (typeof MODES)[number]['id'], index: number, stars: number): void {
  const mode = MODES[index];
  const rect = rowRect(index);
  const unlocked = modeUnlocked(modeId, stars);
  const fromOriginal = ORIGINAL_MODE_IDS.has(modeId);

  panel(rect, {
    fill: unlocked ? (fromOriginal ? UI.card : UI.cardAlt) : 'rgba(255,246,228,0.13)',
    radius: 11,
    lift: unlocked ? 3 : 1,
    outlineWidth: unlocked ? 2.5 : 1.4
  });

  if (!unlocked) {
    drawLock(rect.x + 22, rect.y + rect.h / 2, 11, 'rgba(255,246,228,0.55)');

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,246,228,0.5)';
    ctx.font = '900 12px sans-serif';
    ctx.fillText(mode.name, rect.x + 40, rect.y + 24);

    // Place the star from the measured width, or a two-digit cost overlaps it.
    const costText = String(modeUnlockCost(modeId));
    ctx.textAlign = 'right';
    ctx.fillStyle = UI.primary;
    ctx.font = '900 13px sans-serif';
    ctx.fillText(costText, rect.x + rect.w - 14, rect.y + 24);
    const costWidth = ctx.measureText(costText).width;
    drawStar(rect.x + rect.w - 22 - costWidth, rect.y + rect.h / 2 - 1, 6, UI.primary, true);
    return;
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = UI.ink;
  ctx.font = '900 13px sans-serif';
  ctx.fillText(mode.name, rect.x + 12, rect.y + 16);

  const nameWidth = ctx.measureText(mode.name).width;
  ctx.fillStyle = fromOriginal ? UI.primaryDeep : UI.good;
  ctx.font = '900 8px sans-serif';
  ctx.fillText(fromOriginal ? 'PJ' : 'NEW', rect.x + 17 + nameWidth, rect.y + 12);

  ctx.fillStyle = UI.inkSoft;
  ctx.font = '500 9px sans-serif';
  ctx.fillText(mode.rule, rect.x + 12, rect.y + 29);

  ctx.fillStyle = 'rgba(34,50,63,0.3)';
  ctx.font = '700 7px sans-serif';
  ctx.fillText(trackById(mode.trackId).name, rect.x + rect.w - 118, rect.y + 29);

  // Three stars for the selected difficulty, then the score that earned them.
  const earned = starsFor(modeId, app.difficulty);
  for (let i = 0; i < 3; i++) {
    drawStar(rect.x + rect.w - 66 + i * 15, rect.y + 14, 6, i < earned ? UI.primary : 'rgba(34,50,63,0.18)', i < earned);
  }

  const best = bestScore(modeId, app.difficulty);
  ctx.textAlign = 'right';
  if (best === null) {
    ctx.fillStyle = 'rgba(34,50,63,0.3)';
    ctx.font = '900 10px monospace';
    ctx.fillText('--', rect.x + rect.w - 14, rect.y + 31);
  } else {
    ctx.fillStyle = UI.ink;
    ctx.font = '900 12px monospace';
    ctx.fillText(String(best), rect.x + rect.w - 14, rect.y + 31);
  }
}

/** Returns true when the tap was consumed. */
export function handleMenuTap(x: number, y: number): boolean {
  const stars = totalStars();

  if (hits(DAILY_RECT, x, y)) {
    startDaily();
    return true;
  }

  for (let i = 0; i < DIFFICULTIES.length; i++) {
    if (!hits(pillRect(i), x, y)) continue;
    const difficulty = DIFFICULTIES[i];
    if (!difficultyUnlocked(difficulty, stars)) {
      showToast(`需要 ${difficultyUnlockCost(difficulty)} 颗星解锁`);
    } else {
      app.difficulty = difficulty;
    }
    return true;
  }

  for (let i = 0; i < MODES.length; i++) {
    if (!hits(rowRect(i), x, y)) continue;
    const mode = MODES[i];
    if (!modeUnlocked(mode.id, stars)) {
      showToast(`需要 ${modeUnlockCost(mode.id)} 颗星解锁`);
    } else {
      startMode(mode.id);
    }
    return true;
  }
  return false;
}

function showToast(text: string): void {
  toast.text = text;
  toast.timer = 1.6;
}
