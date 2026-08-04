/**
 * The only module that talks to the host directly. Everything else works in
 * design-space coordinates and never needs to know whether it is running inside
 * WeChat or a browser.
 */

export const canvas = wx.createCanvas();

const context2d = canvas.getContext('2d');
if (!context2d) throw new Error('2D canvas context is unavailable');

/**
 * The active draw target. Every render helper imports this binding, so
 * withRenderTarget() can point the whole render layer at an offscreen canvas
 * without threading a context parameter through every function.
 */
export let ctx: CanvasRenderingContext2D = context2d;

export function withRenderTarget(target: CanvasRenderingContext2D, draw: () => void): void {
  const previous = ctx;
  ctx = target;
  try {
    draw();
  } finally {
    ctx = previous;
  }
}

/**
 * In WeChat the first wx.createCanvas() is the display canvas and every later
 * call returns an offscreen one; index.html's shim follows the same rule.
 */
export function createOffscreenCanvas(width: number, height: number): WxCanvas | null {
  try {
    const offscreen = wx.createCanvas();
    offscreen.width = width;
    offscreen.height = height;
    return offscreen;
  } catch (error) {
    return null;
  }
}

const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync!();

export const VIEW_W = windowInfo.windowWidth;
export const VIEW_H = windowInfo.windowHeight;
export const DPR = Math.min(windowInfo.pixelRatio || 1, 3);

canvas.width = Math.floor(VIEW_W * DPR);
canvas.height = Math.floor(VIEW_H * DPR);
ctx.scale(DPR, DPR);

/** Layout is authored against one portrait reference size and letterboxed to fit. */
export const DESIGN_W = 390;
export const DESIGN_H = 844;
export const scale = Math.min(VIEW_W / DESIGN_W, VIEW_H / DESIGN_H);
export const offsetX = (VIEW_W - DESIGN_W * scale) * 0.5;
export const offsetY = (VIEW_H - DESIGN_H * scale) * 0.5;

export function screenToDesignX(screenX: number): number {
  return (screenX - offsetX) / scale;
}

export function screenToDesignY(screenY: number): number {
  return (screenY - offsetY) / scale;
}

/** Haptics are a nice-to-have: a shim without them must never break the game. */
export function vibrate(type: 'heavy' | 'medium' | 'light'): void {
  if (typeof wx.vibrateShort !== 'function') return;
  try {
    wx.vibrateShort({ type });
  } catch (error) {
    /* browser/test shim */
  }
}

export function createCompatibleAudioContext(): AudioContext | null {
  if (typeof wx !== 'undefined' && typeof wx.createWebAudioContext === 'function') {
    try {
      return wx.createWebAudioContext();
    } catch (error) {
      /* fallback below */
    }
  }

  if (typeof globalThis !== 'undefined') {
    const scope = globalThis as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const BrowserAudioContext = scope.AudioContext || scope.webkitAudioContext;
    if (BrowserAudioContext) {
      try {
        return new BrowserAudioContext();
      } catch (error) {
        /* sound stays disabled */
      }
    }
  }
  return null;
}

export const scheduleFrame: (callback: (now?: number) => void) => void =
  typeof requestAnimationFrame === 'function'
    ? (callback) => { requestAnimationFrame(callback); }
    : (callback) => { setTimeout(() => callback(Date.now()), 16); };
