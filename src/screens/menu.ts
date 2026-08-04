/** Mode select: header, difficulty pills with a live blurb, then one card per mode. */

import { app, startMode } from '../app';
import { DIFFICULTIES, DIFFICULTY_PROFILES } from '../difficulty';
import { MODES, ORIGINAL_MODE_IDS } from '../modes';
import { ctx, DESIGN_H, DESIGN_W } from '../platform';
import { chip, headline, hits, panel, screenBackground, type Rect } from '../render/ui';
import { bestScore, careerPoints } from '../storage';
import { UI } from '../theme';

const MARGIN = 14;
const PILL_Y = 74;
const PILL_H = 36;
const LIST_TOP = 148;
const ROW_H = 38;
const ROW_GAP = 3;

function pillRect(index: number): Rect {
  const w = (DESIGN_W - MARGIN * 2 - 12) / 3;
  return { x: MARGIN + index * (w + 6), y: PILL_Y, w, h: PILL_H };
}

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

  headline('HARBOR LOOP', MARGIN, 44, 30, UI.card);

  // Career total, the single number the friend ranking sorts on.
  const points = `${careerPoints()}`;
  ctx.font = '900 12px sans-serif';
  const pointsWidth = Math.max(64, ctx.measureText(points).width + 40);
  chip(
    { x: DESIGN_W - MARGIN - pointsWidth, y: 24, w: pointsWidth, h: 26 },
    `${points} PTS`,
    UI.chip,
    UI.primary
  );

  // Difficulty.
  DIFFICULTIES.forEach((difficulty, index) => {
    const rect = pillRect(index);
    const selected = app.difficulty === difficulty;
    panel(rect, {
      fill: selected ? UI.primary : UI.chip,
      radius: rect.h / 2,
      lift: selected ? 4 : 2
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = selected ? UI.ink : UI.card;
    ctx.font = '900 13px sans-serif';
    ctx.fillText(DIFFICULTY_PROFILES[difficulty].label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 5);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,246,228,0.72)';
  ctx.font = '600 11px sans-serif';
  ctx.fillText(DIFFICULTY_PROFILES[app.difficulty].blurb, DESIGN_W / 2, 130);

  // Mode cards.
  MODES.forEach((mode, index) => {
    const rect = rowRect(index);
    const fromOriginal = ORIGINAL_MODE_IDS.has(mode.id);
    panel(rect, { fill: fromOriginal ? UI.card : UI.cardAlt, radius: 11, lift: 3 });

    // Colour tab marks which game the mode comes from.
    ctx.save();
    roundRect(rect);
    ctx.clip();
    ctx.fillStyle = fromOriginal ? UI.primary : UI.good;
    ctx.fillRect(rect.x, rect.y, 5, rect.h);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = UI.ink;
    ctx.font = '900 13px sans-serif';
    ctx.fillText(mode.name, rect.x + 14, rect.y + 17);

    // Spell out the provenance rather than relying on the card tint alone.
    const nameWidth = ctx.measureText(mode.name).width;
    ctx.fillStyle = fromOriginal ? UI.primaryDeep : UI.good;
    ctx.font = '900 8px sans-serif';
    ctx.fillText(fromOriginal ? 'PJ' : 'NEW', rect.x + 19 + nameWidth, rect.y + 13);

    ctx.fillStyle = UI.inkSoft;
    ctx.font = '500 9.5px sans-serif';
    ctx.fillText(mode.rule, rect.x + 14, rect.y + 30);

    const best = bestScore(mode.id, app.difficulty);
    ctx.textAlign = 'right';
    if (best === null) {
      ctx.fillStyle = 'rgba(34,50,63,0.28)';
      ctx.font = '900 12px monospace';
      ctx.fillText('--', rect.x + rect.w - 12, rect.y + 24);
    } else {
      ctx.fillStyle = UI.ink;
      ctx.font = '900 16px monospace';
      ctx.fillText(String(best), rect.x + rect.w - 12, rect.y + 25);
    }
  });

  ctx.textAlign = 'center';
}

/** Local helper: the clip path for a card, used for the coloured edge tab. */
function roundRect(rect: Rect): void {
  const r = 11;
  ctx.beginPath();
  ctx.moveTo(rect.x + r, rect.y);
  ctx.arcTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h, r);
  ctx.arcTo(rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h, r);
  ctx.arcTo(rect.x, rect.y + rect.h, rect.x, rect.y, r);
  ctx.arcTo(rect.x, rect.y, rect.x + rect.w, rect.y, r);
  ctx.closePath();
}

/** Returns true when the tap was consumed. */
export function handleMenuTap(x: number, y: number): boolean {
  for (let i = 0; i < DIFFICULTIES.length; i++) {
    if (hits(pillRect(i), x, y)) {
      app.difficulty = DIFFICULTIES[i];
      return true;
    }
  }

  for (let i = 0; i < MODES.length; i++) {
    if (hits(rowRect(i), x, y)) {
      startMode(MODES[i].id);
      return true;
    }
  }
  return false;
}
