/**
 * Harbor Loop — WeChat Mini Game prototype v0.5.
 *
 * Scope:
 * - One original six-lane top-down harbor track.
 * - Instant left/right lane switching anywhere on the track.
 * - Fourteen slower black AI cars on fixed lanes.
 * - Overtake -> combo +1 -> player speed increases.
 * - Collision -> speed 0, combo reset, flash, recover to base speed.
 * - No AI lane-changing, audio, online leaderboard, or external assets yet.
 */

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
const VIEW_W = windowInfo.windowWidth;
const VIEW_H = windowInfo.windowHeight;
const DPR = Math.min(windowInfo.pixelRatio || 1, 3);

canvas.width = Math.floor(VIEW_W * DPR);
canvas.height = Math.floor(VIEW_H * DPR);
ctx.scale(DPR, DPR);

const DESIGN_W = 390;
const DESIGN_H = 844;
const scale = Math.min(VIEW_W / DESIGN_W, VIEW_H / DESIGN_H);
const offsetX = (VIEW_W - DESIGN_W * scale) * 0.5;
const offsetY = (VIEW_H - DESIGN_H * scale) * 0.5;

const COLORS = {
  water: '#173A53',
  waterLine: 'rgba(255,255,255,0.055)',
  land: '#A4B878',
  landDark: '#7E9560',
  roadEdge: '#1E252A',
  road: '#65717A',
  lane: 'rgba(240,244,246,0.42)',
  player: '#FF4F52',
  playerLight: '#FF8A78',
  window: '#D8F5FF',
  ai: '#11171B',
  aiLight: '#2B343A',
  aiWindow: '#6E7F88',
  text: '#F6F7F4',
  muted: 'rgba(246,247,244,0.68)',
  accent: '#54D9D1',
  accentLight: '#B8FFF7',
  button: 'rgba(8,17,25,0.82)',
  buttonActive: 'rgba(84,217,209,0.34)',
  buttonDisabled: 'rgba(8,17,25,0.42)'
};

const LANE_COUNT = 6;
const LANE_GAP = 11.5;
const ROAD_HALF_WIDTH = 38.5;
const PLAYER_BASE_SPEED = 155;
const PLAYER_MAX_SPEED = 345;

// Three-stage acceleration curve:
// 1) Get to an exciting speed quickly.
// 2) Keep accelerating at a gentler rate so the player can stay in the flow.
// 3) Continue increasing pressure slowly at high combo instead of flattening out.
const SPEED_STAGE_1_END = 8;
const SPEED_STAGE_2_END = 24;
const SPEED_STAGE_3_END = 60;
const SPEED_STAGE_1_GAIN = 7.0;
const SPEED_STAGE_2_GAIN = 3.2;
const SPEED_STAGE_3_GAIN = 1.3;
const SPEED_STAGE_4_GAIN = 0.55;
const CHANGE_DURATION = 0.05;
const COLLISION_PATH_DISTANCE = 11.5;
const COLLISION_LANE_DISTANCE = 0.46;

const LEFT_BUTTON = { x: 28, y: 739, w: 146, h: 70 };
const RIGHT_BUTTON = { x: 216, y: 739, w: 146, h: 70 };
const RESTART_BUTTON = { x: 145, y: 689, w: 100, h: 38 };

// Original harbor-like course. It intentionally does not trace PixelJunk's map.
const CONTROL_POINTS = [
  { x: 82,  y: 151 },
  { x: 189, y: 105 },
  { x: 310, y: 139 },
  { x: 334, y: 232 },
  { x: 273, y: 304 },
  { x: 174, y: 330 },
  { x: 92,  y: 384 },
  { x: 73,  y: 494 },
  { x: 116, y: 595 },
  { x: 224, y: 636 },
  { x: 316, y: 588 },
  { x: 332, y: 489 },
  { x: 283, y: 410 },
  { x: 199, y: 390 },
  { x: 126, y: 334 },
  { x: 64,  y: 249 }
];

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
  };
}

