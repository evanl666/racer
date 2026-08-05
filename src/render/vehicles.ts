/** Car sprites: one shared top-down shape, restyled per vehicle. */

import { ctx } from '../platform';
import { aiCars, currentCruiseSpeed, player } from '../state';
import { COLORS } from '../theme';
import { forwardPathDistance, sampleAtDistance } from '../track';
import type { AiCar, VehicleStyle } from '../types';
import { CAR_BODY_DEPTH, CAR_SHADOW_DISTANCE, SHADOW_X, SHADOW_Y, localLight } from './light';
import { roundRect } from './primitives';
import { CAR_LENGTH, CAR_WIDTH, vehicleSprite } from './sprites';

const PLAYER_STYLE: VehicleStyle = {
  body: COLORS.player,
  cabin: COLORS.playerLight,
  window: COLORS.window,
  lights: '#FFE6A4',
  stripe: COLORS.playerStripe,
  side: '#9E2C22',
  rim: '#FFC9B2'
};

const AI_STYLE: VehicleStyle = {
  body: COLORS.ai,
  cabin: COLORS.aiLight,
  window: COLORS.aiWindow,
  lights: '#C5D3D8',
  stripe: null,
  side: '#080B0D',
  rim: '#5D6B72'
};

function drawVehicle(
  distance: number,
  laneIndex: number,
  style: VehicleStyle,
  alpha = 1,
  indicatorDirection = 0,
  indicatorOn = false,
  spriteKey = '',
  swell = 1
): void {
  const p = sampleAtDistance(distance, laneIndex);

  const sprite = spriteKey ? vehicleSprite(spriteKey, style) : null;
  if (sprite) {
    drawSpriteVehicle(p, sprite, style, alpha, indicatorDirection, indicatorOn, swell);
    return;
  }

  // Cast shadow first, offset in screen space so it stays put through a corner.
  // A hard offset silhouette beats a blur here: it is crisper and much cheaper.
  ctx.save();
  ctx.globalAlpha = alpha * 0.32;
  ctx.translate(p.x + SHADOW_X * CAR_SHADOW_DISTANCE, p.y + SHADOW_Y * CAR_SHADOW_DISTANCE);
  ctx.rotate(p.angle);
  ctx.fillStyle = '#050D13';
  roundRect(ctx, -7.8, -4.0, 15.6, 8.0, 2.8);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // Side face, offset down-light, gives the body its thickness.
  const depth = localLight(p.angle, CAR_BODY_DEPTH);
  ctx.fillStyle = style.side;
  roundRect(ctx, -7.8 + depth.x, -4.0 + depth.y, 15.6, 8.0, 2.8);
  ctx.fill();

  // Top face.
  ctx.fillStyle = style.body;
  roundRect(ctx, -7.8, -4.0, 15.6, 8.0, 2.8);
  ctx.fill();

  // Rim light along the lit edge: the cue that separates a box from a rectangle.
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  ctx.strokeStyle = style.rim;
  ctx.lineWidth = 0.7;
  roundRect(ctx, -7.55 - depth.x * 0.35, -3.75 - depth.y * 0.35, 15.1, 7.5, 2.6);
  ctx.stroke();
  ctx.restore();

  // Cabin, raised again above the body.
  const cabinDepth = localLight(p.angle, CAR_BODY_DEPTH * 0.6);
  ctx.fillStyle = style.side;
  roundRect(ctx, -2.7 + cabinDepth.x, -3.05 + cabinDepth.y, 6.9, 6.1, 1.9);
  ctx.fill();
  ctx.fillStyle = style.cabin;
  roundRect(ctx, -2.7, -3.05, 6.9, 6.1, 1.9);
  ctx.fill();

  ctx.fillStyle = style.window;
  roundRect(ctx, -1.35, -2.3, 4.2, 4.6, 1.2);
  ctx.fill();

  // Glass highlight, on the lit side of the window.
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, -1.1 - cabinDepth.x, -2.05 - cabinDepth.y, 1.7, 4.0, 0.8);
  ctx.fill();
  ctx.restore();

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

/** Sprite playback: one shadow blit, one body blit, plus any indicator. */
function drawSpriteVehicle(
  p: { x: number; y: number; angle: number },
  sprite: { image: WxCanvas; shadow: WxCanvas },
  style: VehicleStyle,
  alpha: number,
  indicatorDirection: number,
  indicatorOn: boolean,
  swell = 1
): void {
  const length = CAR_LENGTH * swell;
  const width = CAR_WIDTH * swell;
  const halfL = length / 2;
  const halfW = width / 2;

  ctx.save();
  ctx.globalAlpha = alpha * 0.34;
  ctx.translate(p.x + SHADOW_X * CAR_SHADOW_DISTANCE, p.y + SHADOW_Y * CAR_SHADOW_DISTANCE);
  ctx.rotate(p.angle);
  ctx.drawImage(sprite.shadow as unknown as CanvasImageSource, -halfL, -halfW, length, width);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.drawImage(sprite.image as unknown as CanvasImageSource, -halfL, -halfW, length, width);

  if (indicatorDirection !== 0 && indicatorOn) {
    ctx.fillStyle = '#FFD55C';
    const indicatorY = indicatorDirection > 0 ? halfW - 0.4 : -halfW - 1.0;
    ctx.fillRect(2.8, indicatorY, 3.2, 1.4);
    ctx.fillRect(-5.5, indicatorY, 2.6, 1.4);
  }
  ctx.restore();
  void style;
}

function drawAiCar(car: AiCar): void {
  const indicatorOn = car.state === 'WARNING' && Math.floor(car.stateElapsed * 30) % 2 === 0;
  drawVehicle(car.distance, car.visualLane, AI_STYLE, 1, car.direction, indicatorOn, 'ai');
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
 * Afterimage.
 *
 * Everything about it scales with speed: how many ghosts there are, how far
 * apart they sit, and how much each one is swollen. At cruise there is nothing;
 * flat out the car drags a long widening smear, which is the clearest read on
 * speed the fixed camera allows.
 */
const MIN_GHOSTS = 2;
const MAX_GHOSTS = 6;

function drawAfterimage(): void {
  const trail = player.trail;
  if (trail.length < 4 || player.state === 'CRASHED') return;

  const cruise = currentCruiseSpeed();
  const intensity = Math.min(1, Math.max(0, (player.speed - cruise * 0.9) / 180));
  if (intensity <= 0.04) return;

  const ghosts = MIN_GHOSTS + Math.round(intensity * (MAX_GHOSTS - MIN_GHOSTS));
  const stride = 2 + Math.round(intensity * 2);

  // Furthest ghost first, so the nearest one lands on top of the older ones.
  for (let ghost = ghosts; ghost >= 1; ghost--) {
    const index = trail.length - 1 - ghost * stride;
    if (index < 0) continue;
    const sample = trail[index];

    const fade = 1 - ghost / (ghosts + 1);
    const alpha = intensity * 0.4 * fade;
    // The smear swells as it trails away, which is what makes it read as blur
    // rather than as a row of copies.
    const swell = 1 + intensity * 0.22 * (ghost / ghosts);
    drawVehicle(sample.distance, sample.lane, PLAYER_STYLE, alpha, 0, false, 'player', swell);
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
  drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, playerAlpha(), 0, false, 'player');
}
