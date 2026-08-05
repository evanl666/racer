/**
 * Start-of-run countdown.
 *
 * Three seconds of held breath before the world moves. Everything is frozen —
 * traffic, the player, the clock — so the first thing a player sees is a still
 * frame they can read, instead of being dropped into moving traffic mid-thought.
 *
 * Its own module because both player input and the frame loop need to ask
 * whether the world is running, and neither can import the run without a cycle.
 */

const COUNT_FROM = 3;

const state = {
  remaining: 0
};

export function beginCountdown(seconds: number = COUNT_FROM): void {
  state.remaining = seconds;
}

export function countdownActive(): boolean {
  return state.remaining > 0;
}

/** Ticks the countdown. Returns true while the world should stay frozen. */
export function updateCountdown(dt: number): boolean {
  if (state.remaining <= 0) return false;
  state.remaining = Math.max(0, state.remaining - dt);
  return true;
}

export function countdownRemaining(): number {
  return state.remaining;
}

/** 3, 2, 1 then GO, which lingers briefly after the count reaches zero. */
export function countdownLabel(): string {
  if (state.remaining <= 0) return '';
  const step = Math.ceil(state.remaining);
  return step > 0 ? String(step) : 'GO';
}

export function clearCountdown(): void {
  state.remaining = 0;
}
