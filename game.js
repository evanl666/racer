/**
 * Harbor Loop — WeChat Mini Game prototype v0.9.6.
 *
 * Scope:
 * - One extra-long, smooth, non-crossing six-lane top-down circuit.
 * - Instant left/right lane switching anywhere on the track.
 * - Twenty-one slower black AI cars with readable lane changes.
 * - AI lane changes are blocked inside a speed-scaled player safety zone.
 * - Overtake -> combo +1; every ten overtakes triggers a permanent speed tier.
 * - Collision -> speed 0, combo reset, flash, recover to base speed.
 * - Minimal HUD: only corner combo; invisible left/right touch zones.
 * - Robust keyboard focus and key handling for browser testing.
 * - Hold Up / W / Space for throttle; release to coast back to cruise speed.
 * - Engine RPM and real road speed step up every ten overtakes.
 * - Procedural engine, lane-change and overtake audio via WebAudio.
 * - Optional local-only looping background music for private gameplay testing.
 * - Speed-scaled motion afterimages for the player and subtle high-speed AI ghosts.
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
const PLAYER_CRUISE_BASE_SPEED = 125;

// Speed is now deliberately stepped, not spread across every overtake.
// x70 reaches a true high-speed state: 515 while coasting and 600 at full throttle.
// The last entry is the cap for x100 and above.
const SPEED_TIER_CRUISE = [125, 180, 240, 305, 365, 420, 470, 515, 555, 590, 620];
const SPEED_TIER_THROTTLE = [175, 240, 310, 380, 445, 505, 555, 600, 640, 675, 705];
const PLAYER_MAX_SPEED = SPEED_TIER_THROTTLE[SPEED_TIER_THROTTLE.length - 1];
const PLAYER_ACCELERATION = 112;
const PLAYER_TIER_ACCELERATION = 165;
const PLAYER_COAST_DECELERATION = 42;
const PLAYER_TIER_BOOST_DURATION = 0.72;
const CHANGE_DURATION = 0.05;
const AI_WARNING_DURATION = 0.16;
const AI_CHANGE_DURATION = 0.20;
const AI_MIN_DECISION_DELAY = 0.85;
const AI_MAX_DECISION_DELAY = 2.35;
const MAX_SIMULTANEOUS_AI_ACTIONS = 2;
const AI_LANE_CLEAR_DISTANCE = 32;
const AI_PLAYER_BASE_SAFETY_DISTANCE = 50;
const AI_PLAYER_MAX_SAFETY_DISTANCE = 265;
const AI_PLAYER_SAFETY_PER_SPEED = 0.39;
const AI_PLAYER_REAR_SAFETY_DISTANCE = 30;
const COLLISION_PATH_DISTANCE = 11.5;
const COLLISION_LANE_DISTANCE = 0.48;

// Motion trails stay invisible at opening speed, then build progressively as the
// red car enters the high-speed tiers. History-based samples preserve the real
// curve and lane-change path instead of drawing a straight fake blur.
const PLAYER_TRAIL_START_SPEED = 215;
const PLAYER_TRAIL_FULL_SPEED = 590;
const PLAYER_TRAIL_MAX_COPIES = 5;
const AI_TRAIL_PLAYER_SPEED_START = 430;
const MOTION_TRAIL_MAX_AGE = 0.16;
const MOTION_TRAIL_MAX_SAMPLES = 10;


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

function locateCenterSegment(distance) {
  const d = wrapDistance(distance);
  let lo = 0;
  let hi = centerPath.length;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (arc.cumulative[mid] <= d) lo = mid;
    else hi = mid;
  }

  const i = Math.min(lo, centerPath.length - 1);
  const segmentStart = arc.cumulative[i];
  const segmentLength = Math.max(0.0001, arc.cumulative[i + 1] - segmentStart);
  return {
    i,
    t: (d - segmentStart) / segmentLength,
    segmentLength
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

// Each lane has its own physical arc length. Vehicles still keep an unwrapped
// center-line station for collision/overtake logic, but movement consumes actual
// road distance segment-by-segment on the current (possibly fractional) lane.
// This avoids both outer-lane and inner-lane speed spikes at straight/curve joins.
const laneCenterPaths = Array.from({ length: LANE_COUNT }, (_, lane) => pathForLane(lane));

function laneBounds(laneIndex) {
  const clamped = Math.max(0, Math.min(LANE_COUNT - 1, laneIndex));
  const lower = Math.floor(clamped);
  const upper = Math.ceil(clamped);
  return { lower, upper, blend: clamped - lower };
}

function interpolatedLanePoint(pointIndex, laneIndex) {
  const lanes = laneBounds(laneIndex);
  const low = laneCenterPaths[lanes.lower][pointIndex];
  const high = laneCenterPaths[lanes.upper][pointIndex];
  return {
    x: low.x + (high.x - low.x) * lanes.blend,
    y: low.y + (high.y - low.y) * lanes.blend
  };
}

function laneSegmentLength(segmentIndex, laneIndex) {
  const a = interpolatedLanePoint(segmentIndex, laneIndex);
  const b = interpolatedLanePoint((segmentIndex + 1) % centerPath.length, laneIndex);
  return Math.max(0.0001, Math.hypot(b.x - a.x, b.y - a.y));
}

function sampleAtDistance(distance, laneIndex) {
  const station = locateCenterSegment(distance);
  const a = interpolatedLanePoint(station.i, laneIndex);
  const b = interpolatedLanePoint((station.i + 1) % centerPath.length, laneIndex);
  const x = a.x + (b.x - a.x) * station.t;
  const y = a.y + (b.y - a.y) * station.t;

  return {
    x,
    y,
    angle: Math.atan2(b.y - a.y, b.x - a.x)
  };
}

function advanceDistanceAtRoadSpeed(distance, speed, dt, laneIndex) {
  let currentDistance = distance;
  let remainingRoadDistance = Math.max(0, speed * dt);
  let guard = 0;

  while (remainingRoadDistance > 0.000001 && guard < 128) {
    const station = locateCenterSegment(currentDistance);
    const roadSegmentLength = laneSegmentLength(station.i, laneIndex);
    const roadRemainingInSegment = roadSegmentLength * (1 - station.t);
    const centerRemainingInSegment = station.segmentLength * (1 - station.t);

    // Floating-point values can land microscopically before a segment boundary.
    // Move a negligible amount forward so the binary search selects the next one.
    if (roadRemainingInSegment <= 0.000001 || centerRemainingInSegment <= 0.000001) {
      currentDistance += 0.000001;
      guard += 1;
      continue;
    }

    if (remainingRoadDistance < roadRemainingInSegment) {
      currentDistance += station.segmentLength * (remainingRoadDistance / roadSegmentLength);
      remainingRoadDistance = 0;
    } else {
      currentDistance += centerRemainingInSegment;
      remainingRoadDistance -= roadRemainingInSegment;
    }

    guard += 1;
  }

  return currentDistance;
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

function drawVehicleGhost(distance, laneIndex, style, alpha, stretch = 0) {
  if (alpha <= 0.001) return;
  const p = sampleAtDistance(distance, laneIndex);
  const extraLength = 4.8 * stretch;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // A simplified body silhouette reads as speed without making every old copy
  // look like another solid car. It is stretched only along the travel axis.
  ctx.fillStyle = style.body;
  roundRect(ctx, -7.8 - extraLength, -3.7, 15.6 + extraLength, 7.4, 2.7);
  ctx.fill();

  ctx.fillStyle = style.cabin;
  roundRect(ctx, -3.0, -2.7, 6.3, 5.4, 1.7);
  ctx.fill();

  if (style.stripe) {
    ctx.fillStyle = style.stripe;
    roundRect(ctx, -6.7 - extraLength * 0.45, -0.45, 10.4 + extraLength * 0.45, 0.9, 0.45);
    ctx.fill();
  }
  ctx.restore();
}

function drawMotionTrail(samples, style, strength, maxCopies, alphaScale) {
  if (!samples || samples.length === 0 || strength <= 0.01) return;
  const copies = Math.min(
    maxCopies,
    samples.length,
    Math.max(1, Math.ceil(strength * maxCopies))
  );

  // Draw the oldest copy first. At high speed each successive frame naturally
  // sits farther apart, so the trail length scales with actual road speed.
  for (let copy = copies - 1; copy >= 0; copy--) {
    const sampleIndex = Math.min(samples.length - 1, copy + 1);
    const sample = samples[sampleIndex];
    const ageFade = 1 - clamp(sample.age / MOTION_TRAIL_MAX_AGE, 0, 1);
    const copyFade = 1 - copy / Math.max(1, copies + 0.5);
    const alpha = alphaScale * strength * ageFade * copyFade;
    drawVehicleGhost(sample.distance, sample.visualLane, style, alpha, strength);
  }
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

// Procedural engine/effect audio remains generated at runtime. The optional test
// BGM is loaded from assets/local/test_bgm.mp3, which is intentionally ignored by
// Git and may be absent in a public checkout without affecting gameplay.
// WeChat Mini Game uses wx.createWebAudioContext when available; browser preview
// falls back to the standard AudioContext implementation supplied by index.html.
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createCompatibleAudioContext() {
  if (typeof wx !== 'undefined' && typeof wx.createWebAudioContext === 'function') {
    try { return wx.createWebAudioContext(); } catch (error) { /* fallback below */ }
  }

  if (typeof globalThis !== 'undefined') {
    const BrowserAudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (BrowserAudioContext) {
      try { return new BrowserAudioContext(); } catch (error) { /* sound stays disabled */ }
    }
  }
  return null;
}

