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

  drawSlabSeams(outerRoad, innerRoad);
  drawEdgeGrime(outerRoad, innerRoad);
  drawStartLine();
}

/**
 * Transverse joints across the concrete.
 *
 * A single flat tone reads as paint; real slabs are cast in panels and the
 * joints between them are the strongest cue that the surface is concrete rather
 * than a coloured shape. Drawn straight across between the two road edges, so
 * they follow the road through corners for free.
 */
const SEAM_SPACING = 6;

function drawSlabSeams(outer: ReturnType<typeof projectPath>, inner: ReturnType<typeof projectPath>): void {
  const count = Math.min(outer.length, inner.length);
  ctx.save();
  ctx.lineCap = 'butt';
  for (let i = 0; i < count; i += SEAM_SPACING) {
    // Alternate weight so the panels do not look stamped out by a machine.
    const heavy = Math.floor(i / SEAM_SPACING) % 3 === 0;
    ctx.strokeStyle = heavy ? 'rgba(96,100,96,0.34)' : 'rgba(112,116,112,0.2)';
    ctx.lineWidth = heavy ? 1.15 : 0.8;
    ctx.beginPath();
    ctx.moveTo(outer[i].x, outer[i].y);
    ctx.lineTo(inner[i].x, inner[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Dirt where the surface meets the edge lines.
 *
 * Roads are cleanest where the traffic runs and dirtiest at the margins, and
 * that gradient is most of what separates a used surface from a new one.
 */
function drawEdgeGrime(outer: ReturnType<typeof projectPath>, inner: ReturnType<typeof projectPath>): void {
  const outerGrime = edge(ROAD_HALF_WIDTH - 8.5);
  const innerGrime = edge(-ROAD_HALF_WIDTH + 8.5);

  fillRibbon(outer, outerGrime, 'rgba(112,112,100,0.22)');
  fillRibbon(innerGrime, inner, 'rgba(112,112,100,0.22)');

  // A narrower, darker band right against the line.
  const outerDark = edge(ROAD_HALF_WIDTH - 5);
  const innerDark = edge(-ROAD_HALF_WIDTH + 5);
  fillRibbon(outer, outerDark, 'rgba(88,88,78,0.2)');
  fillRibbon(innerDark, inner, 'rgba(88,88,78,0.2)');
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