function buildClosedSpline(points, samplesPerSegment = 28) {
  const sampled = [];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    for (let j = 0; j < samplesPerSegment; j++) {
      sampled.push(catmullRom(p0, p1, p2, p3, j / samplesPerSegment));
    }
  }
  return sampled;
}

const centerPath = buildClosedSpline(CONTROL_POINTS);

function buildArcData(points) {
  const cumulative = [0];
  let total = 0;
  for (let i = 1; i <= points.length; i++) {
    const a = points[i - 1];
    const b = points[i % points.length];
    total += Math.hypot(b.x - a.x, b.y - a.y);
    cumulative.push(total);
  }
  return { cumulative, total };
}

const arc = buildArcData(centerPath);

function wrapDistance(distance) {
  return ((distance % arc.total) + arc.total) % arc.total;
}

function circularDistance(a, b) {
  const raw = Math.abs(wrapDistance(a) - wrapDistance(b));
  return Math.min(raw, arc.total - raw);
}

function sampleAtDistance(distance, laneIndex) {
  const d = wrapDistance(distance);
  let lo = 0;
  let hi = centerPath.length;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (arc.cumulative[mid] <= d) lo = mid;
    else hi = mid;
  }

  const i = Math.min(lo, centerPath.length - 1);
  const a = centerPath[i];
  const b = centerPath[(i + 1) % centerPath.length];
  const segmentStart = arc.cumulative[i];
  const segmentLength = Math.max(0.0001, arc.cumulative[i + 1] - segmentStart);
  const t = (d - segmentStart) / segmentLength;
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const laneOffset = (laneIndex - (LANE_COUNT - 1) / 2) * LANE_GAP;

  return {
    x: x + nx * laneOffset,
    y: y + ny * laneOffset,
    angle: Math.atan2(dy, dx)
  };
}

function pathForLane(laneIndex) {
  return centerPath.map((p, i) => {
    const prev = centerPath[(i - 1 + centerPath.length) % centerPath.length];
    const next = centerPath[(i + 1) % centerPath.length];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const laneOffset = (laneIndex - (LANE_COUNT - 1) / 2) * LANE_GAP;
    return { x: p.x + nx * laneOffset, y: p.y + ny * laneOffset };
  });
}

// Five separators create six actual lanes. Cars run between these lines.
const laneDividerPaths = Array.from({ length: LANE_COUNT - 1 }, (_, i) => pathForLane(i + 0.5));

function strokeClosedPath(points, width, color) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function roundRect(context, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}

