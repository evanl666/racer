/** Mode select: difficulty pills on top, then one row per mode. */

import { app, startMode } from '../app';
import { DIFFICULTIES, DIFFICULTY_LABEL } from '../difficulty';
import { MODES, ORIGINAL_MODE_IDS } from '../modes';
import { ctx, DESIGN_H, DESIGN_W } from '../platform';
import { roundRect } from '../render/primitives';
import { bestScore, careerPoints } from '../storage';
import { COLORS } from '../theme';

const PILL_Y = 92;
const PILL_H = 34;
const LIST_TOP = 146;
const ROW_H = 41;
const ROW_GAP = 2;
const LIST_MARGIN = 16;

function pillRect(index: number): { x: number; y: number; w: number; h: number } {
  const w = (DESIGN_W - LIST_MARGIN * 2 - 12) / 3;
  return { x: LIST_MARGIN + index * (w + 6), y: PILL_Y, w, h: PILL_H };
}

function rowRect(index: number): { x: number; y: number; w: number; h: number } {
  return {
    x: LIST_MARGIN,
    y: LIST_TOP + index * (ROW_H + ROW_GAP),
    w: DESIGN_W - LIST_MARGIN * 2,
    h: ROW_H
  };
}

export function drawMenu(): void {
  ctx.fillStyle = '#0C1A23';
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.text;
  ctx.font = '900 30px sans-serif';
  ctx.fillText('HARBOR LOOP', LIST_MARGIN, 52);

  ctx.fillStyle = COLORS.muted;
  ctx.font = '600 11px sans-serif';
  ctx.fillText('16 MODES · 3 SPEEDS · 48 LEADERBOARDS', LIST_MARGIN, 70);

  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.accent;
  ctx.font = '900 13px monospace';
  ctx.fillText(`${careerPoints()} PTS`, DESIGN_W - LIST_MARGIN, 52);

  // Difficulty pills.
  DIFFICULTIES.forEach((difficulty, index) => {
    const rect = pillRect(index);
    const selected = app.difficulty === difficulty;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = selected ? COLORS.buttonActive : COLORS.button;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = selected ? COLORS.accentLight : COLORS.buttonEdge;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = selected ? COLORS.accentLight : COLORS.muted;
    ctx.font = '900 12px sans-serif';
    ctx.fillText(DIFFICULTY_LABEL[difficulty], rect.x + rect.w / 2, rect.y + 22);
  });

  // Mode rows.
  MODES.forEach((mode, index) => {
    const rect = rowRect(index);
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 9);
    ctx.fillStyle = COLORS.button;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS.buttonEdge;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.text;
    ctx.font = '900 13px sans-serif';
    ctx.fillText(mode.name, rect.x + 10, rect.y + 17);

    // A quiet marker separates the documented originals from the new modes.
    if (ORIGINAL_MODE_IDS.has(mode.id)) {
      const labelWidth = ctx.measureText(mode.name).width;
      ctx.fillStyle = COLORS.accent;
      ctx.font = '900 8px sans-serif';
      ctx.fillText('PJ', rect.x + 16 + labelWidth, rect.y + 13);
    }

    ctx.fillStyle = COLORS.muted;
    ctx.font = '500 9.5px sans-serif';
    ctx.fillText(mode.rule, rect.x + 10, rect.y + 32);

    const best = bestScore(mode.id, app.difficulty);
    ctx.textAlign = 'right';
    if (best === null) {
      ctx.fillStyle = 'rgba(247,244,234,0.28)';
      ctx.font = '700 10px monospace';
      ctx.fillText('--', rect.x + rect.w - 10, rect.y + 25);
    } else {
      ctx.fillStyle = COLORS.accentLight;
      ctx.font = '900 14px monospace';
      ctx.fillText(String(best), rect.x + rect.w - 10, rect.y + 25);
    }
  });

  ctx.textAlign = 'center';
}

/** Returns true when the tap was consumed. */
export function handleMenuTap(x: number, y: number): boolean {
  for (let i = 0; i < DIFFICULTIES.length; i++) {
    const rect = pillRect(i);
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
      app.difficulty = DIFFICULTIES[i];
      return true;
    }
  }

  for (let i = 0; i < MODES.length; i++) {
    const rect = rowRect(i);
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
      startMode(MODES[i].id);
      return true;
    }
  }
  return false;
}