function setAudioParam(param, value) {
  if (!param) return;
  try { param.value = value; } catch (error) { /* unsupported audio parameter */ }
}

function safelyStartNode(node) {
  if (!node || typeof node.start !== 'function') return;
  try { node.start(0); } catch (error) { /* already started or unsupported */ }
}

function safelyStopNode(node) {
  if (!node) return;
  if (typeof node.stop === 'function') {
    try { node.stop(0); } catch (error) { /* already stopped */ }
  }
  if (typeof node.disconnect === 'function') {
    try { node.disconnect(); } catch (error) { /* already disconnected */ }
  }
}

function createLoopingNoiseSource(context) {
  if (!context || typeof context.createBuffer !== 'function' || typeof context.createBufferSource !== 'function') return null;
  try {
    const sampleRate = context.sampleRate || 44100;
    const frameCount = Math.max(1, Math.floor(sampleRate * 1.25));
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < frameCount; index++) {
      // Brown-ish noise creates mechanical texture without a harsh hiss.
      const white = Math.random() * 2 - 1;
      previous = previous * 0.965 + white * 0.035;
      data[index] = previous * 2.4;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  } catch (error) {
    return null;
  }
}


const LOCAL_TEST_BGM_PATH = 'assets/local/test_bgm.mp3';
const LOCAL_TEST_BGM_VOLUME = 0.17;

