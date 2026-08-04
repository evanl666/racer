/** Collision and overtake detection — the rules that turn driving into a score. */

import { audio } from './audio';
import {
  COLLISION_LANE_DISTANCE,
  COLLISION_PATH_DISTANCE,
  PLAYER_TIER_BOOST_DURATION
} from './config';
import { vibrate } from './platform';
import { beginCollision } from './player';
import { aiCars, currentSpeedTier, player } from './state';
import { arc, circularDistance } from './track';

export function detectCollisions(): boolean {
  if (player.invincible > 0 || player.state === 'CRASHED') return false;

  for (const car of aiCars) {
    const laneDistanceNow = Math.abs(player.visualLane - car.visualLane);
    const laneDistanceBefore = Math.abs(player.previousVisualLane - car.previousVisualLane);
    const laneDistance = Math.min(laneDistanceNow, laneDistanceBefore);
    const pathDistance = circularDistance(player.distance, car.distance);

    // At 600+ road-speed units the red car can cross an AI car between frames.
    // Detect the unwrapped pass-index crossing as well as current-position overlap.
    const previousGap = player.previousDistance - car.previousDistance;
    const currentGap = player.distance - car.distance;
    const previousPassIndex = Math.floor(previousGap / arc.total);
    const currentPassIndex = Math.floor(currentGap / arc.total);
    const sweptThroughCar = currentPassIndex > previousPassIndex;

    if (laneDistance <= COLLISION_LANE_DISTANCE &&
        (pathDistance <= COLLISION_PATH_DISTANCE || sweptThroughCar)) {
      beginCollision();
      return true;
    }
  }
  return false;
}

export function detectOvertakes(): void {
  for (const car of aiCars) {
    const currentPassIndex = Math.floor((player.distance - car.distance) / arc.total);
    if (currentPassIndex > car.passIndex) {
      const overtakes = currentPassIndex - car.passIndex;
      const previousCombo = player.combo;
      const previousTier = currentSpeedTier(previousCombo);
      player.combo += overtakes;
      const newTier = currentSpeedTier(player.combo);
      player.totalPasses += overtakes;
      player.bestCombo = Math.max(player.bestCombo, player.combo);
      player.passPopElapsed = 0;
      car.passIndex = currentPassIndex;
      audio.playOvertake(player.combo, overtakes);

      if (newTier > previousTier) {
        player.tierBoostElapsed = PLAYER_TIER_BOOST_DURATION;
        audio.playSpeedTierUp(newTier);
      }

      vibrate(newTier > previousTier ? 'medium' : 'light');
    } else if (currentPassIndex < car.passIndex) {
      // This can happen after a crash lets the AI move back in front.
      // Lowering the index allows the same car to be legitimately passed again.
      car.passIndex = currentPassIndex;
    }
  }
}
