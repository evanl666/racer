/**
 * Harbor Loop — WeChat Mini Game prototype.
 *
 * Entry point: owns the frame loop and wires the modules together. Every system
 * it calls lives in its own file, so this stays a readable table of contents.
 *
 * Scope:
 * - One extra-long, smooth, non-crossing six-lane top-down circuit.
 * - Instant left/right lane switching anywhere on the track.
 * - Eighteen slower black AI cars with readable lane changes.
 * - AI lane changes are blocked inside a speed-scaled player safety zone.
 * - Overtake -> combo +1; every ten overtakes triggers a permanent speed tier.
 * - Collision -> speed 0, combo reset, flash, recover to base speed.
 * - Minimal HUD: only corner combo, plus a visible bottom control bar.
 * - Two lane buttons and a hold-to-accelerate throttle button for touch play;
 *   the track area above them keeps the old left/right half tap for lane changes.
 * - Hold Up / W / Space for throttle; release to coast back to cruise speed.
 * - Engine RPM and real road speed step up every ten overtakes.
 * - Procedural engine, lane-change and overtake audio via WebAudio.
 */

import { updateAi } from './ai';
import { audio } from './audio';
import { updateControlFlash } from './controls';
import { installInput, releaseAllPointers } from './input';
import { ctx, DPR, offsetX, offsetY, scale, scheduleFrame, VIEW_H, VIEW_W } from './platform';
import { updatePlayer } from './player';
import { drawHud, drawControls } from './render/hud';
import { drawTrack } from './render/road';
import { drawBackground } from './render/scenery';
import { drawCars } from './render/vehicles';
import { detectCollisions, detectOvertakes } from './scoring';
import { aiCars, engineSnapshot, inputState, player, resetGame } from './state';

let lastTime = Date.now();

function frame(nowValue?: number): void {
  const now = typeof nowValue === 'number' ? nowValue : Date.now();
  const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;

  updateControlFlash(dt);
  updateAi(dt);
  updatePlayer(dt);
  audio.update(dt, engineSnapshot());
  const collided = detectCollisions();
  if (!collided) detectOvertakes();

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  drawBackground();
  drawTrack();
  drawCars();
  drawHud();
  drawControls();
  ctx.restore();

  scheduleFrame(frame);
}

resetGame();
installInput();

if (typeof wx.onHide === 'function') {
  wx.onHide(() => {
    releaseAllPointers();
    audio.suspend();
  });
}
if (typeof wx.onShow === 'function') wx.onShow(() => audio.resume());

scheduleFrame(frame);

/**
 * Exposed on the bundle's global (HarborLoop) for the headless input tests and
 * for poking at state from the WeChat devtools console. Nothing in the game reads
 * these back, so removing them would only cost debuggability.
 */
export { player, aiCars, inputState, resetGame };
export { laneButtonFlash } from './controls';
export { debugPointerCount } from './input';
