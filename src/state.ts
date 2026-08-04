/**
 * Mutable game state and the queries that read it. Behaviour lives in player.ts,
 * ai.ts and scoring.ts; this module only owns the data.
 */

import {
  AI_BLUEPRINTS,
  AI_MAX_DECISION_DELAY,
  AI_MIN_DECISION_DELAY,
  PLAYER_CRUISE_BASE_SPEED,
  PLAYER_MAX_SPEED,
  SPEED_TIER_CRUISE,
  SPEED_TIER_THROTTLE
} from './config';
import { arc } from './track';
import type { AiCar, EngineSnapshot, Player } from './types';

const STARTING_LANE = 2;

export const inputState = {
  throttle: false
};

export const player: Player = {
  distance: 0,
  lane: STARTING_LANE,
  visualLane: STARTING_LANE,
  laneFrom: STARTING_LANE,
  laneTo: STARTING_LANE,
  laneChangeElapsed: 0,
  speed: PLAYER_CRUISE_BASE_SPEED,
  state: 'NORMAL',
  stateElapsed: 0,
  invincible: 0,
  combo: 0,
  bestCombo: 0,
  totalPasses: 0,
  passPopElapsed: 10,
  tierBoostElapsed: 0,
  previousDistance: 0,
  previousVisualLane: STARTING_LANE,
  collisionCount: 0
};

export let aiCars: AiCar[] = [];

export function resetGame(): void {
  player.distance = arc.total * 0.03;
  player.lane = STARTING_LANE;
  player.visualLane = STARTING_LANE;
  player.laneFrom = STARTING_LANE;
  player.laneTo = STARTING_LANE;
  player.laneChangeElapsed = 0;
  player.speed = PLAYER_CRUISE_BASE_SPEED;
  inputState.throttle = false;
  player.state = 'NORMAL';
  player.stateElapsed = 0;
  player.invincible = 0;
  player.combo = 0;
  player.bestCombo = 0;
  player.totalPasses = 0;
  player.passPopElapsed = 10;
  player.tierBoostElapsed = 0;
  player.previousDistance = player.distance;
  player.previousVisualLane = player.visualLane;
  player.collisionCount = 0;

  aiCars = AI_BLUEPRINTS.map((blueprint, index) => {
    const distance = arc.total * blueprint.fraction;
    return {
      id: index,
      distance,
      lane: blueprint.lane,
      visualLane: blueprint.lane,
      laneFrom: blueprint.lane,
      laneTo: blueprint.lane,
      baseSpeed: blueprint.speed,
      speed: blueprint.speed,
      previousDistance: distance,
      previousVisualLane: blueprint.lane,
      state: 'IDLE',
      stateElapsed: 0,
      direction: 0,
      decisionTimer: AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY),
      passIndex: Math.floor((player.distance - distance) / arc.total)
    };
  });
}

export function currentSpeedTier(combo: number = player.combo): number {
  return Math.min(SPEED_TIER_CRUISE.length - 1, Math.floor(Math.max(0, combo) / 10));
}

export function currentCruiseSpeed(): number {
  return SPEED_TIER_CRUISE[currentSpeedTier()];
}

export function currentThrottleMaxSpeed(): number {
  return SPEED_TIER_THROTTLE[currentSpeedTier()];
}

export function currentTargetSpeed(): number {
  return inputState.throttle ? currentThrottleMaxSpeed() : currentCruiseSpeed();
}

/** One frame's worth of state, handed to the audio engine so it stays decoupled. */
export function engineSnapshot(): EngineSnapshot {
  return {
    tier: currentSpeedTier(),
    throttle: inputState.throttle,
    speed: player.speed,
    cruiseSpeed: currentCruiseSpeed(),
    throttleMaxSpeed: currentThrottleMaxSpeed(),
    maxSpeed: PLAYER_MAX_SPEED,
    state: player.state
  };
}