const backgroundMusic = {
  player: null,
  kind: null,
  attempted: false,
  started: false,
  wanted: true,
  pausedByLifecycle: false,
  disabled: false,

  createPlayer() {
    if (this.player || this.disabled) return this.player;

    // Native WeChat Mini Game path. InnerAudioContext is intended for longer
    // streaming audio such as BGM and supports loop/volume controls.
    if (typeof wx !== 'undefined' && typeof wx.createInnerAudioContext === 'function') {
      try {
        const player = wx.createInnerAudioContext();
        player.src = LOCAL_TEST_BGM_PATH;
        player.loop = true;
        player.autoplay = false;
        player.volume = LOCAL_TEST_BGM_VOLUME;
        if ('obeyMuteSwitch' in player) player.obeyMuteSwitch = true;
        if (typeof player.onPlay === 'function') player.onPlay(() => { this.started = true; });
        if (typeof player.onError === 'function') {
          player.onError(() => {
            // Public Git checkouts intentionally omit the local music file.
            this.disabled = true;
            this.started = false;
          });
        }
        this.player = player;
        this.kind = 'wechat';
        return player;
      } catch (error) { /* browser fallback below */ }
    }

    // Browser preview path. Playback still begins only after a user gesture.
    if (typeof globalThis !== 'undefined' && typeof globalThis.Audio === 'function') {
      try {
        const player = new globalThis.Audio(LOCAL_TEST_BGM_PATH);
        player.loop = true;
        player.preload = 'auto';
        player.volume = LOCAL_TEST_BGM_VOLUME;
        player.addEventListener('play', () => { this.started = true; });
        player.addEventListener('error', () => {
          this.disabled = true;
          this.started = false;
        });
        this.player = player;
        this.kind = 'browser';
        return player;
      } catch (error) { /* music stays disabled */ }
    }

    this.disabled = true;
    return null;
  },

  ensureStarted() {
    if (!this.wanted || this.disabled) return false;
    const player = this.createPlayer();
    if (!player) return false;
    this.attempted = true;

    try {
      const result = player.play();
      if (result && typeof result.then === 'function') {
        result.then(() => { this.started = true; }).catch(() => {
          // A later key/touch gesture can retry if the browser blocked this one.
          this.started = false;
        });
      } else {
        this.started = true;
      }
      return true;
    } catch (error) {
      this.started = false;
      return false;
    }
  },

  toggle() {
    this.wanted = !this.wanted;
    if (this.wanted) {
      this.ensureStarted();
    } else if (this.player && typeof this.player.pause === 'function') {
      try { this.player.pause(); } catch (error) { /* best effort */ }
      this.started = false;
    }
  },

  pauseForLifecycle() {
    if (!this.player || !this.started || typeof this.player.pause !== 'function') return;
    this.pausedByLifecycle = true;
    try { this.player.pause(); } catch (error) { /* best effort */ }
    this.started = false;
  },

  resumeForLifecycle() {
    if (!this.pausedByLifecycle) return;
    this.pausedByLifecycle = false;
    if (this.wanted) this.ensureStarted();
  }
};

function ensureGameAudioStarted() {
  audio.ensureStarted();
  backgroundMusic.ensureStarted();
}

