/**
 * Game feel: hit-stop and screen shake.
 *
 * Both are short, decaying and capped. Hit-stop freezes the simulation for a
 * few dozen milliseconds so an impact registers before the world moves on;
 * shake displaces the camera along the axis of the hit. Kept together because
 * they are almost always triggered by the same event.
 */

const MAX_SHAKE = 9;

const state = {
  /** Seconds of simulation freeze left. */
  hitStop: 0,
  shake: 0,
  shakeAngle: 0,
  shakeTime: 0
};

/** Freeze the world briefly. Repeated calls take the longest pause, not the sum. */
export function addHitStop(seconds: number): void {
  state.hitStop = Math.max(state.hitStop, seconds);
}

/** Shake the camera. `angle` biases the displacement along the impact axis. */
export function addShake(strength: number, angle = Math.random() * Math.PI * 2): void {
  if (strength <= state.shake) return;
  state.shake = Math.min(MAX_SHAKE, strength);
  state.shakeAngle = angle;
  state.shakeTime = 0;
}

/**
 * Advances the effects and reports how much simulation time the frame gets.
 * During hit-stop that is zero, which is what makes the freeze read as impact.
 */
export function consumeHitStop(dt: number): number {
  if (state.hitStop <= 0) return dt;
  state.hitStop = Math.max(0, state.hitStop - dt);
  return 0;
}

export function updateFeel(dt: number): void {
  state.shakeTime += dt;
  // ~0.18s to settle, fast enough to feel like a hit rather than a wobble.
  state.shake = Math.max(0, state.shake - dt * 52);
}

export function shakeOffsetX(): number {
  if (state.shake <= 0) return 0;
  return Math.cos(state.shakeAngle + state.shakeTime * 47) * state.shake;
}

export function shakeOffsetY(): number {
  if (state.shake <= 0) return 0;
  return Math.sin(state.shakeAngle + state.shakeTime * 41) * state.shake * 0.7;
}

export function resetFeel(): void {
  state.hitStop = 0;
  state.shake = 0;
  state.shakeTime = 0;
}

/** Exposed for the headless tests. */
export function feelState(): { hitStop: number; shake: number } {
  return { hitStop: state.hitStop, shake: state.shake };
}
