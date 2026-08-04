/**
 * Speed feedback.
 *
 * The car's top speed is more than five times its starting speed, but nothing on
 * screen said so: the camera is fixed and the track scrolls past at the same
 * apparent size either way. Tapered trails behind the car and faint streaks in
 * the neighbouring lanes give the speed range something to read against.
 *
 * Everything scales from a single 0..1 intensity, so it stays invisible at cruise
 * and only takes over once the run is genuinely fast.
 */

import { LANE_COUNT } from '../config';
import { ctx } from '../platform';
import { currentCruiseSpeed, player } from '../state';
import { sampleAtDistance } from '../track';

const TRAIL_SEGMENTS = 7;
const TRAIL_STEP = 5.5;

/** 0 below cruise, rising to 1 near the top of the speed range. */
function intensity(): number {
  const cruise = currentCruiseSpeed();
  const over = player.speed - cruise * 0.92;
  if (over <= 0) return 0;
  return Math.min(1, over / 260);
}

export function drawSpeedLines(): void {
  const power = intensity();
  if (power <= 0.02 || player.state === 'CRASHED') return;

  ctx.save();
  ctx.lineCap = 'round';

  // Trail directly behind the car: the strongest single cue that it is moving.
  for (let i = 0; i < TRAIL_SEGMENTS; i++) {
    const back = (i + 1) * TRAIL_STEP;
    const point = sampleAtDistance(player.distance - back, player.visualLane);
    const fade = (1 - i / TRAIL_SEGMENTS) * power;

    ctx.globalAlpha = fade * 0.5;
    ctx.strokeStyle = i < 3 ? '#FFD9A8' : '#FFFFFF';
    ctx.lineWidth = 3.4 * (1 - i / TRAIL_SEGMENTS) + 0.5;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    const tail = sampleAtDistance(player.distance - back - TRAIL_STEP * 0.85, player.visualLane);
    ctx.lineTo(tail.x, tail.y);
    ctx.stroke();
  }

  // Neighbouring lanes get sparse streaks so the whole road reads as moving,
  // not just the car. Only at genuinely high speed, or it becomes noise.
  if (power > 0.45) {
    const laneOffsets = [-1.6, -0.9, 0.9, 1.6];
    ctx.globalAlpha = (power - 0.45) * 0.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.1;

    for (const offset of laneOffsets) {
      const lane = player.visualLane + offset;
      if (lane < -0.4 || lane > LANE_COUNT - 0.6) continue;

      for (let i = 0; i < 3; i++) {
        // Phase the streaks off the car's own distance so they slide past it.
        const back = 14 + i * 26 + ((player.travelled * 1.6) % 26);
        const head = sampleAtDistance(player.distance - back, lane);
        const tail = sampleAtDistance(player.distance - back - 11, lane);
        ctx.beginPath();
        ctx.moveTo(head.x, head.y);
        ctx.lineTo(tail.x, tail.y);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}
