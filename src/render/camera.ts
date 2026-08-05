/**
 * Perspective camera for the ground plane.
 *
 * The whole circuit lives on a flat plane in design space. This projects that
 * plane through a real 3D camera — raised, pitched down, with a focal length —
 * so the far side of the track genuinely recedes and everything on it shrinks
 * with distance. That is proper perspective, not a skew, and it needs no WebGL:
 * points are projected in JavaScript and the result is drawn with Canvas 2D,
 * which is the same technique the arcade racers used.
 *
 * The camera never moves, so the track's projection is computed once and lives
 * in the cached static layer. Only the cars are projected per frame.
 */

import { DESIGN_H, DESIGN_W } from '../platform';
import type { Vec2 } from '../types';

export interface Projected extends Vec2 {
  /** How much a unit at this point shrinks. 1 is the reference plane. */
  scale: number;
  /** Distance from the camera, for depth sorting. */
  depth: number;
}

/**
 * Top-down or tilted.
 *
 * The tilted camera was tried and reverted: on a portrait phone the far side of
 * the circuit shrinks past the point where traffic can be read, and reading
 * traffic is the entire game. The projection stays in place because the
 * ribbon-filled road it forced is better rendering than the strokes it
 * replaced, and because turning it back on is one constant.
 */
const PERSPECTIVE = false;

/** Camera pitch, radians below the horizontal. Lower is a flatter, more readable table. */
const PITCH = 0.86;
/** Height above the plane, in design units. */
const HEIGHT = 620;
/** Ground distance from the camera to the nearest edge of the design area. */
const NEAR = 250;
/** Focal length. Larger is a longer lens and a weaker perspective. */
const FOCAL = 700;

/**
 * Where the projected scene sits and how much of the frame it fills.
 *
 * Horizontal and vertical fit are separate on purpose: a portrait screen is
 * much taller than the projected plane is deep, so stretching only the vertical
 * fills the frame without pushing the near edge of the track off the sides.
 */
const SCREEN_CX = DESIGN_W / 2;
const SCREEN_CY = DESIGN_H * 0.56;
const FIT_X = 1.04;
const FIT_Y = 1.74;

const cosPitch = Math.cos(PITCH);
const sinPitch = Math.sin(PITCH);

/** Reference depth, so `scale` is around 1 in the middle of the board. */
const REFERENCE = (NEAR + DESIGN_H * 0.5) * cosPitch + HEIGHT * sinPitch;

export function project(x: number, y: number): Projected {
  if (!PERSPECTIVE) {
    // Straight overhead: design space is screen space. Depth still runs from the
    // far edge to the near one so draw ordering does not have to special-case it.
    return { x, y, scale: 1, depth: DESIGN_H - y };
  }

  // Design y runs top (far) to bottom (near); ground distance runs the other way.
  const ground = NEAR + (DESIGN_H - y);
  const lateral = x - SCREEN_CX;

  // Camera space after pitching down towards the plane.
  const depth = ground * cosPitch + HEIGHT * sinPitch;
  const vertical = ground * sinPitch - HEIGHT * cosPitch;

  const scale = FOCAL / Math.max(1, depth);
  return {
    x: SCREEN_CX + lateral * scale * FIT_X,
    y: SCREEN_CY - vertical * scale * FIT_Y,
    // Sprites use one scale; the geometric mean keeps them from looking squashed.
    scale: (REFERENCE / Math.max(1, depth)) * Math.sqrt(FIT_X * FIT_Y),
    depth
  };
}

export function projectPath(points: Vec2[]): Projected[] {
  return points.map((point) => project(point.x, point.y));
}

/**
 * Screen heading at a point, given the direction it faces on the plane.
 * Perspective rotates directions, so a car's sprite angle has to be measured
 * after projection rather than taken from the track.
 */
export function projectedHeading(x: number, y: number, angle: number): number {
  const step = 2;
  const a = project(x, y);
  const b = project(x + Math.cos(angle) * step, y + Math.sin(angle) * step);
  return Math.atan2(b.y - a.y, b.x - a.x);
}
