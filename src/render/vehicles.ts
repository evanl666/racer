/** Car sprites: one shared top-down shape, restyled per vehicle. */

import { ctx } from '../platform';
import { aiCars, currentCruiseSpeed, player } from '../state';
import { COLORS } from '../theme';
import { forwardPathDistance, sampleAtDistance } from '../track';
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

/** A destroyed car briefly leaves a scorch mark so the kill reads on screen. */
function drawWreck(car: AiCar): void {
  const p = sampleAtDistance(car.distance, car.visualLane);
  const t = Math.max(0, Math.min(1, car.wreck));
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(p.x, p.y);
  const radius = 5 + (1 - t) * 12;
  ctx.fillStyle = 'rgba(255,150,72,0.55)';
  ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(46,30,26,0.75)';
  ctx.beginPath(); ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/**
 * In The Zone marks a slipstream box trailing the car. It is drawn as a bar in
 * the lane rather than a shape on the road so it stays readable at speed.
 */
function drawZone(car: AiCar): void {
  const gap = forwardPathDistance(player.distance, car.distance);
  const engaged = gap > 13 && gap < 66 && Math.abs(player.visualLane - car.visualLane) < 0.7;

  ctx.save();
  for (let offset = 16; offset <= 62; offset += 8) {
    const p = sampleAtDistance(car.distance - offset, car.visualLane);
    ctx.globalAlpha = engaged ? 0.55 : 0.26;
    ctx.fillStyle = engaged ? COLORS.accentLight : COLORS.accent;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fill meter rides just above the marked car.
  const head = sampleAtDistance(car.distance, car.visualLane);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(8,17,25,0.7)';
  ctx.fillRect(head.x - 9, head.y - 11, 18, 3);
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(head.x - 9, head.y - 11, 18 * Math.max(0, Math.min(1, car.zoneFill)), 3);
  ctx.restore();
}

function playerAlpha(): number {
  if (player.invincible > 0) return Math.floor(player.invincible * 12) % 2 === 0 ? 0.25 : 1;
  return 1;
}

/** The armed car gets a halo so the "contact is a kill now" state is unmissable. */
function drawFireballAura(): void {
  if (player.fireball <= 0) return;
  const p = sampleAtDistance(player.distance, player.visualLane);
  const pulse = 0.72 + Math.sin(player.travelled * 0.06) * 0.28;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'rgba(255,164,72,0.75)';
  ctx.beginPath(); ctx.arc(0, 0, 11 + pulse * 3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(255,226,150,0.85)';
  ctx.beginPath(); ctx.arc(0, 0, 7 + pulse * 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/**
 * Afterimage. Three ghosts sampled back through the trail, fading out, which
 * reads as motion blur without costing a blur.
 */
function drawAfterimage(): void {
  const trail = player.trail;
  if (trail.length < 6 || player.state === 'CRASHED') return;

  const cruise = currentCruiseSpeed();
  const intensity = Math.min(1, Math.max(0, (player.speed - cruise * 0.95) / 140));
  if (intensity <= 0.05) return;

  for (let ghost = 1; ghost <= 3; ghost++) {
    const index = trail.length - 1 - ghost * 3;
    if (index < 0) break;
    const sample = trail[index];
    drawVehicle(sample.distance, sample.lane, PLAYER_STYLE, intensity * (0.28 - ghost * 0.07));
  }
}

export function drawCars(): void {
  for (const car of aiCars) {
    if (!car.alive) {
      if (car.wreck > 0) drawWreck(car);
      continue;
    }
    if (car.hasZone) drawZone(car);
    drawAiCar(car);
  }
  drawAfterimage();
  drawFireballAura();
  drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, playerAlpha());
}
