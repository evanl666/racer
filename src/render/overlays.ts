/** Full-screen mode effects drawn on top of the track: hazard lane and blackout. */

import { effects } from '../effects';
import { ctx, DESIGN_H, DESIGN_W } from '../platform';
import { COLORS } from '../theme';
import { pathForLane } from '../track';
import { strokeClosedPath } from './primitives';

export function drawHazardLane(): void {
  if (effects.hazardLane < 0) return;
  const path = pathForLane(effects.hazardLane);
  strokeClosedPath(path, 7.4, 'rgba(255,96,84,0.42)');
  strokeClosedPath(path, 2.6, 'rgba(255,196,120,0.85)', [7, 6]);
}

export function drawBlackout(): void {
  if (effects.dim <= 0) return;
  ctx.save();
  ctx.globalAlpha = effects.dim;
  ctx.fillStyle = '#050C12';
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
  ctx.restore();

  // A hairline of light keeps the player oriented instead of blind.
  if (effects.dim > 0.5) {
    ctx.save();
    ctx.globalAlpha = (effects.dim - 0.5) * 0.6;
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(0, DESIGN_H * 0.5 - 1, DESIGN_W, 2);
    ctx.restore();
  }
}