const audio = {
  context: null,
  started: false,
  disabled: false,
  masterGain: null,
  engineGain: null,
  engineLowGain: null,
  engineFilter: null,
  engineHighPass: null,
  engineLow: null,
  engineMid: null,
  engineHigh: null,
  engineMidGain: null,
  engineHighGain: null,
  engineNoise: null,
  engineNoiseFilter: null,
  engineNoiseGain: null,
  smoothEngineFrequency: 80,
  smoothEngineVolume: 0,
  smoothThrottle: 0,
  enginePulsePhase: 0,
  effectDuck: 0,
  voices: [],

  ensureStarted() {
    if (this.disabled) return false;

    if (!this.context) {
      this.context = createCompatibleAudioContext();
      if (!this.context) {
        this.disabled = true;
        return false;
      }
    }

    if (this.context.state === 'suspended' && typeof this.context.resume === 'function') {
      try {
        const resumeResult = this.context.resume();
        if (resumeResult && typeof resumeResult.catch === 'function') resumeResult.catch(() => {});
      } catch (error) { /* a later user gesture can retry */ }
    }

    if (!this.started) {
      try {
        this.masterGain = this.context.createGain();
        this.engineGain = this.context.createGain();
        this.engineLowGain = this.context.createGain();
        this.engineMidGain = this.context.createGain();
        this.engineHighGain = this.context.createGain();
        this.engineNoiseGain = this.context.createGain();
        this.engineFilter = this.context.createBiquadFilter();
        this.engineHighPass = this.context.createBiquadFilter();
        this.engineNoiseFilter = this.context.createBiquadFilter();
        this.engineLow = this.context.createOscillator();
        this.engineMid = this.context.createOscillator();
        this.engineHigh = this.context.createOscillator();
        this.engineNoise = createLoopingNoiseSource(this.context);

        setAudioParam(this.masterGain.gain, 0.46);
        setAudioParam(this.engineGain.gain, 0.0001);
        setAudioParam(this.engineLowGain.gain, 0.34);
        setAudioParam(this.engineMidGain.gain, 0.086);
        setAudioParam(this.engineHighGain.gain, 0.026);
        setAudioParam(this.engineNoiseGain.gain, 0.0001);

        try { this.engineFilter.type = 'lowpass'; } catch (error) { /* default filter */ }
        setAudioParam(this.engineFilter.frequency, 760);
        setAudioParam(this.engineFilter.Q, 0.82);
        // Trim sub-bass rumble so the engine reads as a faster arcade motor rather
        // than a low idling truck. The low layer remains audible, but no longer
        // dominates the mechanical mid and high harmonics.
        try { this.engineHighPass.type = 'highpass'; } catch (error) { /* default filter */ }
        setAudioParam(this.engineHighPass.frequency, 80);
        setAudioParam(this.engineHighPass.Q, 0.58);
        try { this.engineNoiseFilter.type = 'bandpass'; } catch (error) { /* default filter */ }
        setAudioParam(this.engineNoiseFilter.frequency, 980);
        setAudioParam(this.engineNoiseFilter.Q, 0.92);

        // Three detuned mechanical layers plus filtered noise avoid the single-note
        // synthesizer character of V0.9.3.
        try { this.engineLow.type = 'triangle'; } catch (error) { /* default sine */ }
        try { this.engineMid.type = 'sawtooth'; } catch (error) { /* default sine */ }
        try { this.engineHigh.type = 'triangle'; } catch (error) { /* default sine */ }
        setAudioParam(this.engineLow.frequency, this.smoothEngineFrequency * 1.08);
        setAudioParam(this.engineMid.frequency, this.smoothEngineFrequency * 2.22);
        setAudioParam(this.engineHigh.frequency, this.smoothEngineFrequency * 4.52);

        this.engineLow.connect(this.engineLowGain);
        this.engineLowGain.connect(this.engineFilter);
        this.engineMid.connect(this.engineMidGain);
        this.engineMidGain.connect(this.engineFilter);
        this.engineHigh.connect(this.engineHighGain);
        this.engineHighGain.connect(this.engineFilter);
        if (this.engineNoise) {
          this.engineNoise.connect(this.engineNoiseFilter);
          this.engineNoiseFilter.connect(this.engineNoiseGain);
          this.engineNoiseGain.connect(this.engineGain);
        }
        this.engineFilter.connect(this.engineHighPass);
        this.engineHighPass.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);
        this.masterGain.connect(this.context.destination);

        safelyStartNode(this.engineLow);
        safelyStartNode(this.engineMid);
        safelyStartNode(this.engineHigh);
        safelyStartNode(this.engineNoise);
        this.started = true;
      } catch (error) {
        this.disabled = true;
        this.started = false;
        return false;
      }
    }

    return true;
  },

  addTone(type, duration, startFrequency, endFrequency, volume) {
    if (!this.ensureStarted()) return;
    try {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      try { oscillator.type = type; } catch (error) { /* default sine */ }
      setAudioParam(oscillator.frequency, startFrequency);
      setAudioParam(gain.gain, 0.0001);
      oscillator.connect(gain);
      gain.connect(this.masterGain);
      safelyStartNode(oscillator);
      // Prevent dense combo sequences from building up a harsh wall of tones.
      while (this.voices.length >= 12) {
        const oldest = this.voices.shift();
        safelyStopNode(oldest && oldest.oscillator);
        safelyStopNode(oldest && oldest.gain);
      }
      this.voices.push({
        oscillator,
        gain,
        elapsed: 0,
        duration,
        startFrequency,
        endFrequency,
        volume
      });
    } catch (error) { /* one failed effect must not stop the game */ }
  },

  playLaneChange(direction) {
    // Short, soft downward sweep. Direction changes the starting pitch only
    // slightly, so repeated left/right inputs do not become a pair of loud beeps.
    const directionLift = direction > 0 ? 16 : -16;
    this.effectDuck = Math.max(this.effectDuck, 0.22);
    this.addTone('triangle', 0.065, 330 + directionLift, 205 + directionLift, 0.040);
    this.addTone('sine', 0.045, 510 + directionLift, 350 + directionLift, 0.010);
  },

  playOvertake(combo, count = 1) {
    // The pass tone now rises across the entire live combo. V0.9.5 restarted a
    // ten-note pattern at x10/x20, which sounded like progress had been erased.
    // A gentle continuous slope keeps every pass slightly higher, then caps the
    // range before it becomes piercing during very long combos.
    const passIndex = Math.max(0, combo - 1);
    const semitones = Math.min(17.2, passIndex * 0.28);
    const baseFrequency = Math.min(850, 325 * Math.pow(2, semitones / 12));
    const volume = Math.min(0.062, 0.044 + Math.max(0, count - 1) * 0.006);
    this.effectDuck = Math.max(this.effectDuck, 0.23);
    this.addTone('triangle', 0.068, baseFrequency * 0.965, baseFrequency, volume);
    this.addTone('sine', 0.044, baseFrequency * 1.38, baseFrequency * 1.43, volume * 0.11);
  },

  playSpeedTierUp(tier) {
    // A restrained mechanical surge marks x10/x20/... without becoming a melody.
    const start = Math.min(315, 158 + tier * 12);
    const end = Math.min(455, start * 1.36);
    this.effectDuck = Math.max(this.effectDuck, 0.18);
    this.addTone('sawtooth', 0.145, start, end, 0.036);
    this.addTone('triangle', 0.110, start * 1.95, end * 1.74, 0.018);
  },

  update(dt) {
    if (!this.started || this.disabled) return;

    // RPM has two layers: throttle produces the immediate rise/fall inside a
    // band, while every ten overtakes raises the whole band slightly. Real road
    // speed still changes continuously, but the long-term engine pitch is stepped.
    const tier = currentSpeedTier();
    const tierMultiplier = [1.00, 1.075, 1.15, 1.225, 1.30, 1.375, 1.45, 1.525, 1.595, 1.66, 1.72][tier];

    const throttleTarget = inputState.throttle && player.state !== 'CRASHED' ? 1 : 0;
    const throttleResponse = throttleTarget > this.smoothThrottle ? 8.0 : 4.6;
    this.smoothThrottle += (throttleTarget - this.smoothThrottle) * (1 - Math.exp(-dt * throttleResponse));

    const cruiseSpeed = currentCruiseSpeed();
    const throttleMax = currentThrottleMaxSpeed();
    const speedInsideBand = clamp(
      (player.speed - cruiseSpeed) / Math.max(1, throttleMax - cruiseSpeed),
      0,
      1
    );
    const revAmount = clamp(this.smoothThrottle * 0.74 + speedInsideBand * 0.26, 0, 1);
    let targetFrequency = 80 * tierMultiplier * (1 + revAmount * 0.34);
    if (player.state === 'CRASHED') targetFrequency = 52;
    if (player.state === 'RECOVERING') targetFrequency *= 0.82;

    // About 0.3 s of smoothing makes x10/x20/x30 sound like a change in engine
    // load rather than an abrupt musical note. Throttle itself responds faster.
    const engineResponse = 1 - Math.exp(-dt * 6.6);
    this.smoothEngineFrequency += (targetFrequency - this.smoothEngineFrequency) * engineResponse;

    const speedRatio = clamp(player.speed / PLAYER_MAX_SPEED, 0, 1);
    let targetVolume = 0.016 + tier * 0.0010 + revAmount * 0.010 + speedRatio * 0.012;
    if (player.state === 'CRASHED') targetVolume = 0.0035;
    if (player.state === 'RECOVERING') targetVolume *= 0.72;
    this.smoothEngineVolume += (targetVolume - this.smoothEngineVolume) * (1 - Math.exp(-dt * 8));

    const pulseRate = 9.0 + tier * 0.86 + revAmount * 7.4;
    this.enginePulsePhase = (this.enginePulsePhase + dt * pulseRate) % 1;
    const pulseWave = Math.max(0, Math.sin(this.enginePulsePhase * Math.PI * 2));
    const pulse = 0.82 + Math.pow(pulseWave, 3.2) * 0.18;
    this.effectDuck = Math.max(0, this.effectDuck - dt * 3.6);
    const duck = 1 - this.effectDuck * 0.28;

    setAudioParam(this.engineLow.frequency, this.smoothEngineFrequency * 1.08);
    setAudioParam(this.engineMid.frequency, this.smoothEngineFrequency * (2.20 + revAmount * 0.080));
    setAudioParam(this.engineHigh.frequency, this.smoothEngineFrequency * (4.45 + revAmount * 0.18));
    setAudioParam(this.engineLowGain.gain, 0.30 + (1 - revAmount) * 0.055);
    setAudioParam(this.engineMidGain.gain, 0.078 + revAmount * 0.052 + speedRatio * 0.014);
    setAudioParam(this.engineHighGain.gain, 0.022 + revAmount * 0.030 + speedRatio * 0.008);
    setAudioParam(this.engineGain.gain, this.smoothEngineVolume * pulse * duck);
    setAudioParam(this.engineHighPass.frequency, 80 + tier * 3.0 + revAmount * 24);
    setAudioParam(this.engineFilter.frequency, 620 + tier * 68 + revAmount * 1080 + speedRatio * 430);
    setAudioParam(this.engineNoiseFilter.frequency, 900 + tier * 82 + revAmount * 1180 + speedRatio * 460);
    setAudioParam(this.engineNoiseGain.gain, (0.0025 + revAmount * 0.012 + speedRatio * 0.011) * duck);

    for (let index = this.voices.length - 1; index >= 0; index--) {
      const voice = this.voices[index];
      voice.elapsed += dt;
      const t = clamp(voice.elapsed / voice.duration, 0, 1);
      const attack = Math.min(1, t / 0.10);
      const decay = Math.pow(1 - t, 1.7);
      const envelope = attack * decay;
      const frequency = voice.startFrequency + (voice.endFrequency - voice.startFrequency) * t;
      setAudioParam(voice.oscillator.frequency, frequency);
      setAudioParam(voice.gain.gain, Math.max(0.0001, voice.volume * envelope));

      if (t >= 1) {
        safelyStopNode(voice.oscillator);
        safelyStopNode(voice.gain);
        this.voices.splice(index, 1);
      }
    }
  },

  suspend() {
    if (!this.context || typeof this.context.suspend !== 'function') return;
    try {
      const result = this.context.suspend();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (error) { /* lifecycle best effort */ }
  },

  resume() {
    if (!this.started) return;
    this.ensureStarted();
  }
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
  { fraction: 0.97, lane: 5, speed: 118 },
  // V0.9.5 adds only three cars: enough to make the full-track view feel busier
  // without turning every lane into a continuous wall.
  { fraction: 0.895, lane: 0, speed: 90 },
  { fraction: 0.42, lane: 2, speed: 101 },
  { fraction: 0.71, lane: 4, speed: 113 }
];

