/**
 * The road surface, drawn in perspective.
 *
 * Every edge of the circuit is offset on the plane and then projected, so the
 * road narrows with distance the way a real one does. Surfaces are filled
 * between their two projected edges rather than stroked, because a stroke of
 * constant width would ignore the perspective entirely.
 *
 * All of this lands in the cached static layer: the camera does not move, so it
 * is computed once per circuit.
 */

import { LANE_COUNT, ROAD_HALF_WIDTH } from '../config';
import { ctx } from '../platform';
import { COLORS } from '../theme';
import { pathAtOffset, pathForLane, sampleAtDistance } from '../track';
import { ROAD_DEPTH, SHADOW_X, SHADOW_Y } from './light';
import { fillRibbon, offsetPath } from './primitives';
import { project, projectPath, projectedHeading } from './camera';
import { asphaltTexture } from './sprites';

/** Offsets a plane path sideways, then projects it. */
function edge(offset: number): ReturnType<typeof projectPath> {
  return projectPath(pathAtOffset(offset));
}

export function drawTrack(): void {
  const outerShadow = projectPath(
    offsetPath(pathAtOffset(ROAD_HALF_WIDTH + 7), SHADOW_X * ROAD_DEPTH, SHADOW_Y * ROAD_DEPTH)
  );
  const innerShadow = projectPath(
    offsetPath(pathAtOffset(-ROAD_HALF_WIDTH - 7), SHADOW_X * ROAD_DEPTH, SHADOW_Y * ROAD_DEPTH)
  );
  fillRibbon(outerShadow, innerShadow, 'rgba(4,12,18,0.55)');

  // Deck side wall: the same band nudged down-light, which reads as thickness.
  const outerWall = projectPath(
    offsetPath(pathAtOffset(ROAD_HALF_WIDTH + 5), SHADOW_X * ROAD_DEPTH * 0.5, SHADOW_Y * ROAD_DEPTH * 0.5)
  );
  const innerWall = projectPath(
    offsetPath(pathAtOffset(-ROAD_HALF_WIDTH - 5), SHADOW_X * ROAD_DEPTH * 0.5, SHADOW_Y * ROAD_DEPTH * 0.5)
  );
  fillRibbon(outerWall, innerWall, '#121A20');

  const outerEdge = edge(ROAD_HALF_WIDTH + 4);
  const innerEdge = edge(-ROAD_HALF_WIDTH - 4);
  fillRibbon(outerEdge, innerEdge, COLORS.roadEdge);

  const outerKerb = edge(ROAD_HALF_WIDTH);
  const outerRoad = edge(ROAD_HALF_WIDTH - 3.2);
  const innerRoad = edge(-ROAD_HALF_WIDTH + 3.2);
  const innerKerb = edge(-ROAD_HALF_WIDTH);

  // Continuous tan lines down both sides, as on the original circuit; the
  // red-and-white blocks read as a race kerb, which this harbour road is not.
  fillRibbon(outerKerb, outerRoad, COLORS.curbLight);
  fillRibbon(innerRoad, innerKerb, COLORS.curbLight);

  // Lanes are shaded alternately rather than separated by dashed lines. Solid
  // bands read as five distinct channels at a glance, where dashes read as
  // texture and leave the eye to work out where one lane ends.
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const laneOuter = projectPath(pathForLane(lane - 0.5));
    const laneInner = projectPath(pathForLane(lane + 0.5));
    fillRibbon(laneOuter, laneInner, lane % 2 === 0 ? COLORS.road : COLORS.roadAlt);
  }

  const grain = asphaltTexture(ctx);
  if (grain) fillRibbon(outerRoad, innerRoad, grain);

  drawStartLine();
}

/** Start/finish chequer, projected onto the plane like everything else. */
function drawStartLine(): void {
  const centre = sampleAtDistance(0, (LANE_COUNT - 1) / 2);
  const heading = projectedHeading(centre.x, centre.y, centre.angle);
  const origin = project(centre.x, centre.y);

  ctx.save();
  ctx.translate(origin.x, origin.y);
  ctx.rotate(heading);
  const size = 4.6 * origin.scale;
  for (let i = -3; i <= 2; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#F5F0E2' : '#242A2E';
    ctx.fillRect(-size * 0.5, i * size, size, size);
    ctx.fillStyle = i % 2 === 0 ? '#242A2E' : '#F5F0E2';
    ctx.fillRect(size * 0.5, i * size, size, size);
  }
  ctx.restore();
}
