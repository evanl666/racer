/**
 * Long Bay Circuit geometry: an original folded circuit built from exact lines and
 * arcs. Six long straights and five broad hairpins produce a route that is
 * substantially longer than V0.7.x while remaining smooth, non-crossing and easy
 * to read.
 *
 * Everything here is pure geometry — no game state, no drawing.
 */

import { LANE_COUNT, LANE_GAP, ROAD_HALF_WIDTH } from './config';
import type { TrackSample, Vec2 } from './types';

function buildLongBayCircuit(): Vec2[] {
  const points: Vec2[] = [];

  function pushPoint(x: number, y: number): void {
    const last = points[points.length - 1];
    if (!last || Math.hypot(last.x - x, last.y - y) > 0.01) points.push({ x, y });
  }

  function lineTo(x: number, y: number, spacing = 3.0): void {
    const start = points[points.length - 1];
    const length = Math.hypot(x - start.x, y - start.y);
    const count = Math.max(1, Math.ceil(length / spacing));
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      pushPoint(start.x + (x - start.x) * t, start.y + (y - start.y) * t);
    }
  }

  function arcTo(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, spacing = 2.6): void {
    const sweep = endAngle - startAngle;
    const length = Math.abs(sweep) * radius;
    const count = Math.max(8, Math.ceil(length / spacing));
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      const angle = startAngle + sweep * t;
      pushPoint(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    }
  }

  // Eight long horizontal runs use nearly the full portrait screen. The alternating
  // broad hairpins keep the route readable and smooth without any crossings.
  pushPoint(110, 70);
  lineTo(310, 70);
  arcTo(310, 115, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(160, 160);
  arcTo(160, 205, 45, -Math.PI / 2, -3 * Math.PI / 2);
  lineTo(310, 250);
  arcTo(310, 295, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(160, 340);
  arcTo(160, 385, 45, -Math.PI / 2, -3 * Math.PI / 2);
  lineTo(310, 430);
  arcTo(310, 475, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(160, 520);
  arcTo(160, 565, 45, -Math.PI / 2, -3 * Math.PI / 2);
  lineTo(310, 610);
  arcTo(310, 655, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(110, 700);

  // Outer return line closes the folded circuit while staying separated from the
  // inner hairpins by a narrow water channel.
  arcTo(110, 640, 60, Math.PI / 2, Math.PI);
  lineTo(50, 130);
  arcTo(110, 130, 60, Math.PI, 3 * Math.PI / 2);

  if (points.length > 1 && Math.hypot(
    points[points.length - 1].x - points[0].x,
    points[points.length - 1].y - points[0].y
  ) < 0.1) points.pop();

  return points;
}

export const centerPath = buildLongBayCircuit();

interface ArcData {
  cumulative: number[];
  total: number;
}

function buildArcData(points: Vec2[]): ArcData {
  const cumulative = [0];
  let total = 0;
  for (let i = 1; i <= points.length; i++) {
    const a = points[i - 1];
    const b = points[i % points.length];
    total += Math.hypot(b.x - a.x, b.y - a.y);
    cumulative.push(total);
  }
  return { cumulative, total };
}

export const arc = buildArcData(centerPath);

export function wrapDistance(distance: number): number {
  return ((distance % arc.total) + arc.total) % arc.total;
}

export function circularDistance(a: number, b: number): number {
  const raw = Math.abs(wrapDistance(a) - wrapDistance(b));
  return Math.min(raw, arc.total - raw);
}

export function forwardPathDistance(fromDistance: number, toDistance: number): number {
  return wrapDistance(toDistance - fromDistance);
}

interface Station {
  i: number;
  t: number;
  segmentLength: number;
}

function locateCenterSegment(distance: number): Station {
  const d = wrapDistance(distance);
  let lo = 0;
  let hi = centerPath.length;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (arc.cumulative[mid] <= d) lo = mid;
    else hi = mid;
  }

  const i = Math.min(lo, centerPath.length - 1);
  const segmentStart = arc.cumulative[i];
  const segmentLength = Math.max(0.0001, arc.cumulative[i + 1] - segmentStart);
  return {
    i,
    t: (d - segmentStart) / segmentLength,
    segmentLength
  };
}

export function pathAtOffset(offset: number): Vec2[] {
  return centerPath.map((p, i) => {
    const prev = centerPath[(i - 1 + centerPath.length) % centerPath.length];
    const next = centerPath[(i + 1) % centerPath.length];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return { x: p.x + nx * offset, y: p.y + ny * offset };
  });
}

export function pathForLane(laneIndex: number): Vec2[] {
  const laneOffset = (laneIndex - (LANE_COUNT - 1) / 2) * LANE_GAP;
  return pathAtOffset(laneOffset);
}

// Each lane has its own physical arc length. Vehicles still keep an unwrapped
// center-line station for collision/overtake logic, but movement consumes actual
// road distance segment-by-segment on the current (possibly fractional) lane.
// This avoids both outer-lane and inner-lane speed spikes at straight/curve joins.
const laneCenterPaths = Array.from({ length: LANE_COUNT }, (_, lane) => pathForLane(lane));

function laneBounds(laneIndex: number): { lower: number; upper: number; blend: number } {
  const clamped = Math.max(0, Math.min(LANE_COUNT - 1, laneIndex));
  const lower = Math.floor(clamped);
  const upper = Math.ceil(clamped);
  return { lower, upper, blend: clamped - lower };
}

function interpolatedLanePoint(pointIndex: number, laneIndex: number): Vec2 {
  const lanes = laneBounds(laneIndex);
  const low = laneCenterPaths[lanes.lower][pointIndex];
  const high = laneCenterPaths[lanes.upper][pointIndex];
  return {
    x: low.x + (high.x - low.x) * lanes.blend,
    y: low.y + (high.y - low.y) * lanes.blend
  };
}

function laneSegmentLength(segmentIndex: number, laneIndex: number): number {
  const a = interpolatedLanePoint(segmentIndex, laneIndex);
  const b = interpolatedLanePoint((segmentIndex + 1) % centerPath.length, laneIndex);
  return Math.max(0.0001, Math.hypot(b.x - a.x, b.y - a.y));
}

export function sampleAtDistance(distance: number, laneIndex: number): TrackSample {
  const station = locateCenterSegment(distance);
  const a = interpolatedLanePoint(station.i, laneIndex);
  const b = interpolatedLanePoint((station.i + 1) % centerPath.length, laneIndex);
  const x = a.x + (b.x - a.x) * station.t;
  const y = a.y + (b.y - a.y) * station.t;

  return {
    x,
    y,
    angle: Math.atan2(b.y - a.y, b.x - a.x)
  };
}

export function advanceDistanceAtRoadSpeed(distance: number, speed: number, dt: number, laneIndex: number): number {
  let currentDistance = distance;
  let remainingRoadDistance = Math.max(0, speed * dt);
  let guard = 0;

  while (remainingRoadDistance > 0.000001 && guard < 128) {
    const station = locateCenterSegment(currentDistance);
    const roadSegmentLength = laneSegmentLength(station.i, laneIndex);
    const roadRemainingInSegment = roadSegmentLength * (1 - station.t);
    const centerRemainingInSegment = station.segmentLength * (1 - station.t);

    // Floating-point values can land microscopically before a segment boundary.
    // Move a negligible amount forward so the binary search selects the next one.
    if (roadRemainingInSegment <= 0.000001 || centerRemainingInSegment <= 0.000001) {
      currentDistance += 0.000001;
      guard += 1;
      continue;
    }

    if (remainingRoadDistance < roadRemainingInSegment) {
      currentDistance += station.segmentLength * (remainingRoadDistance / roadSegmentLength);
      remainingRoadDistance = 0;
    } else {
      currentDistance += centerRemainingInSegment;
      remainingRoadDistance -= roadRemainingInSegment;
    }

    guard += 1;
  }

  return currentDistance;
}

// Five separators create six actual lanes. Cars run between these lines.
export const laneDividerPaths = Array.from({ length: LANE_COUNT - 1 }, (_, i) => pathForLane(i + 0.5));
export const outerRoadEdgePath = pathAtOffset(ROAD_HALF_WIDTH - 1.8);
export const innerRoadEdgePath = pathAtOffset(-ROAD_HALF_WIDTH + 1.8);