const inputState = {
  throttle: false
};

const player = {
  distance: 0,
  lane: 2,
  visualLane: 2,
  laneFrom: 2,
  laneTo: 2,
  laneChangeElapsed: 0,
  speed: PLAYER_CRUISE_BASE_SPEED,
  state: 'NORMAL', // NORMAL | CHANGING_LANE | CRASHED | RECOVERING
  stateElapsed: 0,
  invincible: 0,
  combo: 0,
  bestCombo: 0,
  totalPasses: 0,
  passPopElapsed: 10,
  tierBoostElapsed: 0,
  previousDistance: 0,
  previousVisualLane: 2,
  collisionCount: 0,
  trail: []
};

let aiCars = [];

function resetGame() {
  player.distance = arc.total * 0.03;
  player.lane = 2;
  player.visualLane = 2;
  player.laneFrom = 2;
  player.laneTo = 2;
  player.laneChangeElapsed = 0;
  player.speed = PLAYER_CRUISE_BASE_SPEED;
  inputState.throttle = false;
  player.state = 'NORMAL';
  player.stateElapsed = 0;
  player.invincible = 0;
  player.combo = 0;
  player.bestCombo = 0;
  player.totalPasses = 0;
  player.passPopElapsed = 10;
  player.tierBoostElapsed = 0;
  player.previousDistance = player.distance;
  player.previousVisualLane = player.visualLane;
  player.collisionCount = 0;
  player.trail = [];

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
      previousDistance: distance,
      previousVisualLane: blueprint.lane,
      state: 'IDLE', // IDLE | WARNING | CHANGING
      stateElapsed: 0,
      direction: 0,
      decisionTimer: AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY),
      passIndex: Math.floor((player.distance - distance) / arc.total),
      trail: []
    };
  });
}

