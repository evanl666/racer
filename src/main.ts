/**
 * Harbor Loop — WeChat Mini Game.
 *
 * Entry point: owns the frame loop and switches between the three screens.
 * Everything it calls lives in its own module, so this stays a table of contents.
 *
 * Structure:
 * - One extra-long, smooth, non-crossing six-lane top-down circuit.
 * - Sixteen race modes at three speeds, selected from the menu.
 * - Eighteen black AI cars with readable, telegraphed lane changes.
 * - Overtake -> combo; every ten overtakes raises a permanent speed tier.
 * - What a contact means (crash, kill, nothing) is the active mode's decision.
 * - Two lane buttons and a hold-to-accelerate throttle for touch play; keyboard
 *   arrows plus Space work for browser testing.
 * - Procedural engine, lane-change and overtake audio via WebAudio.
 * - Personal bests in local storage, career total on the WeChat friend ranking.
 */

import { updateAi } from './ai';
import { app, finishRun } from './app';
import { audio } from './audio';
import { updateControlFlash } from './controls';
import { installInput, releaseAllPointers } from './input';
import { ctx, DPR, offsetX, offsetY, scale, scheduleFrame, VIEW_H, VIEW_W } from './platform';
import { updatePlayer } from './player';
import { drawControls, drawHud } from './render/hud';
import { drawBlackout, drawHazardLane } from './render/overlays';
import { drawTrack } from './render/road';
import { drawBackground } from './render/scenery';
import { drawCars } from './render/vehicles';
import { runIsOver, updateRun } from './run';
import { drawMenu } from './screens/menu';
import { drawResult, enterResultScreen } from './screens/result';
import { detectCollisions, detectOvertakes } from './scoring';
import { installShareMenu } from './share';
import { aiCars, engineSnapshot, inputState, player } from './state';

let lastTime = Date.now();

function stepRace(dt: number): void {
  updateControlFlash(dt);
  updateAi(dt);
  updatePlayer(dt);
  audio.update(dt, engineSnapshot());

  const collided = detectCollisions();
  if (!collided) detectOvertakes();

  updateRun(dt);
}

function drawRace(): void {
  drawBackground();
  drawTrack();
  drawHazardLane();
  drawCars();
  drawBlackout();
  drawHud();
  drawControls();
}

function frame(nowValue?: number): void {
  const now = typeof nowValue === 'number' ? nowValue : Date.now();
  const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  if (app.screen === 'PLAYING') {
    stepRace(dt);
    drawRace();
  } else if (app.screen === 'MENU') {
    drawMenu();
  } else {
    drawResult();
  }

  ctx.restore();

  // Transition after drawing, so the last frame of the run is shown once.
  if (app.screen === 'PLAYING' && runIsOver()) {
    releaseAllPointers();
    enterResultScreen();
    finishRun();
  }

  scheduleFrame(frame);
}

installInput();
installShareMenu();

if (typeof wx.onHide === 'function') {
  wx.onHide(() => {
    releaseAllPointers();
    audio.suspend();
  });
}
if (typeof wx.onShow === 'function') wx.onShow(() => audio.resume());

scheduleFrame(frame);

/**
 * Exposed on the bundle's global (HarborLoop) for the headless tests and for
 * poking at state from the WeChat devtools console.
 */
export { player, aiCars, inputState };
export { app, startMode, openMenu, retryRun } from './app';
export { run } from './run';
export { MODES } from './modes';
export { laneButtonFlash } from './controls';
export { debugPointerCount } from './input';
export { bestScore, careerPoints } from './storage';
