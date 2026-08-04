/**
 * First-run coaching.
 *
 * A new player arrives at a menu of sixteen modes with no idea that the bottom
 * of the screen is a steering wheel. First activation is the first term in the
 * retention formula, and there was nothing here at all.
 *
 * It teaches by getting out of the way: each hint disappears the moment the
 * player uses that control, and the whole thing never shows again once both are
 * used. No modal, no button to dismiss, no second appearance.
 */

import { loadOnboarded, saveOnboarded } from './storage';

const MAX_SECONDS = 12;

const state = {
  active: false,
  usedLane: false,
  usedThrottle: false,
  elapsed: 0
};

export function beginOnboarding(): void {
  if (loadOnboarded()) {
    state.active = false;
    return;
  }
  state.active = true;
  state.usedLane = false;
  state.usedThrottle = false;
  state.elapsed = 0;
}

export function onboardingActive(): boolean {
  return state.active;
}

export function noteLaneChange(): void {
  if (state.active) state.usedLane = true;
}

export function noteThrottle(): void {
  if (state.active) state.usedThrottle = true;
}

export function updateOnboarding(dt: number): void {
  if (!state.active) return;
  state.elapsed += dt;

  // Either the player has demonstrated both controls, or they have had long
  // enough that the hints are now clutter.
  if ((state.usedLane && state.usedThrottle) || state.elapsed > MAX_SECONDS) {
    state.active = false;
    saveOnboarded(true);
  }
}

export function onboardingState(): { lane: boolean; throttle: boolean } {
  return { lane: !state.usedLane, throttle: !state.usedThrottle };
}

/** Test hook: forget that the player has been shown the controls. */
export function resetOnboarding(): void {
  saveOnboarded(false);
  state.active = false;
}