function laneInputStateAllows() {
  return player.state !== 'CRASHED';
}

function requestLaneChange(direction) {
  if (!laneInputStateAllows()) return;

  ensureGameAudioStarted();
  const target = Math.max(0, Math.min(LANE_COUNT - 1, player.lane + direction));
  if (target === player.lane) return;

  audio.playLaneChange(direction);
  player.laneFrom = player.visualLane;
  player.laneTo = target;
  player.lane = target;
  player.laneChangeElapsed = 0.0001;
  if (player.state === 'NORMAL' || player.state === 'CHANGING_LANE') {
    player.state = 'CHANGING_LANE';
  }
}

function setThrottle(active) {
  inputState.throttle = Boolean(active);
  if (inputState.throttle) ensureGameAudioStarted();
}

function inputAtScreenPoint(screenX, screenY) {
  const x = (screenX - offsetX) / scale;
  // Invisible full-screen touch zones replace the visible arrow buttons.
  if (x < DESIGN_W * 0.5) requestLaneChange(+1);
  else requestLaneChange(-1);
}

function isThrottleKey(event) {
  const key = String(event.key || '').toLowerCase();
  const code = String(event.code || '');
  const keyCode = Number(event.keyCode || event.which || 0);
  return key === 'arrowup' || key === 'up' || key === 'w' || key === ' ' || key === 'spacebar' ||
    code === 'ArrowUp' || code === 'KeyW' || code === 'Space' ||
    keyCode === 38 || keyCode === 87 || keyCode === 32;
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
  } else if (isThrottleKey(event)) {
    setThrottle(true);
    handled = true;
  } else if (key === 'm' || code === 'KeyM' || keyCode === 77) {
    backgroundMusic.toggle();
    handled = true;
  } else if (key === 'r' || code === 'KeyR' || keyCode === 82) {
    resetGame();
    handled = true;
  }

  if (handled && typeof event.preventDefault === 'function') event.preventDefault();
}

