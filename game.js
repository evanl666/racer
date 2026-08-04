/**
 * Harbor Loop — WeChat Mini Game prototype v0.8.1.
 *
 * Scope:
 * - One extra-long, smooth, non-crossing six-lane top-down circuit.
 * - Instant left/right lane switching anywhere on the track.
 * - Fourteen slower black AI cars with readable lane changes.
 * - AI lane changes are blocked inside a speed-scaled player safety zone.
 * - Overtake -> combo +1 -> player speed increases.
 * - Collision -> speed 0, combo reset, flash, recover to base speed.
 * - Minimal HUD: only corner combo; invisible left/right touch zones.
 * - Robust keyboard focus and key handling for browser testing.
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
  water: '#163D52',
  waterDeep: '#102F42',
  waterLine: 'rgba(255,255,255,0.045)',
  land: '#A8BE79',
  landLight: '#C0CF91',
  landDark: '#7F995F',
  roadShadow: 'rgba(5,14,20,0.48)',
  roadEdge: '#20282D',
  curbLight: '#F1E9D7',
  curbRed: '#D86A59',
  road: '#626D73',
  roadHighlight: 'rgba(255,255,255,0.045)',
  lane: 'rgba(246,242,226,0.55)',
  player: '#F05A47',
  playerLight: '#FF8D73',
  playerStripe: '#FFF4D8',
  window: '#C8EDF1',
  ai: '#161B1E',
  aiLight: '#31383C',
  aiWindow: '#69777D',
  text: '#F7F4EA',
  muted: 'rgba(247,244,234,0.66)',
  accent: '#57D5CB',
  accentLight: '#C5FFF7',
  button: 'rgba(8,17,25,0.82)',
  buttonActive: 'rgba(87,213,203,0.30)',
  buttonDisabled: 'rgba(8,17,25,0.42)'
};

const LANE_COUNT = 6;
const LANE_GAP = 8.2;
const ROAD_HALF_WIDTH = 27.0;
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
const AI_WARNING_DURATION = 0.16;
const AI_CHANGE_DURATION = 0.20;
const AI_MIN_DECISION_DELAY = 0.85;
const AI_MAX_DECISION_DELAY = 2.35;
const MAX_SIMULTANEOUS_AI_ACTIONS = 2;
const AI_LANE_CLEAR_DISTANCE = 28;
const AI_PLAYER_BASE_SAFETY_DISTANCE = 46;
const AI_PLAYER_MAX_SAFETY_DISTANCE = 145;
const AI_PLAYER_SAFETY_PER_SPEED = 0.50;
const AI_PLAYER_REAR_SAFETY_DISTANCE = 24;
const COLLISION_PATH_DISTANCE = 11.5;
const COLLISION_LANE_DISTANCE = 0.48;


// Long Bay Circuit: an original folded circuit built from exact lines and arcs.
// Six long straights and five broad hairpins produce a route that is substantially
// longer than V0.7.x while remaining smooth, non-crossing and easy to read.
function buildLongBayCircuit() {
  const points = [];

  function pushPoint(x, y) {
    const last = points[points.length - 1];
    if (!last || Math.hypot(last.x - x, last.y - y) > 0.01) points.push({ x, y });
  }

  function lineTo(x, y, spacing = 3.0) {
    const start = points[points.length - 1];
    const length = Math.hypot(x - start.x, y - start.y);
    const count = Math.max(1, Math.ceil(length / spacing));
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      pushPoint(start.x + (x - start.x) * t, start.y + (y - start.y) * t);
    }
  }

  function arcTo(cx, cy, radius, startAngle, endAngle, spacing = 2.6) {
    const sweep = endAngle - startAngle;
    const length = Math.abs(sweep) * radius;
    const count = Math.max(8, Math.ceil(length / spacing));
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      const angle = startAngle + sweep * t;
      pushPoint(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    }
  }

  // Eight long horizontal runs use nearly the full portrait screen. The alternating
  // broad hairpins keep the route readable and smooth without any crossings.
  pushPoint(110, 70);
  lineTo(310, 70);
  arcTo(310, 115, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(160, 160);
  arcTo(160, 205, 45, -Math.PI / 2, -3 * Math.PI / 2);
  lineTo(310, 250);
  arcTo(310, 295, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(160, 340);
  arcTo(160, 385, 45, -Math.PI / 2, -3 * Math.PI / 2);
  lineTo(310, 430);
  arcTo(310, 475, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(160, 520);
  arcTo(160, 565, 45, -Math.PI / 2, -3 * Math.PI / 2);
  lineTo(310, 610);
  arcTo(310, 655, 45, -Math.PI / 2, Math.PI / 2);
  lineTo(110, 700);

  // Outer return line closes the folded circuit while staying separated from the
  // inner hairpins by a narrow water channel.
  arcTo(110, 640, 60, Math.PI / 2, Math.PI);
  lineTo(50, 130);
  arcTo(110, 130, 60, Math.PI, 3 * Math.PI / 2);

  if (points.length > 1 && Math.hypot(
    points[points.length - 1].x - points[0].x,
    points[points.length - 1].y - points[0].y
  ) < 0.1) points.pop();

  return points;
}

const centerPath = buildLongBayCircuit();

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

function pathAtOffset(offset) {
  return centerPath.map((p, i) => {
    const prev = centerPath[(i - 1 + centerPath.length) % centerPath.length];
    const next = centerPath[(i + 1) % centerPath.length];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return { x: p.x + nx * offset, y: p.y + ny * offset };
  });
}

function pathForLane(laneIndex) {
  const laneOffset = (laneIndex - (LANE_COUNT - 1) / 2) * LANE_GAP;
  return pathAtOffset(laneOffset);
}

// Five separators create six actual lanes. Cars run between these lines.
const laneDividerPaths = Array.from({ length: LANE_COUNT - 1 }, (_, i) => pathForLane(i + 0.5));
const outerRoadEdgePath = pathAtOffset(ROAD_HALF_WIDTH - 1.8);
const innerRoadEdgePath = pathAtOffset(-ROAD_HALF_WIDTH + 1.8);

function strokeClosedPath(points, width, color, dash = []) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
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

function drawTree(x, y, size = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(13,35,30,0.22)';
  ctx.beginPath(); ctx.ellipse(2, 4, 9 * size, 5 * size, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5C7E48';
  ctx.beginPath(); ctx.arc(-3 * size, 0, 6.5 * size, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#739556';
  ctx.beginPath(); ctx.arc(3 * size, -2 * size, 7 * size, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#94AD69';
  ctx.beginPath(); ctx.arc(0, -6 * size, 5.5 * size, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawUmbrella(x, y, size = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(7,21,28,0.20)';
  ctx.beginPath(); ctx.ellipse(2, 5, 9 * size, 4 * size, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#6B5140'; ctx.lineWidth = 1.3 * size;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 8 * size); ctx.stroke();
  const colors = ['#F2E7C9', '#E9864F', '#F2E7C9', '#E9864F'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 9 * size, i * Math.PI / 2, (i + 1) * Math.PI / 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, DESIGN_H);
  gradient.addColorStop(0, COLORS.waterDeep);
  gradient.addColorStop(0.55, COLORS.water);
  gradient.addColorStop(1, '#12364A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

  ctx.strokeStyle = COLORS.waterLine;
  ctx.lineWidth = 1;
  for (let y = 102; y < 690; y += 20) {
    ctx.beginPath();
    for (let x = 0; x <= DESIGN_W; x += 18) {
      const yy = y + Math.sin((x + y) * 0.038) * 1.7;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // Slim miniature park medians sit between the long straights. Their low detail
  // keeps the track readable while giving the circuit a deliberate toy-city identity.
  const medians = [
    [178, 111, 113, 16],
    [178, 201, 113, 16],
    [178, 291, 113, 16],
    [178, 381, 113, 16],
    [178, 471, 113, 16],
    [178, 561, 113, 16],
    [178, 651, 113, 16]
  ];
  for (let i = 0; i < medians.length; i++) {
    const [x, y, w, h] = medians[i];
    ctx.fillStyle = COLORS.landDark;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? COLORS.land : COLORS.landLight;
    roundRect(ctx, x, y, w, h, 9);
    ctx.fill();
  }

  drawTree(194, 119, 0.40); drawUmbrella(242, 119, 0.38);
  drawTree(265, 209, 0.38); drawTree(205, 299, 0.40);
  drawUmbrella(252, 389, 0.38); drawTree(204, 479, 0.40);
  drawTree(265, 569, 0.38); drawUmbrella(220, 659, 0.38);

  // A few distant buoys fill negative space without competing with cars.
  for (const [x, y] of [[26, 128], [365, 250], [25, 628], [366, 650]]) {
    ctx.fillStyle = 'rgba(240,231,204,0.75)';
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232,112,79,0.85)';
    ctx.beginPath(); ctx.arc(x, y - 2.8, 1.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCurbs(path, phase = 0) {
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineWidth = 4.6;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const band = Math.floor((arc.cumulative[i] + phase) / 16);
    ctx.strokeStyle = band % 2 === 0 ? COLORS.curbLight : COLORS.curbRed;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTrack() {
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 + 12, COLORS.roadShadow);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 + 7, COLORS.roadEdge);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 + 2, COLORS.curbLight);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 - 2, COLORS.road);
  strokeClosedPath(centerPath, ROAD_HALF_WIDTH * 2 - 9, COLORS.roadHighlight);

  drawCurbs(outerRoadEdgePath, 0);
  drawCurbs(innerRoadEdgePath, 8);

  for (const dividerPath of laneDividerPaths) {
    strokeClosedPath(dividerPath, 1.15, COLORS.lane, [6, 5]);
  }

  const sf = sampleAtDistance(0, (LANE_COUNT - 1) / 2);
  ctx.save();
  ctx.translate(sf.x, sf.y);
  ctx.rotate(sf.angle);
  for (let i = -3; i <= 2; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#F5F0E2' : '#242A2E';
    ctx.fillRect(-2.2, i * 9, 4.4, 9);
    ctx.fillStyle = i % 2 === 0 ? '#242A2E' : '#F5F0E2';
    ctx.fillRect(2.2, i * 9, 4.4, 9);
  }
  ctx.restore();
}

function drawVehicle(distance, laneIndex, style, alpha = 1, indicatorDirection = 0, indicatorOn = false) {
  const p = sampleAtDistance(distance, laneIndex);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1.8;

  ctx.fillStyle = style.body;
  roundRect(ctx, -7.8, -4.0, 15.6, 8.0, 2.8);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = style.cabin;
  roundRect(ctx, -2.7, -3.05, 6.9, 6.1, 1.9);
  ctx.fill();

  ctx.fillStyle = style.window;
  roundRect(ctx, -1.35, -2.3, 4.2, 4.6, 1.2);
  ctx.fill();

  if (style.stripe) {
    ctx.fillStyle = style.stripe;
    roundRect(ctx, -6.7, -0.55, 10.6, 1.1, 0.55);
    ctx.fill();
  }

  ctx.fillStyle = style.lights;
  ctx.fillRect(6.15, -2.75, 1.15, 1.8);
  ctx.fillRect(6.15, 0.95, 1.15, 1.8);

  if (indicatorDirection !== 0 && indicatorOn) {
    ctx.fillStyle = '#FFD55C';
    const indicatorY = indicatorDirection > 0 ? 3.65 : -4.85;
    ctx.fillRect(2.8, indicatorY, 3.2, 1.4);
    ctx.fillRect(-5.5, indicatorY, 2.6, 1.4);
  }
  ctx.restore();
}

const PLAYER_STYLE = {
  body: COLORS.player,
  cabin: COLORS.playerLight,
  window: COLORS.window,
  lights: '#FFE6A4',
  stripe: COLORS.playerStripe
};

const AI_STYLE = {
  body: COLORS.ai,
  cabin: COLORS.aiLight,
  window: COLORS.aiWindow,
  lights: '#C5D3D8',
  stripe: null
};

const AI_BLUEPRINTS = [
  { fraction: 0.07, lane: 0, speed: 84 },
  { fraction: 0.39, lane: 0, speed: 88 },
  { fraction: 0.72, lane: 0, speed: 86 },
  { fraction: 0.16, lane: 1, speed: 92 },
  { fraction: 0.50, lane: 1, speed: 96 },
  { fraction: 0.84, lane: 1, speed: 94 },
  { fraction: 0.25, lane: 2, speed: 98 },
  { fraction: 0.59, lane: 2, speed: 103 },
  { fraction: 0.92, lane: 2, speed: 100 },
  { fraction: 0.10, lane: 3, speed: 104 },
  { fraction: 0.44, lane: 3, speed: 109 },
  { fraction: 0.77, lane: 3, speed: 106 },
  { fraction: 0.20, lane: 4, speed: 110 },
  { fraction: 0.54, lane: 4, speed: 114 },
  { fraction: 0.88, lane: 4, speed: 112 },
  { fraction: 0.31, lane: 5, speed: 116 },
  { fraction: 0.64, lane: 5, speed: 120 },
  { fraction: 0.97, lane: 5, speed: 118 }
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

  aiCars = AI_BLUEPRINTS.map((blueprint, index) => {
    const distance = arc.total * blueprint.fraction;
    return {
      id: index,
      distance,
      lane: blueprint.lane,
      visualLane: blueprint.lane,
      laneFrom: blueprint.lane,
      laneTo: blueprint.lane,
      baseSpeed: blueprint.speed,
      speed: blueprint.speed,
      state: 'IDLE', // IDLE | WARNING | CHANGING
      stateElapsed: 0,
      direction: 0,
      decisionTimer: AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY),
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

function inputAtScreenPoint(screenX, screenY) {
  const x = (screenX - offsetX) / scale;
  // Invisible full-screen touch zones replace the visible arrow buttons.
  if (x < DESIGN_W * 0.5) requestLaneChange(+1);
  else requestLaneChange(-1);
}

function handleKeyboardInput(event) {
  const key = String(event.key || '').toLowerCase();
  const code = String(event.code || '');
  const keyCode = Number(event.keyCode || event.which || 0);
  let handled = false;

  if (key === 'arrowleft' || key === 'left' || key === 'a' ||
      code === 'ArrowLeft' || code === 'KeyA' || keyCode === 37 || keyCode === 65) {
    requestLaneChange(+1);
    handled = true;
  } else if (key === 'arrowright' || key === 'right' || key === 'd' ||
             code === 'ArrowRight' || code === 'KeyD' || keyCode === 39 || keyCode === 68) {
    requestLaneChange(-1);
    handled = true;
  } else if (key === 'r' || code === 'KeyR' || keyCode === 82) {
    resetGame();
    handled = true;
  }

  if (handled && typeof event.preventDefault === 'function') event.preventDefault();
}

function installInput() {
  if (typeof wx.onTouchStart === 'function') {
    wx.onTouchStart((event) => {
      const touch = event.touches && event.touches[0];
      if (touch) inputAtScreenPoint(touch.clientX, touch.clientY);
    });
  }

  if (canvas && typeof canvas.addEventListener === 'function') {
    // A focusable canvas makes browser keyboard testing reliable, including after a click.
    if (typeof canvas.setAttribute === 'function') canvas.setAttribute('tabindex', '0');
    canvas.tabIndex = 0;

    canvas.addEventListener('pointerdown', (event) => {
      if (typeof canvas.focus === 'function') canvas.focus({ preventScroll: true });
      const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: VIEW_W, height: VIEW_H };
      const localX = (event.clientX - rect.left) * VIEW_W / Math.max(1, rect.width);
      const localY = (event.clientY - rect.top) * VIEW_H / Math.max(1, rect.height);
      inputAtScreenPoint(localX, localY);
    });

    if (typeof canvas.focus === 'function') {
      setTimeout(() => canvas.focus({ preventScroll: true }), 0);
    }
  }

  // Capture on window so arrow keys work even if another non-input element has focus.
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('keydown', handleKeyboardInput, { capture: true, passive: false });
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

function forwardPathDistance(fromDistance, toDistance) {
  return wrapDistance(toDistance - fromDistance);
}

// At base speed, AI cars keep a modest no-lane-change zone in front of the player.
// As the red car accelerates, this zone grows so high-speed runs remain readable and fair.
function currentAiPlayerSafetyDistance() {
  const speedExtra = Math.max(0, player.speed - PLAYER_BASE_SPEED) * AI_PLAYER_SAFETY_PER_SPEED;
  return Math.min(AI_PLAYER_MAX_SAFETY_DISTANCE, AI_PLAYER_BASE_SAFETY_DISTANCE + speedExtra);
}

function playerIsApproachingAi(car) {
  const playerToCar = forwardPathDistance(player.distance, car.distance);
  if (playerToCar > 0.1 && playerToCar < currentAiPlayerSafetyDistance()) return true;

  // Also avoid starting a lane change immediately behind a player who has just passed.
  const carToPlayer = forwardPathDistance(car.distance, player.distance);
  return carToPlayer > 0.1 && carToPlayer < AI_PLAYER_REAR_SAFETY_DISTANCE;
}

function countActiveAiLaneChanges() {
  let count = 0;
  for (const car of aiCars) {
    if (car.state === 'WARNING' || car.state === 'CHANGING') count += 1;
  }
  return count;
}

function nearestAiAhead(car, lane, maxDistance = 90) {
  let nearest = null;
  let nearestDistance = maxDistance;
  for (const other of aiCars) {
    if (other === car || Math.abs(other.visualLane - lane) > 0.55) continue;
    const distance = forwardPathDistance(car.distance, other.distance);
    if (distance > 0.1 && distance < nearestDistance) {
      nearest = other;
      nearestDistance = distance;
    }
  }
  return nearest ? { car: nearest, distance: nearestDistance } : null;
}

function isAiTargetLaneClear(car, targetLane) {
  for (const other of aiCars) {
    if (other === car || Math.abs(other.visualLane - targetLane) > 0.62) continue;
    if (circularDistance(car.distance, other.distance) < AI_LANE_CLEAR_DISTANCE) return false;
  }

  if (Math.abs(player.visualLane - targetLane) < 0.72 &&
      circularDistance(car.distance, player.distance) < currentAiPlayerSafetyDistance()) {
    return false;
  }
  return true;
}

function shuffledDirections() {
  return Math.random() < 0.5 ? [-1, 1] : [1, -1];
}

function tryBeginAiLaneChange(car) {
  if (countActiveAiLaneChanges() >= MAX_SIMULTANEOUS_AI_ACTIONS) return false;
  if (playerIsApproachingAi(car)) return false;

  const ahead = nearestAiAhead(car, car.visualLane, 62);
  const needsToPass = Boolean(ahead && ahead.car.speed + 2 < car.baseSpeed && ahead.distance < 46);
  if (!needsToPass && Math.random() > 0.34) return false;

  const directions = shuffledDirections();
  for (const direction of directions) {
    const targetLane = car.lane + direction;
    if (targetLane < 0 || targetLane >= LANE_COUNT) continue;
    if (!isAiTargetLaneClear(car, targetLane)) continue;

    car.state = 'WARNING';
    car.stateElapsed = 0;
    car.direction = direction;
    car.laneFrom = car.visualLane;
    car.laneTo = targetLane;
    return true;
  }
  return false;
}

function updateAi(dt) {
  for (const car of aiCars) {
    car.decisionTimer -= dt;

    if (car.state === 'IDLE' && car.decisionTimer <= 0) {
      car.decisionTimer = AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY);
      tryBeginAiLaneChange(car);
    } else if (car.state === 'WARNING') {
      car.stateElapsed += dt;
      if (playerIsApproachingAi(car) || !isAiTargetLaneClear(car, car.laneTo)) {
        car.state = 'IDLE';
        car.stateElapsed = 0;
        car.direction = 0;
        car.decisionTimer = 0.55 + Math.random() * 0.75;
      } else if (car.stateElapsed >= AI_WARNING_DURATION) {
        car.state = 'CHANGING';
        car.stateElapsed = 0;
        car.laneFrom = car.visualLane;
        car.lane = car.laneTo;
      }
    } else if (car.state === 'CHANGING') {
      car.stateElapsed += dt;
      const t = Math.min(1, car.stateElapsed / AI_CHANGE_DURATION);
      const eased = t * t * (3 - 2 * t);
      car.visualLane = car.laneFrom + (car.laneTo - car.laneFrom) * eased;
      if (t >= 1) {
        car.visualLane = car.laneTo;
        car.lane = car.laneTo;
        car.state = 'IDLE';
        car.stateElapsed = 0;
        car.direction = 0;
        car.decisionTimer = 0.9 + Math.random() * 1.5;
      }
    }

    // Simple traffic following prevents faster AI cars from visually stacking.
    const ahead = nearestAiAhead(car, car.visualLane, 34);
    let desiredSpeed = car.baseSpeed;
    if (ahead && ahead.distance < 24) desiredSpeed = Math.min(desiredSpeed, ahead.car.speed * 0.96);
    const response = Math.min(1, dt * 4.5);
    car.speed += (desiredSpeed - car.speed) * response;
    car.distance += car.speed * dt;
  }
}

function detectCollisions() {
  if (player.invincible > 0 || player.state === 'CRASHED') return false;

  for (const car of aiCars) {
    const laneDistance = Math.abs(player.visualLane - car.visualLane);
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

function drawAiCar(car) {
  const indicatorOn = car.state === 'WARNING' && Math.floor(car.stateElapsed * 30) % 2 === 0;
  drawVehicle(car.distance, car.visualLane, AI_STYLE, 1, car.direction, indicatorOn);
}

function playerAlpha() {
  if (player.invincible > 0) return Math.floor(player.invincible * 12) % 2 === 0 ? 0.25 : 1;
  return 1;
}

function drawCars() {
  for (const car of aiCars) drawAiCar(car);
  drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, playerAlpha());
}

function drawHud() {
  // Keep the track unobstructed: only a compact combo readout remains in one corner.
  ctx.fillStyle = 'rgba(8,17,25,0.66)';
  roundRect(ctx, 12, 12, 68, 42, 13);
  ctx.fill();
  ctx.fillStyle = player.combo > 0 ? COLORS.accentLight : COLORS.text;
  ctx.font = '900 25px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`x${player.combo}`, 46, 40);

  if (player.state === 'CRASHED') {
    ctx.fillStyle = 'rgba(255,79,82,0.92)';
    roundRect(ctx, 122, 390, 146, 54, 16);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 21px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRASH!', 195, 420);
    ctx.font = '700 9px sans-serif';
    ctx.fillText('COMBO RESET', 195, 437);
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