function drawBackground() {
  ctx.fillStyle = COLORS.water;
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

  ctx.strokeStyle = COLORS.waterLine;
  ctx.lineWidth = 1;
  for (let y = 96; y < 720; y += 18) {
    ctx.beginPath();
    for (let x = 0; x <= DESIGN_W; x += 20) {
      const yy = y + Math.sin((x + y) * 0.045) * 2;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  ctx.fillStyle = COLORS.landDark;
  ctx.beginPath(); ctx.ellipse(197, 226, 74, 47, -0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.land;
  ctx.beginPath(); ctx.ellipse(197, 222, 66, 39, -0.18, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = COLORS.landDark;
  ctx.beginPath(); ctx.ellipse(220, 515, 62, 42, 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.land;
  ctx.beginPath(); ctx.ellipse(220, 510, 54, 35, 0.12, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = 'rgba(242,245,232,0.65)';
  for (const dock of [
    [151, 195, 24, 8, -0.2], [233, 246, 28, 8, 0.25],
    [186, 488, 25, 8, -0.1], [245, 530, 27, 8, 0.22]
  ]) {
    ctx.save(); ctx.translate(dock[0], dock[1]); ctx.rotate(dock[4]);
    ctx.fillRect(-dock[2] / 2, -dock[3] / 2, dock[2], dock[3]); ctx.restore();
  }
}

function drawTrack() {
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 + 8, COLORS.roadEdge);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2, COLORS.road);

  for (const dividerPath of laneDividerPaths) {
    strokeClosedPath(dividerPath, 1.15, COLORS.lane);
  }

  // Start/finish line remains; the old blue cross-track markers are removed.
  const sf = sampleAtDistance(0, (LANE_COUNT - 1) / 2);
  ctx.save();
  ctx.translate(sf.x, sf.y);
  ctx.rotate(sf.angle);
  for (let i = -4; i <= 3; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#F2F2EB' : '#22282C';
    ctx.fillRect(-2, i * 8, 4, 8);
    ctx.fillStyle = i % 2 === 0 ? '#22282C' : '#F2F2EB';
    ctx.fillRect(2, i * 8, 4, 8);
  }
  ctx.restore();
}

function drawVehicle(distance, laneIndex, style, alpha = 1) {
  const p = sampleAtDistance(distance, laneIndex);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = style.body;
  roundRect(ctx, -8.5, -4.8, 17, 9.6, 3.2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = style.cabin;
  roundRect(ctx, -2.5, -3.6, 6.8, 7.2, 2.1);
  ctx.fill();

  ctx.fillStyle = style.window;
  roundRect(ctx, -1.2, -2.8, 4.2, 5.6, 1.4);
  ctx.fill();

  ctx.fillStyle = style.lights;
  ctx.fillRect(6.9, -3.3, 1.3, 2.2);
  ctx.fillRect(6.9, 1.1, 1.3, 2.2);
  ctx.restore();
}

const PLAYER_STYLE = {
  body: COLORS.player,
  cabin: COLORS.playerLight,
  window: COLORS.window,
  lights: '#FFE6A4'
};

const AI_STYLE = {
  body: COLORS.ai,
  cabin: COLORS.aiLight,
  window: COLORS.aiWindow,
  lights: '#C5D3D8'
};

const AI_BLUEPRINTS = [
  // Same-lane cars share speed so they never stack on top of one another.
  { fraction: 0.11, lane: 0, speed: 84 },
  { fraction: 0.48, lane: 0, speed: 84 },
  { fraction: 0.82, lane: 0, speed: 84 },
  { fraction: 0.19, lane: 1, speed: 90 },
  { fraction: 0.61, lane: 1, speed: 90 },
  { fraction: 0.28, lane: 2, speed: 96 },
  { fraction: 0.73, lane: 2, speed: 96 },
  { fraction: 0.36, lane: 3, speed: 102 },
  { fraction: 0.88, lane: 3, speed: 102 },
  { fraction: 0.15, lane: 4, speed: 108 },
  { fraction: 0.53, lane: 4, speed: 108 },
  { fraction: 0.24, lane: 5, speed: 114 },
  { fraction: 0.66, lane: 5, speed: 114 },
  { fraction: 0.94, lane: 5, speed: 114 }
];

const player = {
  distance: 0,
  lane: 2,
  visualLane: 2,
  laneFrom: 2,
  laneTo: 2,
  laneChangeElapsed: 0,
  speed: PLAYER_BASE_SPEED,
  state: 'NORMAL', // NORMAL | CHANGING_LANE | CRASHED | RECOVERING
  stateElapsed: 0,
  invincible: 0,
  combo: 0,
  bestCombo: 0,
  totalPasses: 0,
  passPopElapsed: 10,
  collisionCount: 0
};

let aiCars = [];

function resetGame() {
  player.distance = arc.total * 0.03;
  player.lane = 2;
  player.visualLane = 2;
  player.laneFrom = 2;
  player.laneTo = 2;
  player.laneChangeElapsed = 0;
  player.speed = PLAYER_BASE_SPEED;
  player.state = 'NORMAL';
  player.stateElapsed = 0;
  player.invincible = 0;
  player.combo = 0;
  player.bestCombo = 0;
  player.totalPasses = 0;
  player.passPopElapsed = 10;
  player.collisionCount = 0;

  aiCars = AI_BLUEPRINTS.map((blueprint) => {
    const distance = arc.total * blueprint.fraction;
    return {
      distance,
      lane: blueprint.lane,
      speed: blueprint.speed,
      passIndex: Math.floor((player.distance - distance) / arc.total)
    };
  });
}

function laneInputStateAllows() {
  return player.state !== 'CRASHED';
}

function requestLaneChange(direction) {
  if (!laneInputStateAllows()) return;

  const target = Math.max(0, Math.min(LANE_COUNT - 1, player.lane + direction));
  if (target === player.lane) return;

  player.laneFrom = player.visualLane;
  player.laneTo = target;
  player.lane = target;
  player.laneChangeElapsed = 0.0001;
  if (player.state === 'NORMAL' || player.state === 'CHANGING_LANE') {
    player.state = 'CHANGING_LANE';
  }
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function inputAtScreenPoint(screenX, screenY) {
  const x = (screenX - offsetX) / scale;
  const y = (screenY - offsetY) / scale;

  if (pointInRect(x, y, RESTART_BUTTON)) resetGame();
  else if (pointInRect(x, y, LEFT_BUTTON)) requestLaneChange(+1);
  else if (pointInRect(x, y, RIGHT_BUTTON)) requestLaneChange(-1);
}

function installInput() {
  if (typeof wx.onTouchStart === 'function') {
    wx.onTouchStart((event) => {
      const touch = event.touches && event.touches[0];
      if (touch) inputAtScreenPoint(touch.clientX, touch.clientY);
    });
  }

  if (canvas && typeof canvas.addEventListener === 'function') {
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: VIEW_W, height: VIEW_H };
      const localX = (event.clientX - rect.left) * VIEW_W / Math.max(1, rect.width);
      const localY = (event.clientY - rect.top) * VIEW_H / Math.max(1, rect.height);
      inputAtScreenPoint(localX, localY);
    });
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('keydown', (event) => {
      const key = String(event.key || '').toLowerCase();
      const code = String(event.code || '');
      if (event.repeat) return;

      if (key === 'arrowleft' || key === 'a' || code === 'ArrowLeft' || code === 'KeyA') {
        event.preventDefault();
        requestLaneChange(+1);
      } else if (key === 'arrowright' || key === 'd' || code === 'ArrowRight' || code === 'KeyD') {
        event.preventDefault();
        requestLaneChange(-1);
      } else if (key === 'r' || code === 'KeyR') {
        event.preventDefault();
        resetGame();
      }
    }, { passive: false });
  }
}

function currentTargetSpeed() {
  const combo = Math.max(0, player.combo);
  const stage1Passes = Math.min(combo, SPEED_STAGE_1_END);
  const stage2Passes = Math.min(
    Math.max(combo - SPEED_STAGE_1_END, 0),
    SPEED_STAGE_2_END - SPEED_STAGE_1_END
  );
  const stage3Passes = Math.min(
    Math.max(combo - SPEED_STAGE_2_END, 0),
    SPEED_STAGE_3_END - SPEED_STAGE_2_END
  );
  const stage4Passes = Math.max(combo - SPEED_STAGE_3_END, 0);

  const target = PLAYER_BASE_SPEED
    + stage1Passes * SPEED_STAGE_1_GAIN
    + stage2Passes * SPEED_STAGE_2_GAIN
    + stage3Passes * SPEED_STAGE_3_GAIN
    + stage4Passes * SPEED_STAGE_4_GAIN;

  return Math.min(PLAYER_MAX_SPEED, target);
}

function beginCollision() {
  if (player.invincible > 0 || player.state === 'CRASHED') return;

  player.state = 'CRASHED';
  player.stateElapsed = 0;
  player.speed = 0;
  player.invincible = 1.25;
  player.combo = 0;
  player.collisionCount += 1;

  if (typeof wx.vibrateShort === 'function') {
    try { wx.vibrateShort({ type: 'medium' }); } catch (error) { /* browser/test shim */ }
  }
}

function updatePlayer(dt) {
  player.invincible = Math.max(0, player.invincible - dt);
  player.passPopElapsed += dt;

  if (player.laneChangeElapsed > 0) {
    player.laneChangeElapsed += dt;
    const t = Math.min(1, player.laneChangeElapsed / CHANGE_DURATION);
    const eased = 1 - Math.pow(1 - t, 3);
    player.visualLane = player.laneFrom + (player.laneTo - player.laneFrom) * eased;
    if (t >= 1) {
      player.visualLane = player.laneTo;
      player.laneChangeElapsed = 0;
      if (player.state === 'CHANGING_LANE') player.state = 'NORMAL';
    }
  }

  if (player.state === 'CRASHED') {
    player.stateElapsed += dt;
    player.speed = 0;
    if (player.stateElapsed >= 0.35) {
      player.state = 'RECOVERING';
      player.stateElapsed = 0;
    }
  } else if (player.state === 'RECOVERING') {
    player.stateElapsed += dt;
    const t = Math.min(1, player.stateElapsed / 0.70);
    player.speed = PLAYER_BASE_SPEED * t;
    if (t >= 1) {
      player.speed = PLAYER_BASE_SPEED;
      player.state = 'NORMAL';
      player.stateElapsed = 0;
    }
  } else {
    player.speed = currentTargetSpeed();
  }

  // Keep an unwrapped distance for reliable lap/overtake detection.
  player.distance += player.speed * dt;
}

function updateAi(dt) {
  for (const car of aiCars) car.distance += car.speed * dt;
}

function detectCollisions() {
  if (player.invincible > 0 || player.state === 'CRASHED') return false;

  for (const car of aiCars) {
    const laneDistance = Math.abs(player.visualLane - car.lane);
    const pathDistance = circularDistance(player.distance, car.distance);
    if (laneDistance <= COLLISION_LANE_DISTANCE && pathDistance <= COLLISION_PATH_DISTANCE) {
      beginCollision();
      return true;
    }
  }
  return false;
}

function detectOvertakes() {
  for (const car of aiCars) {
    const currentPassIndex = Math.floor((player.distance - car.distance) / arc.total);
    if (currentPassIndex > car.passIndex) {
      const overtakes = currentPassIndex - car.passIndex;
      player.combo += overtakes;
      player.totalPasses += overtakes;
      player.bestCombo = Math.max(player.bestCombo, player.combo);
      player.passPopElapsed = 0;
      car.passIndex = currentPassIndex;

      if (typeof wx.vibrateShort === 'function') {
        try { wx.vibrateShort({ type: 'light' }); } catch (error) { /* browser/test shim */ }
      }
    } else if (currentPassIndex < car.passIndex) {
      // This can happen after a crash lets the AI move back in front.
      // Lowering the index allows the same car to be legitimately passed again.
      car.passIndex = currentPassIndex;
    }
  }
}

function drawCars() {
  for (const car of aiCars) drawVehicle(car.distance, car.lane, AI_STYLE);

  let alpha = 1;
  if (player.invincible > 0) {
    alpha = Math.floor(player.invincible * 12) % 2 === 0 ? 0.25 : 1;
  }
  drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, alpha);
}

function drawButton(rect, label, sublabel, enabled) {
  ctx.fillStyle = enabled ? COLORS.buttonActive : COLORS.buttonDisabled;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 18);
  ctx.fill();
  ctx.strokeStyle = enabled ? COLORS.accentLight : 'rgba(246,247,244,0.18)';
  ctx.lineWidth = enabled ? 2 : 1;
  ctx.stroke();

  ctx.fillStyle = enabled ? COLORS.text : COLORS.muted;
  ctx.font = '700 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + 35);
  ctx.font = '600 10px sans-serif';
  ctx.fillText(sublabel, rect.x + rect.w / 2, rect.y + 55);
}

function drawSmallPill(x, y, w, label, value) {
  ctx.fillStyle = 'rgba(8,17,25,0.66)';
  roundRect(ctx, x, y, w, 38, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = 'center';
  ctx.font = '700 9px sans-serif';
  ctx.fillText(label, x + w / 2, y + 14);
  ctx.fillStyle = COLORS.text;
  ctx.font = '700 14px monospace';
  ctx.fillText(String(value), x + w / 2, y + 30);
}

function drawHud() {
  ctx.fillStyle = 'rgba(8,17,25,0.72)';
  roundRect(ctx, 18, 22, 354, 70, 16);
  ctx.fill();

  ctx.fillStyle = COLORS.text;
  ctx.font = '700 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HARBOR LOOP', 32, 47);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '9px sans-serif';
  ctx.fillText('V0.6.1 · SPEED CURVE', 32, 66);

  ctx.textAlign = 'center';
  ctx.fillStyle = player.combo > 0 ? COLORS.accentLight : COLORS.text;
  ctx.font = '900 27px monospace';
  ctx.fillText(`x${player.combo}`, 205, 53);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '9px sans-serif';
  ctx.fillText('COMBO', 205, 69);

  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.text;
  ctx.font = '700 18px monospace';
  ctx.fillText(String(Math.round(player.speed)), 354, 48);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '9px sans-serif';
  ctx.fillText('SPEED', 354, 66);

  ctx.fillStyle = 'rgba(84,217,209,0.90)';
  roundRect(ctx, 92, 102, 206, 29, 11);
  ctx.fill();
  ctx.fillStyle = '#10272B';
  ctx.textAlign = 'center';
  ctx.font = '700 10px sans-serif';
  ctx.fillText('← / →  INSTANT SWITCH · PASS TO SPEED UP', 195, 121);

  drawSmallPill(18, 689, 104, 'PASSES', player.totalPasses);
  drawSmallPill(268, 689, 104, 'BEST COMBO', player.bestCombo);

  ctx.fillStyle = 'rgba(8,17,25,0.78)';
  roundRect(ctx, RESTART_BUTTON.x, RESTART_BUTTON.y, RESTART_BUTTON.w, RESTART_BUTTON.h, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(246,247,244,0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COLORS.text;
  ctx.font = '700 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RESTART · R', RESTART_BUTTON.x + RESTART_BUTTON.w / 2, RESTART_BUTTON.y + 24);

  const leftEnabled = laneInputStateAllows() && player.lane < LANE_COUNT - 1;
  const rightEnabled = laneInputStateAllows() && player.lane > 0;
  drawButton(LEFT_BUTTON, '←', 'ARROW LEFT / A', leftEnabled);
  drawButton(RIGHT_BUTTON, '→', 'ARROW RIGHT / D', rightEnabled);

  if (player.passPopElapsed < 0.42) {
    const t = player.passPopElapsed / 0.42;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.translate(0, -t * 18);
    ctx.fillStyle = COLORS.accentLight;
    ctx.font = '900 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`+1  x${player.combo}`, 195, 370);
    ctx.restore();
  }

  if (player.state === 'CRASHED') {
    ctx.fillStyle = 'rgba(255,79,82,0.94)';
    roundRect(ctx, 103, 385, 184, 62, 17);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 23px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRASH!', 195, 414);
    ctx.font = '700 10px sans-serif';
    ctx.fillText('COMBO RESET', 195, 434);
  }
}

let lastTime = Date.now();

function frame(nowValue) {
  const now = typeof nowValue === 'number' ? nowValue : Date.now();
  const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;

  updateAi(dt);
  updatePlayer(dt);
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
  ctx.restore();

  scheduleFrame(frame);
}

const scheduleFrame = typeof requestAnimationFrame === 'function'
  ? requestAnimationFrame
  : (callback) => setTimeout(() => callback(Date.now()), 16);

resetGame();
installInput();
scheduleFrame(frame);