function handleKeyboardRelease(event) {
  if (!isThrottleKey(event)) return;
  setThrottle(false);
  if (typeof event.preventDefault === 'function') event.preventDefault();
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
    window.addEventListener('keyup', handleKeyboardRelease, { capture: true, passive: false });
    window.addEventListener('blur', () => setThrottle(false));
  }
}

function currentSpeedTier(combo = player.combo) {
  return Math.min(SPEED_TIER_CRUISE.length - 1, Math.floor(Math.max(0, combo) / 10));
}

function currentCruiseSpeed() {
  return SPEED_TIER_CRUISE[currentSpeedTier()];
}

function currentThrottleMaxSpeed() {
  return SPEED_TIER_THROTTLE[currentSpeedTier()];
}

function currentTargetSpeed() {
  return inputState.throttle ? currentThrottleMaxSpeed() : currentCruiseSpeed();
}

function moveToward(value, target, maxDelta) {
  if (value < target) return Math.min(target, value + maxDelta);
  if (value > target) return Math.max(target, value - maxDelta);
  return target;
}

function updateMotionTrail(entity, dt, shouldRecord = true) {
  if (!entity.trail) entity.trail = [];

  for (const sample of entity.trail) sample.age += dt;
  entity.trail = entity.trail.filter((sample) => sample.age <= MOTION_TRAIL_MAX_AGE);

  if (!shouldRecord) {
    entity.trail.length = 0;
    return;
  }

  entity.trail.unshift({
    distance: entity.previousDistance,
    visualLane: entity.previousVisualLane,
    age: 0
  });
  if (entity.trail.length > MOTION_TRAIL_MAX_SAMPLES) {
    entity.trail.length = MOTION_TRAIL_MAX_SAMPLES;
  }
}

function beginCollision() {
  if (player.invincible > 0 || player.state === 'CRASHED') return;

  player.state = 'CRASHED';
  player.stateElapsed = 0;
  player.speed = 0;
  player.invincible = 1.25;
  player.combo = 0;
  player.tierBoostElapsed = 0;
  player.collisionCount += 1;
  player.trail.length = 0;

  if (typeof wx.vibrateShort === 'function') {
    try { wx.vibrateShort({ type: 'medium' }); } catch (error) { /* browser/test shim */ }
  }
}

function updatePlayer(dt) {
  player.previousDistance = player.distance;
  player.previousVisualLane = player.visualLane;
  player.invincible = Math.max(0, player.invincible - dt);
  player.tierBoostElapsed = Math.max(0, player.tierBoostElapsed - dt);
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
    player.speed = PLAYER_CRUISE_BASE_SPEED * t;
    if (t >= 1) {
      player.speed = PLAYER_CRUISE_BASE_SPEED;
      player.state = 'NORMAL';
      player.stateElapsed = 0;
    }
  } else {
    const targetSpeed = currentTargetSpeed();
    const acceleration = player.tierBoostElapsed > 0 ? PLAYER_TIER_ACCELERATION : PLAYER_ACCELERATION;
    const rate = targetSpeed >= player.speed ? acceleration : PLAYER_COAST_DECELERATION;
    player.speed = moveToward(player.speed, targetSpeed, rate * dt);
  }

  // Keep an unwrapped distance for reliable lap/overtake detection.
  player.distance = advanceDistanceAtRoadSpeed(player.distance, player.speed, dt, player.visualLane);
  updateMotionTrail(player, dt, player.state !== 'CRASHED' && player.speed > PLAYER_TRAIL_START_SPEED);
}

