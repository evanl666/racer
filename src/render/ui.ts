/**
 * Chunky UI widgets for the menu and result screens.
 *
 * Every surface is the same recipe: a hard offset shadow, a thick dark outline,
 * a flat fill. No blurs and no gradients, so it stays crisp at any density and
 * reads instantly on a phone — the look the big WeChat casual titles use.
 */

import { ctx } from '../platform';
import { UI } from '../theme';
import { roundRect } from './primitives';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function hits(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export interface PanelStyle {
  fill: string;
  outline?: string;
  radius?: number;
  /** Hard drop shadow distance in design pixels. 0 disables it. */
  lift?: number;
  outlineWidth?: number;
}

export function panel(rect: Rect, style: PanelStyle): void {
  const radius = style.radius ?? 14;
  const lift = style.lift ?? 4;
  const outline = style.outline ?? UI.outline;

  if (lift > 0) {
    roundRect(ctx, rect.x, rect.y + lift, rect.w, rect.h, radius);
    ctx.fillStyle = outline;
    ctx.fill();
  }

  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = style.fill;
  ctx.fill();
  ctx.lineWidth = style.outlineWidth ?? 2.5;
  ctx.strokeStyle = outline;
  ctx.stroke();
}

export type ButtonVariant = 'primary' | 'good' | 'plain';

const VARIANT_FILL: Record<ButtonVariant, string> = {
  primary: UI.primary,
  good: UI.good,
  plain: UI.card
};

export function chunkyButton(rect: Rect, label: string, variant: ButtonVariant = 'plain', size = 16): void {
  panel(rect, { fill: VARIANT_FILL[variant], radius: Math.min(18, rect.h / 2), lift: 5 });

  ctx.textAlign = 'center';
  ctx.fillStyle = UI.ink;
  ctx.font = `900 ${size}px sans-serif`;
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + size * 0.36);
}

/** A small filled capsule used for badges, scores and tags. */
export function chip(rect: Rect, label: string, fill: string, textColor: string, size = 11): void {
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, rect.h / 2);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  ctx.font = `900 ${size}px sans-serif`;
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + size * 0.36);
}

/** Heavy display text with a dark backing offset, so it reads over any fill. */
export function headline(text: string, x: number, y: number, size: number, fill: string, align: CanvasTextAlign = 'left'): void {
  ctx.textAlign = align;
  ctx.font = `900 ${size}px sans-serif`;
  ctx.fillStyle = UI.outline;
  ctx.fillText(text, x, y + 2.5);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

/** The shared screen background: deep water with faint diagonal banding. */
export function screenBackground(width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, UI.groundDeep);
  gradient.addColorStop(1, UI.ground);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.fillStyle = UI.groundStripe;
  for (let i = -height; i < width + height; i += 44) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 18, 0);
    ctx.lineTo(i + 18 + height, height);
    ctx.lineTo(i + height, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
