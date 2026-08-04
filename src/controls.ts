/**
 * On-screen control bar layout and its press state.
 *
 * Shared by input.ts (hit testing) and render/hud.ts (drawing) so the touch
 * targets and the pixels can never drift apart.
 */

import type { Control, ControlId } from './types';

// The widest road stroke reaches y = 733 in design space, so this bottom strip
// never covers the track or any car, and its lower edge stops at 810 to stay
// clear of the iPhone home indicator.
export const CONTROL_BAR_TOP = 738;
export const CONTROL_H = 72;
export const CONTROL_RADIUS = 18;
export const CONTROL_HIT_PADDING = 10;
export const CONTROL_FLASH_DURATION = 0.14;

export const CONTROLS: Control[] = [
  { id: 'left', kind: 'lane', direction: +1, x: 20, w: 76 },
  { id: 'right', kind: 'lane', direction: -1, x: 104, w: 76 },
  { id: 'throttle', kind: 'throttle', direction: 0, x: 236, w: 134 }
].map((control) => ({ ...control, y: CONTROL_BAR_TOP, h: CONTROL_H })) as Control[];

export function controlAtDesignPoint(x: number, y: number): Control | null {
  for (const control of CONTROLS) {
    if (x >= control.x - CONTROL_HIT_PADDING && x <= control.x + control.w + CONTROL_HIT_PADDING &&
        y >= control.y - CONTROL_HIT_PADDING && y <= control.y + control.h + CONTROL_HIT_PADDING) {
      return control;
    }
  }
  return null;
}

/** Seconds of highlight left on each lane button after a tap. */
export const laneButtonFlash: Record<Exclude<ControlId, 'throttle'>, number> = {
  left: 0,
  right: 0
};

export function updateControlFlash(dt: number): void {
  laneButtonFlash.left = Math.max(0, laneButtonFlash.left - dt);
  laneButtonFlash.right = Math.max(0, laneButtonFlash.right - dt);
}

export function flashLaneButton(id: ControlId): void {
  if (id === 'throttle') return;
  laneButtonFlash[id] = CONTROL_FLASH_DURATION;
}
