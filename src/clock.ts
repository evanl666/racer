/**
 * Frame clock.
 *
 * Owns the delta so a run can reset it. Without that, the first frame after the
 * menu measured the whole time the menu was open and arrived clamped to the 50ms
 * ceiling — a visible lurch at the start of every run, and enough to make two
 * daily runs on the same seed diverge before the player had touched anything.
 */

const MAX_DELTA = 0.05;
const NOMINAL_DELTA = 1 / 60;

let lastTime: number | null = null;
let restarting = true;

/** Seconds since the previous frame, clamped. The first frame of a run is nominal. */
export function frameDelta(now: number): number {
  if (restarting || lastTime === null) {
    restarting = false;
    lastTime = now;
    return NOMINAL_DELTA;
  }
  const dt = Math.min(MAX_DELTA, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  return dt;
}

/** Makes the next frame nominal, discarding however long we were away. */
export function resetClock(): void {
  restarting = true;
}
