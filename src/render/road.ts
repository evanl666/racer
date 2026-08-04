/** The road surface: shadow, edges, curbs, lane dividers and the start line. */

import { LANE_COUNT, ROAD_HALF_WIDTH } from '../config';
import { ctx } from '../platform';
import { COLORS } from '../theme';
import {
  arc,
  centerPath,
  innerRoadEdgePath,
  laneDividerPaths,
  outerRoadEdgePath,
  sampleAtDistance
} from '../track';
import type { Vec2 } from '../types';
import { strokeClosedPath } from './primitives';

function drawCurbs(path: Vec2[], phase = 0): void {
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineWidth = 4.6;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const band = Math.floor((arc.cumulative[i] + phase) / 16);
    ctx.strokeStyle = band % 2 === 0 ? COLORS.curbLight : COLORS.curbRed;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawTrack(): void {
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 + 12, COLORS.roadShadow);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 + 7, COLORS.roadEdge);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 + 2, COLORS.curbLight);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 - 2, COLORS.road);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 - 9, COLORS.roadHighlight);

  drawCurbs(outerRoadEdgePath, 0);
  drawCurbs(innerRoadEdgePath, 8);

  for (const dividerPath of laneDividerPaths) {
    strokeClosedPath(dividerPath, 1.15, COLORS.lane, [6, 5]);
  }

  const sf = sampleAtDistance(0, (LANE_COUNT - 1) / 2);
  ctx.save();
  ctx.translate(sf.x, sf.y);
  ctx.rotate(sf.angle);
  for (let i = -3; i <= 2; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#F5F0E2' : '#242A2E';
    ctx.fillRect(-2.2, i * 9, 4.4, 9);
    ctx.fillStyle = i % 2 === 0 ? '#242A2E' : '#F5F0E2';
    ctx.fillRect(2.2, i * 9, 4.4, 9);
  }
  ctx.restore();
}
