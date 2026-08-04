// Shared headless harness: loads the built bundle in a vm with a stubbed WeChat
// surface and hands back the game's exported globals plus frame/touch drivers.
//
// No `window` is defined, so the game takes the wx touch path exactly as it does
// on a real phone.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const noop = () => {};

export function createGame() {
  const handlers = {};
  const storage = new Map();
  let pendingFrame = null;

  const createdCanvases = [];

  const makeCtxStub = (owner) => new Proxy({}, {
    get(target, prop) {
      if (prop === 'canvas') return owner;
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop: noop });
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop in target) return target[prop];
      return noop;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });

  // WeChat hands back the display canvas first and offscreen canvases after, so
  // the stub must do the same or the cached track layer would draw onto itself.
  const makeCanvas = () => {
    const stub = {
      width: 0,
      height: 0
      // No addEventListener on purpose: the real mini game canvas has none either.
    };
    stub.getContext = () => makeCtxStub(stub);
    createdCanvases.push(stub);
    return stub;
  };

  const sandbox = {
    console,
    setTimeout,
    requestAnimationFrame: (cb) => { pendingFrame = cb; return 1; },
    wx: {
      createCanvas: () => makeCanvas(),
      getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 2 }),
      vibrateShort: noop,
      onTouchStart: (fn) => { handlers.start = fn; },
      onTouchMove: (fn) => { handlers.move = fn; },
      onTouchEnd: (fn) => { handlers.end = fn; },
      onTouchCancel: (fn) => { handlers.cancel = fn; },
      onHide: noop,
      onShow: noop,
      getStorageSync: (key) => storage.get(key) ?? '',
      setStorageSync: (key, value) => { storage.set(key, value); }
    }
  };

  vm.createContext(sandbox);
  vm.runInContext(readFileSync(resolve(root, 'game.js'), 'utf8'), sandbox, { filename: 'game.js' });

  const game = sandbox.HarborLoop;
  if (!game) throw new Error('game.js did not expose the HarborLoop global');

  let clock = 0;
  function step(seconds) {
    const count = Math.max(1, Math.round(seconds / 0.016));
    for (let i = 0; i < count; i++) {
      clock += 16;
      const cb = pendingFrame;
      pendingFrame = null;
      if (cb) cb(clock);
    }
  }

  const fire = (name, touches) => {
    if (handlers[name]) handlers[name]({ changedTouches: touches, touches });
  };

  return {
    game,
    step,
    fire,
    storage,
    canvasCount: () => createdCanvases.length,
    frameScheduled: () => pendingFrame !== null
  };
}

export const touch = (id, x, y) => ({ identifier: id, clientX: x, clientY: y });

export function reporter() {
  const results = [];
  return {
    check(name, pass, detail = '') {
      results.push({ name, pass: Boolean(pass), detail });
    },
    finish() {
      let failed = 0;
      for (const result of results) {
        if (!result.pass) failed++;
        console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? `  (${result.detail})` : ''}`);
      }
      console.log(`\n${results.length - failed}/${results.length} passed`);
      process.exit(failed ? 1 : 0);
    }
  };
}
