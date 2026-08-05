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
import { fillBands, fillRibbon, offsetPath } from './primitives';
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

  // Red and white kerbs, as alternating blocks between the two edges.
  fillBands(outerKerb, outerRoad, [COLORS.curbLight, COLORS.curbRed], 6);
  fillBands(innerRoad, innerKerb, [COLORS.curbRed, COLORS.curbLight], 6);

  fillRibbon(outerRoad, innerRoad, COLORS.road);

  const grain = asphaltTexture(ctx);
  if (grain) fillRibbon(outerRoad, innerRoad, grain);

  // Lane dividers: thin dashed ribbons between the lanes.
  for (let i = 1; i < LANE_COUNT; i++) {
    const line = pathForLane(i - 0.5);
    const a = projectPath(offsetPath(line, -0.55, 0));
    const b = projectPath(offsetPath(line, 0.55, 0));
    fillBands(a, b, [COLORS.lane, 'rgba(0,0,0,0)'], 4, true);
  }

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
