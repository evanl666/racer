/** Red car behaviour: lane changes, throttle and the speed-tier curve. */

import { audio } from './audio';
import {
  CHANGE_DURATION,
  LANE_COUNT,
  PLAYER_ACCELERATION,
  PLAYER_COAST_DECELERATION,
  PLAYER_TIER_ACCELERATION
} from './config';
import { moveToward } from './mathUtil';
import { vibrate } from './platform';
import { baseCruiseSpeed, currentTargetSpeed, inputState, player } from './state';
import { advanceDistanceAtRoadSpeed } from './track';

function laneInputStateAllows(): boolean {
  return player.state !== 'CRASHED';
}

export function requestLaneChange(direction: number): void {
  if (!laneInputStateAllows()) return;

  audio.ensureStarted();
  const target = Math.max(0, Math.min(LANE_COUNT - 1, player.lane + direction));
  if (target === player.lane) return;

  audio.playLaneChange(direction);
  player.laneFrom = player.visualLane;
  player.laneTo = target;
  player.lane = target;
  player.laneChangeElapsed = 0.0001;
  if (player.state === 'NORMAL' || player.state === 'CHANGING_LANE') {
    player.state = 'CHANGING_LANE';
  }
}

export function setThrottle(active: boolean): void {
  inputState.throttle = Boolean(active);
  if (inputState.throttle) audio.ensureStarted();
}

export function beginCollision(): void {
  if (player.invincible > 0 || player.state === 'CRASHED') return;

  player.state = 'CRASHED';
  player.stateElapsed = 0;
  player.speed = 0;
  player.invincible = 1.25;
  player.combo = 0;
  player.tierBoostElapsed = 0;
  player.collisionCount += 1;

  vibrate('medium');
}

export function updatePlayer(dt: number): void {
  player.previousDistance = player.distance;
  player.previousVisualLane = player.visualLane;
  player.invincible = Math.max(0, player.invincible - dt);
  player.tierBoostElapsed = Math.max(0, player.tierBoostElapsed - dt);
  player.passPopElapsed += dt;
  // Death Race arms the car with an infinite timer, which must stay infinite.
  if (Number.isFinite(player.fireball)) player.fireball = Math.max(0, player.fireball - dt);

  if (player.laneChangeElapsed > 0) {
    player.laneChangeElapsed += dt;
    const t = Math.min(1, player.laneChangeElapsed / CHANGE_DURATION);
    const eased = 1 - Math.pow(1 - t, 3);
    player.visualLane = player.laneFrom + (player.laneTo - player.laneFrom) * eased;
    if (t >= 1) {
      player.visualLane = player.laneTo;
      player.laneChangeElapsed = 0;
      if (player.state === 'CHANGING_LANE') player.state = 'NORMAL';
    }
  }

  if (player.state === 'CRASHED') {
    player.stateElapsed += dt;
    player.speed = 0;
    if (player.stateElapsed >= 0.35) {
      player.state = 'RECOVERING';
      player.stateElapsed = 0;
    }
  } else if (player.state === 'RECOVERING') {
    player.stateElapsed += dt;
    const t = Math.min(1, player.stateElapsed / 0.70);
    player.speed = baseCruiseSpeed() * t;
    if (t >= 1) {
      player.speed = baseCruiseSpeed();
      player.state = 'NORMAL';
      player.stateElapsed = 0;
    }
  } else {
    const targetSpeed = currentTargetSpeed();
    const acceleration = player.tierBoostElapsed > 0 ? PLAYER_TIER_ACCELERATION : PLAYER_ACCELERATION;
    const rate = targetSpeed >= player.speed ? acceleration : PLAYER_COAST_DECELERATION;
    player.speed = moveToward(player.speed, targetSpeed, rate * dt);
  }

  // Keep an unwrapped distance for reliable lap/overtake detection.
  const before = player.distance;
  player.distance = advanceDistanceAtRoadSpeed(player.distance, player.speed, dt, player.visualLane);
  player.travelled += Math.max(0, player.distance - before);
}

/** Fireball state is what turns a contact into a kill. */
export function playerIsArmed(): boolean {
  return player.fireball > 0;
}
