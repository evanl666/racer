/** Combo readout, crash banner and the on-screen control bar. */

import { PLAYER_TIER_BOOST_DURATION } from '../config';
import { CONTROL_RADIUS, CONTROLS, laneButtonFlash } from '../controls';
import { ctx } from '../platform';
import { inputState, player } from '../state';
import { COLORS } from '../theme';
import { roundRect } from './primitives';

export function drawHud(): void {
  // Keep the track unobstructed: only a compact combo readout remains in one corner.
  ctx.fillStyle = 'rgba(8,17,25,0.66)';
  roundRect(ctx, 12, 12, 68, 42, 13);
  ctx.fill();
  ctx.fillStyle = player.combo > 0 ? COLORS.accentLight : COLORS.text;
  const tierPulse = player.tierBoostElapsed > 0
    ? 1 + Math.sin((PLAYER_TIER_BOOST_DURATION - player.tierBoostElapsed) * Math.PI * 8) * 0.08
    : 1;
  ctx.save();
  ctx.translate(46, 35);
  ctx.scale(tierPulse, tierPulse);
  ctx.font = '900 25px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`x${player.combo}`, 0, 5);
  ctx.restore();

  if (player.state === 'CRASHED') {
    ctx.fillStyle = 'rgba(255,79,82,0.92)';
    roundRect(ctx, 122, 390, 146, 54, 16);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 21px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRASH!', 195, 420);
    ctx.font = '700 9px sans-serif';
    ctx.fillText('COMBO RESET', 195, 437);
  }
}

function drawLaneArrow(cx: number, cy: number, direction: number, color: string): void {
  // direction +1 is the left-hand lane change, so it draws the left-pointing arrow.
  const tip = direction > 0 ? -15 : 15;
  ctx.beginPath();
  ctx.moveTo(cx + tip, cy);
  ctx.lineTo(cx - tip * 0.6, cy - 15);
  ctx.lineTo(cx - tip * 0.6, cy + 15);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawControls(): void {
  for (const control of CONTROLS) {
    const active = control.kind === 'throttle'
      ? inputState.throttle
      : laneButtonFlash[control.id as 'left' | 'right'] > 0;
    const cx = control.x + control.w * 0.5;
    const cy = control.y + control.h * 0.5;

    roundRect(ctx, control.x, control.y, control.w, control.h, CONTROL_RADIUS);
    ctx.fillStyle = COLORS.button;
    ctx.fill();
    if (active) {
      ctx.fillStyle = COLORS.buttonActive;
      ctx.fill();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = active ? COLORS.accentLight : COLORS.buttonEdge;
    ctx.stroke();

    const glyph = active ? COLORS.accentLight : COLORS.text;
    if (control.kind === 'lane') {
      drawLaneArrow(cx, cy, control.direction, glyph);
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 19);
      ctx.lineTo(cx - 15, cy);
      ctx.lineTo(cx + 15, cy);
      ctx.closePath();
      ctx.fillStyle = glyph;
      ctx.fill();
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAS', cx, cy + 21);
    }
  }
}
