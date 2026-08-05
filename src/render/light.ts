/**
 * One light direction for the whole scene.
 *
 * The flat look came from everything being lit from nowhere: no cast shadows,
 * no side faces, no rim. Fixing that only needs a single agreed direction that
 * every shape offsets against — cars, road and islands all lean the same way,
 * which is what makes a top-down scene read as solid rather than printed.
 *
 * The light lives in screen space, so a car that rotates through a corner keeps
 * its shadow pointing the same way instead of carrying it around like a flag.
 */

/** Direction shadows fall, in radians. Down and slightly right. */
export const LIGHT_ANGLE = Math.PI * 0.32;

export const SHADOW_X = Math.cos(LIGHT_ANGLE);
export const SHADOW_Y = Math.sin(LIGHT_ANGLE);

/** How far a car's cast shadow sits from the car, in design units. */
export const CAR_SHADOW_DISTANCE = 3.2;
/** Apparent body height: how far the top face floats above the side face. */
export const CAR_BODY_DEPTH = 1.5;
/** Islands sit lower than cars but still above the water. */
export const ISLAND_DEPTH = 3.4;
/** The road is a raised deck over the water. */
export const ROAD_DEPTH = 5.0;

/**
 * The light direction expressed inside a shape rotated by `angle`, so an
 * extruded side face leans the right way whichever direction the car faces.
 */
export function localLight(angle: number, distance: number): { x: number; y: number } {
  const local = LIGHT_ANGLE - angle;
  return { x: Math.cos(local) * distance, y: Math.sin(local) * distance };
}
