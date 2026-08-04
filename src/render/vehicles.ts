/** Car sprites: one shared top-down shape, restyled per vehicle. */

import { ctx } from '../platform';
import { aiCars, player } from '../state';
import { COLORS } from '../theme';
import { sampleAtDistance } from '../track';
import type { AiCar, VehicleStyle } from '../types';
import { roundRect } from './primitives';

const PLAYER_STYLE: VehicleStyle = {
  body: COLORS.player,
  cabin: COLORS.playerLight,
  window: COLORS.window,
  lights: '#FFE6A4',
  stripe: COLORS.playerStripe
};

const AI_STYLE: VehicleStyle = {
  body: COLORS.ai,
  cabin: COLORS.aiLight,
  window: COLORS.aiWindow,
  lights: '#C5D3D8',
  stripe: null
};

function drawVehicle(
  distance: number,
  laneIndex: number,
  style: VehicleStyle,
  alpha = 1,
  indicatorDirection = 0,
  indicatorOn = false
): void {
  const p = sampleAtDistance(distance, laneIndex);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1.8;

  ctx.fillStyle = style.body;
  roundRect(ctx, -7.8, -4.0, 15.6, 8.0, 2.8);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = style.cabin;
  roundRect(ctx, -2.7, -3.05, 6.9, 6.1, 1.9);
  ctx.fill();

  ctx.fillStyle = style.window;
  roundRect(ctx, -1.35, -2.3, 4.2, 4.6, 1.2);
  ctx.fill();

  if (style.stripe) {
    ctx.fillStyle = style.stripe;
    roundRect(ctx, -6.7, -0.55, 10.6, 1.1, 0.55);
    ctx.fill();
  }

  ctx.fillStyle = style.lights;
  ctx.fillRect(6.15, -2.75, 1.15, 1.8);
  ctx.fillRect(6.15, 0.95, 1.15, 1.8);

  if (indicatorDirection !== 0 && indicatorOn) {
    ctx.fillStyle = '#FFD55C';
    const indicatorY = indicatorDirection > 0 ? 3.65 : -4.85;
    ctx.fillRect(2.8, indicatorY, 3.2, 1.4);
    ctx.fillRect(-5.5, indicatorY, 2.6, 1.4);
  }
  ctx.restore();
}

function drawAiCar(car: AiCar): void {
  const indicatorOn = car.state === 'WARNING' && Math.floor(car.stateElapsed * 30) % 2 === 0;
  drawVehicle(car.distance, car.visualLane, AI_STYLE, 1, car.direction, indicatorOn);
}

function playerAlpha(): number {
  if (player.invincible > 0) return Math.floor(player.invincible * 12) % 2 === 0 ? 0.25 : 1;
  return 1;
}

export function drawCars(): void {
  for (const car of aiCars) drawAiCar(car);
  drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, playerAlpha());
}