function forwardPathDistance(fromDistance, toDistance) {
  return wrapDistance(toDistance - fromDistance);
}

// At cruise speed, AI cars keep a modest no-lane-change zone in front of the player.
// As the red car accelerates, this zone grows so high-speed runs remain readable and fair.
function currentAiPlayerSafetyDistance() {
  const speedExtra = Math.max(0, player.speed - PLAYER_CRUISE_BASE_SPEED) * AI_PLAYER_SAFETY_PER_SPEED;
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
    car.previousDistance = car.distance;
    car.previousVisualLane = car.visualLane;
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
    car.distance = advanceDistanceAtRoadSpeed(car.distance, car.speed, dt, car.visualLane);
    updateMotionTrail(car, dt, true);
  }
}

function detectCollisions() {
  if (player.invincible > 0 || player.state === 'CRASHED') return false;

  for (const car of aiCars) {
    const laneDistanceNow = Math.abs(player.visualLane - car.visualLane);
    const laneDistanceBefore = Math.abs(player.previousVisualLane - car.previousVisualLane);
    const laneDistance = Math.min(laneDistanceNow, laneDistanceBefore);
    const pathDistance = circularDistance(player.distance, car.distance);

    // At 600+ road-speed units the red car can cross an AI car between frames.
    // Detect the unwrapped pass-index crossing as well as current-position overlap.
    const previousGap = player.previousDistance - car.previousDistance;
    const currentGap = player.distance - car.distance;
    const previousPassIndex = Math.floor(previousGap / arc.total);
    const currentPassIndex = Math.floor(currentGap / arc.total);
    const sweptThroughCar = currentPassIndex > previousPassIndex;

    if (laneDistance <= COLLISION_LANE_DISTANCE &&
        (pathDistance <= COLLISION_PATH_DISTANCE || sweptThroughCar)) {
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
      const previousCombo = player.combo;
      const previousTier = currentSpeedTier(previousCombo);
      player.combo += overtakes;
      const newTier = currentSpeedTier(player.combo);
      player.totalPasses += overtakes;
      player.bestCombo = Math.max(player.bestCombo, player.combo);
      player.passPopElapsed = 0;
      car.passIndex = currentPassIndex;
      audio.playOvertake(player.combo, overtakes);

      if (newTier > previousTier) {
        player.tierBoostElapsed = PLAYER_TIER_BOOST_DURATION;
        audio.playSpeedTierUp(newTier);
      }

      if (typeof wx.vibrateShort === 'function') {
        try { wx.vibrateShort({ type: newTier > previousTier ? 'medium' : 'light' }); } catch (error) { /* browser/test shim */ }
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
  const playerTrailStrength = clamp(
    (player.speed - PLAYER_TRAIL_START_SPEED) /
      Math.max(1, PLAYER_TRAIL_FULL_SPEED - PLAYER_TRAIL_START_SPEED),
    0,
    1
  );

  // Black traffic gets only one extremely faint historical copy at the highest
  // player speeds. The red car remains the visual focus with up to five copies.
  const aiTrailStrength = clamp(
    (player.speed - AI_TRAIL_PLAYER_SPEED_START) /
      Math.max(1, PLAYER_MAX_SPEED - AI_TRAIL_PLAYER_SPEED_START),
    0,
    1
  );
  if (aiTrailStrength > 0.01) {
    for (const car of aiCars) drawMotionTrail(car.trail, AI_STYLE, aiTrailStrength, 1, 0.055);
  }
  drawMotionTrail(player.trail, PLAYER_STYLE, playerTrailStrength, PLAYER_TRAIL_MAX_COPIES, 0.24);

  for (const car of aiCars) drawAiCar(car);
  drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, playerAlpha());
}

function drawHud() {
  // Keep the track unobstructed: only a compact combo readout remains in one corner.
  ctx.fillStyle = 'rgba(8,17,25,0.66)';
  roundRect(ctx, 12, 12, 68, 42, 13);
  ctx.fill();
  ctx.fillStyle = player.combo > 0 ? COLORS.accentLight : COLORS.text;
  const tierPulse = player.tierBoostElapsed > 0
    ? 1 + Math.sin((PLAYER_TIER_BOOST_DURATION - player.tierBoostElapsed) * Math.PI * 8) * 0.08
    : 1;
  ctx.save();
  ctx.translate(46, 35);
  ctx.scale(tierPulse, tierPulse);
  ctx.font = '900 25px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`x${player.combo}`, 0, 5);
  ctx.restore();

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
  audio.update(dt);
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

if (typeof wx.onHide === 'function') wx.onHide(() => {
  audio.suspend();
  backgroundMusic.pauseForLifecycle();
});
if (typeof wx.onShow === 'function') wx.onShow(() => {
  audio.resume();
  backgroundMusic.resumeForLifecycle();
});

scheduleFrame(frame);
