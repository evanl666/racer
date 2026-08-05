/** Gameplay tuning. Every magic number that shapes how the game feels lives here. */

import type { AiBlueprint } from './types';

export const LANE_COUNT = 5;
// Five lanes spread across the same road width as the old six.
export const LANE_GAP = 9.9;
export const ROAD_HALF_WIDTH = 27.0;
export const PLAYER_CRUISE_BASE_SPEED = 125;

/**
 * Speed grows on *every* overtake, in bands with diminishing returns.
 *
 * The stepped every-tenth-car curve made the early game feel inert and then
 * lurched: a single pass could add sixty units. Now the first ten passes are
 * where the acceleration is felt, and the late game creeps rather than sprints,
 * with a much lower ceiling so high combos stay readable.
 *
 * Each entry is [how many overtakes this band covers, units added per overtake].
 */
export const SPEED_BANDS: Array<[number, number]> = [
  [10, 6.0],
  [15, 3.0],
  [25, 1.5],
  [Infinity, 0.55]
];

/** Cruise speed never exceeds this, however long the combo runs. */
export const CRUISE_SPEED_CAP = 380;
/** Holding the throttle adds this much on top of the cruise speed. */
export const THROTTLE_MARGIN = 60;
export const PLAYER_MAX_SPEED = CRUISE_SPEED_CAP + THROTTLE_MARGIN;
export const PLAYER_ACCELERATION = 112;
export const PLAYER_TIER_ACCELERATION = 165;
export const PLAYER_COAST_DECELERATION = 42;
export const PLAYER_TIER_BOOST_DURATION = 0.72;
export const CHANGE_DURATION = 0.05;
export const AI_WARNING_DURATION = 0.16;
export const AI_CHANGE_DURATION = 0.20;
export const AI_MIN_DECISION_DELAY = 0.85;
export const AI_MAX_DECISION_DELAY = 2.35;
export const MAX_SIMULTANEOUS_AI_ACTIONS = 2;
export const AI_LANE_CLEAR_DISTANCE = 32;
export const AI_PLAYER_BASE_SAFETY_DISTANCE = 50;
export const AI_PLAYER_MAX_SAFETY_DISTANCE = 265;
export const AI_PLAYER_SAFETY_PER_SPEED = 0.39;
export const AI_PLAYER_REAR_SAFETY_DISTANCE = 30;
export const COLLISION_PATH_DISTANCE = 11.5;
export const COLLISION_LANE_DISTANCE = 0.48;

/**
 * Traffic is generated per run so the car count can be a difficulty knob.
 *
 * Lanes cycle so every lane stays occupied, speed rises with lane index (the
 * outside lane is the slow lane), and the golden ratio spaces cars around the
 * lap without clumping at any count.
 */
export function buildBlueprints(count: number): AiBlueprint[] {
  const blueprints: AiBlueprint[] = [];
  for (let i = 0; i < count; i++) {
    const lane = i % LANE_COUNT;
    blueprints.push({
      fraction: (i * 0.6180339887498949) % 1,
      lane,
      speed: 84 + lane * 7 + (i % 3) * 3
    });
  }
  return blueprints;
}
