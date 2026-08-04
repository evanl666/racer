/**
 * Screen-wide visual effects a mode can drive without reaching into the renderer.
 * main.ts resets these at the start of every run and the render layer reads them.
 */
export const effects = {
  /** 0 = clear, 1 = fully blacked out. */
  dim: 0,
  /** Lane index that is currently lethal, or -1. */
  hazardLane: -1
};

export function resetEffects(): void {
  effects.dim = 0;
  effects.hazardLane = -1;
}
