// GENERATED FILE - do not edit. Source lives in src/; rebuild with `npm run build`.
"use strict";
var HarborLoop = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key2 of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key2) && key2 !== except)
          __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/main.ts
  var main_exports = {};
  __export(main_exports, {
    MODES: () => MODES,
    TRACKS: () => TRACKS,
    aiCars: () => aiCars,
    app: () => app,
    bestScore: () => bestScore,
    careerPoints: () => careerPoints,
    debugPointerCount: () => debugPointerCount,
    difficultyUnlocked: () => difficultyUnlocked,
    inputState: () => inputState,
    laneButtonFlash: () => laneButtonFlash,
    modeUnlockCost: () => modeUnlockCost,
    modeUnlocked: () => modeUnlocked,
    openMenu: () => openMenu,
    player: () => player,
    retryRun: () => retryRun,
    run: () => run,
    setUnlockOverride: () => setUnlockOverride,
    starsFor: () => starsFor,
    startMode: () => startMode,
    totalStars: () => totalStars,
    trackLength: () => trackLength
  });

  // src/config.ts
  var LANE_COUNT = 6;
  var LANE_GAP = 8.2;
  var ROAD_HALF_WIDTH = 27;
  var PLAYER_CRUISE_BASE_SPEED = 125;
  var SPEED_TIER_CRUISE = [125, 180, 240, 305, 365, 420, 470, 515, 555, 590, 620];
  var SPEED_TIER_THROTTLE = [175, 240, 310, 380, 445, 505, 555, 600, 640, 675, 705];
  var PLAYER_MAX_SPEED = SPEED_TIER_THROTTLE[SPEED_TIER_THROTTLE.length - 1];
  var PLAYER_ACCELERATION = 112;
  var PLAYER_TIER_ACCELERATION = 165;
  var PLAYER_COAST_DECELERATION = 42;
  var PLAYER_TIER_BOOST_DURATION = 0.72;
  var CHANGE_DURATION = 0.05;
  var AI_WARNING_DURATION = 0.16;
  var AI_CHANGE_DURATION = 0.2;
  var AI_MIN_DECISION_DELAY = 0.85;
  var AI_MAX_DECISION_DELAY = 2.35;
  var AI_LANE_CLEAR_DISTANCE = 32;
  var AI_PLAYER_BASE_SAFETY_DISTANCE = 50;
  var AI_PLAYER_MAX_SAFETY_DISTANCE = 265;
  var AI_PLAYER_SAFETY_PER_SPEED = 0.39;
  var AI_PLAYER_REAR_SAFETY_DISTANCE = 30;
  var COLLISION_PATH_DISTANCE = 11.5;
  var COLLISION_LANE_DISTANCE = 0.48;
  function buildBlueprints(count) {
    const blueprints = [];
    for (let i = 0; i < count; i++) {
      const lane = i % LANE_COUNT;
      blueprints.push({
        fraction: i * 0.6180339887498949 % 1,
        lane,
        speed: 84 + lane * 7 + i % 3 * 3
      });
    }
    return blueprints;
  }

  // src/difficulty.ts
  var DIFFICULTY_PROFILES = {
    normal: {
      label: "NORMAL",
      blurb: "24 车 · 基准速度 · AI 会让路",
      playerSpeed: 1,
      trafficSpeed: 1,
      carCount: 24,
      aiSafetyScale: 0.85,
      aiDecisionScale: 0.85,
      maxSimultaneousAi: 3,
      invincibleSeconds: 1.25
    },
    turbo: {
      label: "TURBO",
      blurb: "30 车 · 更快 · AI 更早并线",
      playerSpeed: 1.22,
      trafficSpeed: 1.2,
      carCount: 30,
      aiSafetyScale: 0.58,
      aiDecisionScale: 0.58,
      maxSimultaneousAi: 4,
      invincibleSeconds: 1
    },
    master: {
      label: "MASTER",
      blurb: "36 车 · 最快 · AI 几乎不让路",
      playerSpeed: 1.45,
      trafficSpeed: 1.42,
      carCount: 36,
      aiSafetyScale: 0.36,
      aiDecisionScale: 0.4,
      maxSimultaneousAi: 6,
      invincibleSeconds: 0.75
    }
  };
  var DIFFICULTY_LABEL = {
    normal: DIFFICULTY_PROFILES.normal.label,
    turbo: DIFFICULTY_PROFILES.turbo.label,
    master: DIFFICULTY_PROFILES.master.label
  };
  var DIFFICULTIES = ["normal", "turbo", "master"];
  var tuning = {
    profile: DIFFICULTY_PROFILES.normal,
    player: 1,
    traffic: 1
  };
  function applyTuning(difficulty, trafficScale) {
    const profile = DIFFICULTY_PROFILES[difficulty];
    tuning.profile = profile;
    tuning.player = profile.playerSpeed;
    tuning.traffic = profile.trafficSpeed * trafficScale;
  }

  // src/tracks/index.ts
  var PathBuilder = class {
    constructor() {
      this.points = [];
    }
    push(x, y) {
      const last = this.points[this.points.length - 1];
      if (!last || Math.hypot(last.x - x, last.y - y) > 0.01) this.points.push({ x, y });
    }
    start(x, y) {
      this.push(x, y);
      return this;
    }
    lineTo(x, y, spacing = 3) {
      const from = this.points[this.points.length - 1];
      const length = Math.hypot(x - from.x, y - from.y);
      const count = Math.max(1, Math.ceil(length / spacing));
      for (let i = 1; i <= count; i++) {
        const t = i / count;
        this.push(from.x + (x - from.x) * t, from.y + (y - from.y) * t);
      }
      return this;
    }
    arcTo(cx, cy, radius, startAngle, endAngle, spacing = 2.6) {
      const sweep = endAngle - startAngle;
      const count = Math.max(8, Math.ceil(Math.abs(sweep) * radius / spacing));
      for (let i = 1; i <= count; i++) {
        const angle = startAngle + sweep * (i / count);
        this.push(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      }
      return this;
    }
    /** Drops the duplicated closing point so the loop wraps cleanly. */
    close() {
      const { points } = this;
      if (points.length > 1) {
        const first = points[0];
        const last = points[points.length - 1];
        if (Math.hypot(last.x - first.x, last.y - first.y) < 0.1) points.pop();
      }
      return points;
    }
  };
  function buildLongBay() {
    const path = new PathBuilder().start(110, 70);
    path.lineTo(310, 70);
    path.arcTo(310, 115, 45, -Math.PI / 2, Math.PI / 2);
    path.lineTo(160, 160);
    path.arcTo(160, 205, 45, -Math.PI / 2, -3 * Math.PI / 2);
    path.lineTo(310, 250);
    path.arcTo(310, 295, 45, -Math.PI / 2, Math.PI / 2);
    path.lineTo(160, 340);
    path.arcTo(160, 385, 45, -Math.PI / 2, -3 * Math.PI / 2);
    path.lineTo(310, 430);
    path.arcTo(310, 475, 45, -Math.PI / 2, Math.PI / 2);
    path.lineTo(160, 520);
    path.arcTo(160, 565, 45, -Math.PI / 2, -3 * Math.PI / 2);
    path.lineTo(310, 610);
    path.arcTo(310, 655, 45, -Math.PI / 2, Math.PI / 2);
    path.lineTo(110, 700);
    path.arcTo(110, 640, 60, Math.PI / 2, Math.PI);
    path.lineTo(50, 130);
    path.arcTo(110, 130, 60, Math.PI, 3 * Math.PI / 2);
    return path.close();
  }
  function buildGrandOval() {
    const left = 112;
    const right = 278;
    const top = 178;
    const bottom = 612;
    const radius = (right - left) / 2;
    const midX = (left + right) / 2;
    const path = new PathBuilder().start(left, bottom);
    path.lineTo(left, top);
    path.arcTo(midX, top, radius, Math.PI, Math.PI * 2);
    path.lineTo(right, bottom);
    path.arcTo(midX, bottom, radius, 0, Math.PI);
    return path.close();
  }
  function buildSwitchback() {
    const path = new PathBuilder().start(140, 92);
    const radius = 30;
    const leftX = 140;
    const rightX = 296;
    const rows = 9;
    const step = 60;
    for (let row = 0; row < rows; row++) {
      const y = 92 + row * step;
      const goingRight = row % 2 === 0;
      path.lineTo(goingRight ? rightX : leftX, y);
      if (row === rows - 1) break;
      const cx = goingRight ? rightX : leftX;
      const cy = y + radius;
      if (goingRight) path.arcTo(cx, cy, radius, -Math.PI / 2, Math.PI / 2);
      else path.arcTo(cx, cy, radius, -Math.PI / 2, -3 * Math.PI / 2);
    }
    path.arcTo(rightX, 611, 39, -Math.PI / 2, Math.PI / 2);
    path.lineTo(88, 650);
    path.arcTo(88, 598, 52, Math.PI / 2, Math.PI);
    path.lineTo(36, 144);
    path.arcTo(88, 144, 52, Math.PI, 3 * Math.PI / 2);
    path.lineTo(leftX, 92);
    return path.close();
  }
  function buildMarinaSprint() {
    const path = new PathBuilder().start(128, 110);
    path.lineTo(288, 110);
    path.arcTo(288, 168, 58, -Math.PI / 2, Math.PI / 2);
    path.lineTo(168, 226);
    path.arcTo(168, 284, 58, -Math.PI / 2, -3 * Math.PI / 2);
    path.lineTo(288, 342);
    path.arcTo(288, 400, 58, -Math.PI / 2, Math.PI / 2);
    path.lineTo(168, 458);
    path.arcTo(168, 516, 58, -Math.PI / 2, -3 * Math.PI / 2);
    path.lineTo(288, 574);
    path.arcTo(288, 632, 58, -Math.PI / 2, Math.PI / 2);
    path.lineTo(128, 690);
    path.arcTo(128, 632, 58, Math.PI / 2, Math.PI);
    path.lineTo(70, 168);
    path.arcTo(128, 168, 58, Math.PI, 3 * Math.PI / 2);
    return path.close();
  }
  var LONG_BAY_DECOR = {
    medians: [
      [178, 111, 113, 16],
      [178, 201, 113, 16],
      [178, 291, 113, 16],
      [178, 381, 113, 16],
      [178, 471, 113, 16],
      [178, 561, 113, 16],
      [178, 651, 113, 16]
    ],
    trees: [[194, 119, 0.4], [265, 209, 0.38], [205, 299, 0.4], [204, 479, 0.4], [265, 569, 0.38]],
    umbrellas: [[242, 119, 0.38], [252, 389, 0.38], [220, 659, 0.38]],
    buoys: [[26, 128], [365, 250], [25, 628], [366, 650]]
  };
  var GRAND_OVAL_DECOR = {
    medians: [[170, 216, 50, 356]],
    trees: [[195, 252, 0.42], [195, 400, 0.42], [195, 540, 0.42]],
    umbrellas: [[195, 326, 0.4], [195, 468, 0.4]],
    buoys: [[40, 150], [352, 210], [40, 640], [352, 620]]
  };
  var OPEN_WATER_DECOR = {
    medians: [],
    trees: [],
    umbrellas: [],
    buoys: [[20, 120], [372, 200], [20, 560], [372, 660], [18, 380]]
  };
  var TRACKS = [
    { id: "long-bay", name: "LONG BAY", build: buildLongBay, decor: LONG_BAY_DECOR },
    { id: "grand-oval", name: "GRAND OVAL", build: buildGrandOval, decor: GRAND_OVAL_DECOR },
    { id: "switchback", name: "SWITCHBACK", build: buildSwitchback, decor: OPEN_WATER_DECOR },
    { id: "marina-sprint", name: "MARINA SPRINT", build: buildMarinaSprint, decor: OPEN_WATER_DECOR }
  ];
  var BY_ID = new Map(TRACKS.map((track) => [track.id, track]));
  function trackById(id) {
    const track = BY_ID.get(id);
    if (!track) throw new Error(`unknown track: ${id}`);
    return track;
  }
  var DEFAULT_TRACK_ID = "long-bay";

  // src/track.ts
  var activeTrackId = DEFAULT_TRACK_ID;
  var centerPath = [];
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
  var arc = { cumulative: [0], total: 1 };
  function trackLength() {
    return arc.total;
  }
  function wrapDistance(distance) {
    return (distance % arc.total + arc.total) % arc.total;
  }
  function circularDistance(a, b) {
    const raw = Math.abs(wrapDistance(a) - wrapDistance(b));
    return Math.min(raw, arc.total - raw);
  }
  function forwardPathDistance(fromDistance, toDistance) {
    return wrapDistance(toDistance - fromDistance);
  }
  function locateCenterSegment(distance) {
    const d = wrapDistance(distance);
    let lo = 0;
    let hi = centerPath.length;
    while (lo + 1 < hi) {
      const mid = lo + hi >> 1;
      if (arc.cumulative[mid] <= d) lo = mid;
      else hi = mid;
    }
    const i = Math.min(lo, centerPath.length - 1);
    const segmentStart = arc.cumulative[i];
    const segmentLength = Math.max(1e-4, arc.cumulative[i + 1] - segmentStart);
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
  var laneCenterPaths = [];
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
    return Math.max(1e-4, Math.hypot(b.x - a.x, b.y - a.y));
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
    while (remainingRoadDistance > 1e-6 && guard < 128) {
      const station = locateCenterSegment(currentDistance);
      const roadSegmentLength = laneSegmentLength(station.i, laneIndex);
      const roadRemainingInSegment = roadSegmentLength * (1 - station.t);
      const centerRemainingInSegment = station.segmentLength * (1 - station.t);
      if (roadRemainingInSegment <= 1e-6 || centerRemainingInSegment <= 1e-6) {
        currentDistance += 1e-6;
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
  var laneDividerPaths = [];
  var outerRoadEdgePath = [];
  var innerRoadEdgePath = [];
  function setTrack(id) {
    activeTrackId = id;
    centerPath = trackById(id).build();
    arc = buildArcData(centerPath);
    laneCenterPaths = Array.from({ length: LANE_COUNT }, (_, lane) => pathForLane(lane));
    laneDividerPaths = Array.from({ length: LANE_COUNT - 1 }, (_, i) => pathForLane(i + 0.5));
    outerRoadEdgePath = pathAtOffset(ROAD_HALF_WIDTH - 1.8);
    innerRoadEdgePath = pathAtOffset(-ROAD_HALF_WIDTH + 1.8);
  }
  setTrack(DEFAULT_TRACK_ID);

  // src/state.ts
  var STARTING_LANE = 2;
  var inputState = {
    throttle: false
  };
  var player = {
    distance: 0,
    lane: STARTING_LANE,
    visualLane: STARTING_LANE,
    laneFrom: STARTING_LANE,
    laneTo: STARTING_LANE,
    laneChangeElapsed: 0,
    speed: PLAYER_CRUISE_BASE_SPEED,
    state: "NORMAL",
    stateElapsed: 0,
    invincible: 0,
    combo: 0,
    bestCombo: 0,
    totalPasses: 0,
    passPopElapsed: 10,
    tierBoostElapsed: 0,
    previousDistance: 0,
    previousVisualLane: STARTING_LANE,
    collisionCount: 0,
    fireball: 0,
    heat: 0,
    travelled: 0
  };
  var aiCars = [];
  function resetGame() {
    player.distance = arc.total * 0.03;
    player.lane = STARTING_LANE;
    player.visualLane = STARTING_LANE;
    player.laneFrom = STARTING_LANE;
    player.laneTo = STARTING_LANE;
    player.laneChangeElapsed = 0;
    player.speed = baseCruiseSpeed();
    inputState.throttle = false;
    player.state = "NORMAL";
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
    player.fireball = 0;
    player.heat = 0;
    player.travelled = 0;
    aiCars = buildBlueprints(tuning.profile.carCount).map((blueprint, index) => {
      const distance = arc.total * blueprint.fraction;
      const baseSpeed = blueprint.speed * tuning.traffic;
      return {
        id: index,
        distance,
        lane: blueprint.lane,
        visualLane: blueprint.lane,
        laneFrom: blueprint.lane,
        laneTo: blueprint.lane,
        baseSpeed,
        speed: baseSpeed,
        previousDistance: distance,
        previousVisualLane: blueprint.lane,
        state: "IDLE",
        stateElapsed: 0,
        direction: 0,
        decisionTimer: (AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY)) * tuning.profile.aiDecisionScale,
        passIndex: Math.floor((player.distance - distance) / arc.total),
        alive: true,
        wreck: 0,
        hasZone: false,
        zoneFill: 0
      };
    });
  }
  function baseCruiseSpeed() {
    return PLAYER_CRUISE_BASE_SPEED * tuning.player;
  }
  function currentSpeedTier(combo = player.combo) {
    return Math.min(SPEED_TIER_CRUISE.length - 1, Math.floor(Math.max(0, combo) / 10));
  }
  function currentCruiseSpeed() {
    return SPEED_TIER_CRUISE[currentSpeedTier()] * tuning.player;
  }
  function currentThrottleMaxSpeed() {
    return SPEED_TIER_THROTTLE[currentSpeedTier()] * tuning.player;
  }
  function currentTargetSpeed() {
    return inputState.throttle ? currentThrottleMaxSpeed() : currentCruiseSpeed();
  }
  function engineSnapshot() {
    return {
      tier: currentSpeedTier(),
      throttle: inputState.throttle,
      speed: player.speed,
      cruiseSpeed: currentCruiseSpeed(),
      throttleMaxSpeed: currentThrottleMaxSpeed(),
      maxSpeed: PLAYER_MAX_SPEED * tuning.player,
      state: player.state
    };
  }

  // src/ai.ts
  function currentAiPlayerSafetyDistance() {
    const speedExtra = Math.max(0, player.speed - baseCruiseSpeed()) * AI_PLAYER_SAFETY_PER_SPEED;
    const zone = Math.min(AI_PLAYER_MAX_SAFETY_DISTANCE, AI_PLAYER_BASE_SAFETY_DISTANCE + speedExtra);
    return zone * tuning.profile.aiSafetyScale;
  }
  function playerIsApproachingAi(car) {
    const playerToCar = forwardPathDistance(player.distance, car.distance);
    if (playerToCar > 0.1 && playerToCar < currentAiPlayerSafetyDistance()) return true;
    const carToPlayer = forwardPathDistance(car.distance, player.distance);
    return carToPlayer > 0.1 && carToPlayer < AI_PLAYER_REAR_SAFETY_DISTANCE;
  }
  function countActiveAiLaneChanges() {
    let count = 0;
    for (const car of aiCars) {
      if (car.alive && (car.state === "WARNING" || car.state === "CHANGING")) count += 1;
    }
    return count;
  }
  function nearestAiAhead(car, lane, maxDistance = 90) {
    let nearest = null;
    let nearestDistance = maxDistance;
    for (const other of aiCars) {
      if (other === car || !other.alive || Math.abs(other.visualLane - lane) > 0.55) continue;
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
      if (other === car || !other.alive || Math.abs(other.visualLane - targetLane) > 0.62) continue;
      if (circularDistance(car.distance, other.distance) < AI_LANE_CLEAR_DISTANCE) return false;
    }
    if (Math.abs(player.visualLane - targetLane) < 0.72 && circularDistance(car.distance, player.distance) < currentAiPlayerSafetyDistance()) {
      return false;
    }
    return true;
  }
  function shuffledDirections() {
    return Math.random() < 0.5 ? [-1, 1] : [1, -1];
  }
  function tryBeginAiLaneChange(car) {
    if (countActiveAiLaneChanges() >= tuning.profile.maxSimultaneousAi) return false;
    if (playerIsApproachingAi(car)) return false;
    const ahead = nearestAiAhead(car, car.visualLane, 62);
    const needsToPass = Boolean(ahead && ahead.car.speed + 2 < car.baseSpeed && ahead.distance < 46);
    if (!needsToPass && Math.random() > 0.34) return false;
    const directions = shuffledDirections();
    for (const direction of directions) {
      const targetLane = car.lane + direction;
      if (targetLane < 0 || targetLane >= LANE_COUNT) continue;
      if (!isAiTargetLaneClear(car, targetLane)) continue;
      car.state = "WARNING";
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
      if (!car.alive) {
        car.wreck = Math.max(0, car.wreck - dt);
        continue;
      }
      car.previousDistance = car.distance;
      car.previousVisualLane = car.visualLane;
      car.decisionTimer -= dt;
      if (car.state === "IDLE" && car.decisionTimer <= 0) {
        car.decisionTimer = (AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY)) * tuning.profile.aiDecisionScale;
        tryBeginAiLaneChange(car);
      } else if (car.state === "WARNING") {
        car.stateElapsed += dt;
        if (playerIsApproachingAi(car) || !isAiTargetLaneClear(car, car.laneTo)) {
          car.state = "IDLE";
          car.stateElapsed = 0;
          car.direction = 0;
          car.decisionTimer = 0.55 + Math.random() * 0.75;
        } else if (car.stateElapsed >= AI_WARNING_DURATION) {
          car.state = "CHANGING";
          car.stateElapsed = 0;
          car.laneFrom = car.visualLane;
          car.lane = car.laneTo;
        }
      } else if (car.state === "CHANGING") {
        car.stateElapsed += dt;
        const t = Math.min(1, car.stateElapsed / AI_CHANGE_DURATION);
        const eased = t * t * (3 - 2 * t);
        car.visualLane = car.laneFrom + (car.laneTo - car.laneFrom) * eased;
        if (t >= 1) {
          car.visualLane = car.laneTo;
          car.lane = car.laneTo;
          car.state = "IDLE";
          car.stateElapsed = 0;
          car.direction = 0;
          car.decisionTimer = 0.9 + Math.random() * 1.5;
        }
      }
      const ahead = nearestAiAhead(car, car.visualLane, 34);
      let desiredSpeed = car.baseSpeed;
      if (ahead && ahead.distance < 24) desiredSpeed = Math.min(desiredSpeed, ahead.car.speed * 0.96);
      const response = Math.min(1, dt * 4.5);
      car.speed += (desiredSpeed - car.speed) * response;
      car.distance = advanceDistanceAtRoadSpeed(car.distance, car.speed, dt, car.visualLane);
    }
  }

  // src/leaderboard.ts
  var openDataContext = null;
  var openDataChecked = false;
  function context() {
    if (openDataChecked) return openDataContext;
    openDataChecked = true;
    const api = wx;
    if (typeof api.getOpenDataContext === "function") {
      try {
        openDataContext = api.getOpenDataContext();
      } catch (error) {
        openDataContext = null;
      }
    }
    return openDataContext;
  }
  function leaderboardAvailable() {
    return context() !== null;
  }
  function submitFriendScore(points) {
    const api = wx;
    if (typeof api.setUserCloudStorage !== "function") return;
    try {
      api.setUserCloudStorage({
        // WeChat requires string values; the key is what the open data context reads.
        KVDataList: [{ key: "career", value: String(Math.round(points)) }],
        fail: () => {
        }
      });
    } catch (error) {
    }
  }
  function requestFriendRanking(width, height, dpr) {
    const ctx2 = context();
    if (!ctx2) return;
    try {
      ctx2.canvas.width = Math.floor(width * dpr);
      ctx2.canvas.height = Math.floor(height * dpr);
      ctx2.postMessage({ type: "render", key: "career", width, height, dpr });
    } catch (error) {
    }
  }
  function sharedCanvas() {
    const ctx2 = context();
    return ctx2 ? ctx2.canvas : null;
  }

  // src/effects.ts
  var effects = {
    /** 0 = clear, 1 = fully blacked out. */
    dim: 0,
    /** Lane index that is currently lethal, or -1. */
    hazardLane: -1
  };
  function resetEffects() {
    effects.dim = 0;
    effects.hazardLane = -1;
  }

  // src/modes/blackout.ts
  var CYCLE = 7;
  var DARK_SECONDS = 2;
  var FADE = 0.45;
  var blackout = {
    id: "blackout",
    name: "BLACKOUT",
    rule: "每 7 秒熄灯 2 秒 · 靠记忆穿过车流",
    timeLimit: 60,
    scoreUnit: "PASSES",
    trafficScale: 0.9,
    trackId: "switchback",
    stars: [15, 28, 43],
    setup() {
      effects.dim = 0;
    },
    update(_dt, run2) {
      const phase = run2.elapsed % CYCLE;
      let dim = 0;
      if (phase < DARK_SECONDS) {
        const t = phase / DARK_SECONDS;
        const edge = Math.min(t, 1 - t) / (FADE / DARK_SECONDS);
        dim = Math.min(1, Math.max(0, edge)) * 0.94;
      }
      effects.dim = dim;
      run2.score = player.totalPasses;
      run2.progress = 1 - dim / 0.94;
    }
  };

  // src/modes/chainReaction.ts
  var CHAIN_WINDOW = 3.2;
  var ARM_COMBO = 5;
  var chain = 0;
  var best = 0;
  var chainReaction = {
    id: "chain-reaction",
    name: "CHAIN REACTION",
    rule: `${ARM_COMBO} 次超车装填 · 每次摧毁刷新 ${CHAIN_WINDOW} 秒窗口`,
    timeLimit: 75,
    scoreUnit: "CHAIN",
    trafficScale: 0.9,
    trackId: "long-bay",
    stars: [3, 6, 10],
    setup() {
      chain = 0;
      best = 0;
      player.fireball = 0;
    },
    update(_dt, run2) {
      if (player.fireball <= 0 && chain > 0) {
        chain = 0;
        run2.banner = "CHAIN BROKEN";
        run2.bannerTimer = 0.9;
      }
      if (player.fireball <= 0 && player.combo > 0 && player.combo % ARM_COMBO === 0) {
        player.fireball = CHAIN_WINDOW;
      }
      run2.score = best;
      run2.progress = player.fireball > 0 ? Math.min(1, player.fireball / CHAIN_WINDOW) : -1;
    },
    onContact() {
      return player.fireball > 0 ? "destroy" : "crash";
    },
    onDestroy(_car, run2) {
      chain += 1;
      if (chain > best) best = chain;
      player.fireball = CHAIN_WINDOW;
      run2.banner = `CHAIN x${chain}`;
      run2.bannerTimer = 0.7;
    },
    onCrash(run2) {
      chain = 0;
      run2.banner = "CHAIN LOST";
      run2.bannerTimer = 0.9;
    }
  };

  // src/modes/comboRacers.ts
  var TARGET_COMBO = 40;
  var comboRacers = {
    id: "combo-racers",
    name: "COMBO RACERS",
    rule: `限时 60 秒 · Combo 冲到 ${TARGET_COMBO} · 撞车清零`,
    timeLimit: 60,
    scoreUnit: "COMBO",
    trafficScale: 1,
    trackId: "long-bay",
    stars: [12, 26, 40],
    update(_dt, run2) {
      if (player.combo > run2.score) run2.score = player.combo;
      run2.progress = Math.min(1, player.combo / TARGET_COMBO);
    },
    onCrash(run2) {
      run2.banner = "COMBO LOST";
      run2.bannerTimer = 1.1;
    },
    cleared(run2) {
      return run2.score >= TARGET_COMBO;
    }
  };

  // src/modes/deathRace.ts
  var deathRace = {
    id: "death-race",
    name: "DEATH RACE",
    rule: "限时 90 秒 · 撞毁场上全部车辆",
    timeLimit: 90,
    scoreUnit: "POINTS",
    trafficScale: 0.85,
    trackId: "marina-sprint",
    stars: [800, 2e3, 3600],
    setup() {
      player.fireball = Number.POSITIVE_INFINITY;
    },
    update(_dt, run2, cars) {
      const remaining = cars.filter((car) => car.alive).length;
      run2.progress = cars.length === 0 ? 1 : run2.destroyed / cars.length;
      run2.score = run2.destroyed * 100 + Math.max(0, Math.floor(run2.timeRemaining)) * 20;
      if (remaining === 0) run2.banner = "ALL CLEAR";
    },
    onContact() {
      return "destroy";
    },
    cleared(_run, cars) {
      return cars.length > 0 && cars.every((car) => !car.alive);
    }
  };

  // src/modes/endurance.ts
  var RAMP_PER_SECOND = 8e-3;
  var baseline = [];
  var endurance = {
    id: "endurance",
    name: "ENDURANCE",
    rule: "无时间限制 · 一条命 · 车流永远在加速",
    timeLimit: Infinity,
    scoreUnit: "PASSES",
    trafficScale: 0.75,
    trackId: "long-bay",
    stars: [15, 35, 62],
    setup(_run, cars) {
      baseline = cars.map((car) => car.baseSpeed);
    },
    update(_dt, run2, cars) {
      const ramp = 1 + run2.elapsed * RAMP_PER_SECOND;
      cars.forEach((car, index) => {
        const original = baseline[index];
        if (original !== void 0) car.baseSpeed = original * ramp;
      });
      run2.score = player.totalPasses;
      run2.progress = -1;
    },
    onCrash(run2) {
      run2.outcome = "wrecked";
    }
  };

  // src/modes/fireballFrenzy.ts
  var COMBO_PER_FIREBALL = 10;
  var FIREBALL_DURATION = 6;
  var lastCharge = 0;
  var fireballFrenzy = {
    id: "fireball-frenzy",
    name: "FIREBALL FRENZY",
    rule: `每 ${COMBO_PER_FIREBALL} 次超车化身火球 · 火球状态撞车即摧毁`,
    timeLimit: 60,
    scoreUnit: "POINTS",
    trafficScale: 1,
    trackId: "long-bay",
    stars: [400, 1200, 2600],
    setup() {
      lastCharge = 0;
    },
    update(_dt, run2) {
      const charge2 = Math.floor(player.combo / COMBO_PER_FIREBALL);
      if (charge2 > lastCharge) {
        lastCharge = charge2;
        player.fireball = FIREBALL_DURATION;
        run2.banner = "FIREBALL!";
        run2.bannerTimer = 1.2;
      }
      run2.score = run2.destroyed * 200 + player.totalPasses * 10;
      run2.progress = player.fireball > 0 ? player.fireball / FIREBALL_DURATION : -1;
    },
    onContact(_car) {
      return player.fireball > 0 ? "destroy" : "crash";
    },
    onCrash(run2) {
      lastCharge = 0;
      run2.banner = "BURNED OUT";
      run2.bannerTimer = 1;
    }
  };

  // src/mathUtil.ts
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function moveToward(value, target, maxDelta) {
    if (value < target) return Math.min(target, value + maxDelta);
    if (value > target) return Math.max(target, value - maxDelta);
    return target;
  }

  // src/platform.ts
  var canvas = wx.createCanvas();
  var context2d = canvas.getContext("2d");
  if (!context2d) throw new Error("2D canvas context is unavailable");
  var ctx = context2d;
  function withRenderTarget(target, draw) {
    const previous = ctx;
    ctx = target;
    try {
      draw();
    } finally {
      ctx = previous;
    }
  }
  function createOffscreenCanvas(width, height) {
    try {
      const offscreen = wx.createCanvas();
      offscreen.width = width;
      offscreen.height = height;
      return offscreen;
    } catch (error) {
      return null;
    }
  }
  var windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  var VIEW_W = windowInfo.windowWidth;
  var VIEW_H = windowInfo.windowHeight;
  var DPR = Math.min(windowInfo.pixelRatio || 1, 3);
  canvas.width = Math.floor(VIEW_W * DPR);
  canvas.height = Math.floor(VIEW_H * DPR);
  ctx.scale(DPR, DPR);
  var DESIGN_W = 390;
  var DESIGN_H = 844;
  var scale = Math.min(VIEW_W / DESIGN_W, VIEW_H / DESIGN_H);
  var offsetX = (VIEW_W - DESIGN_W * scale) * 0.5;
  var offsetY = (VIEW_H - DESIGN_H * scale) * 0.5;
  function screenToDesignX(screenX) {
    return (screenX - offsetX) / scale;
  }
  function screenToDesignY(screenY) {
    return (screenY - offsetY) / scale;
  }
  function vibrate(type) {
    if (typeof wx.vibrateShort !== "function") return;
    try {
      wx.vibrateShort({ type });
    } catch (error) {
    }
  }
  function createCompatibleAudioContext() {
    if (typeof wx !== "undefined" && typeof wx.createWebAudioContext === "function") {
      try {
        return wx.createWebAudioContext();
      } catch (error) {
      }
    }
    if (typeof globalThis !== "undefined") {
      const scope = globalThis;
      const BrowserAudioContext = scope.AudioContext || scope.webkitAudioContext;
      if (BrowserAudioContext) {
        try {
          return new BrowserAudioContext();
        } catch (error) {
        }
      }
    }
    return null;
  }
  var scheduleFrame = typeof requestAnimationFrame === "function" ? (callback) => {
    requestAnimationFrame(callback);
  } : (callback) => {
    setTimeout(() => callback(Date.now()), 16);
  };

  // src/audio.ts
  function setAudioParam(param, value) {
    if (!param) return;
    try {
      param.value = value;
    } catch (error) {
    }
  }
  function safelyStartNode(node) {
    if (!node || typeof node.start !== "function") return;
    try {
      node.start(0);
    } catch (error) {
    }
  }
  function safelyStopNode(node) {
    if (!node) return;
    if (typeof node.stop === "function") {
      try {
        node.stop(0);
      } catch (error) {
      }
    }
    if (typeof node.disconnect === "function") {
      try {
        node.disconnect();
      } catch (error) {
      }
    }
  }
  function createLoopingNoiseSource(context2) {
    if (!context2 || typeof context2.createBuffer !== "function" || typeof context2.createBufferSource !== "function") return null;
    try {
      const sampleRate = context2.sampleRate || 44100;
      const frameCount = Math.max(1, Math.floor(sampleRate * 1.25));
      const buffer = context2.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < frameCount; index++) {
        const white = Math.random() * 2 - 1;
        previous = previous * 0.965 + white * 0.035;
        data[index] = previous * 2.4;
      }
      const source = context2.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      return source;
    } catch (error) {
      return null;
    }
  }
  var TIER_RPM_MULTIPLIER = [1, 1.065, 1.13, 1.19, 1.245, 1.295, 1.34, 1.38, 1.415, 1.445, 1.47];
  var MAX_VOICES = 12;
  var AudioEngine = class {
    constructor() {
      this.context = null;
      this.started = false;
      this.disabled = false;
      this.masterGain = null;
      this.engineGain = null;
      this.engineFilter = null;
      this.engineLow = null;
      this.engineMid = null;
      this.engineHigh = null;
      this.engineMidGain = null;
      this.engineHighGain = null;
      this.engineNoise = null;
      this.engineNoiseFilter = null;
      this.engineNoiseGain = null;
      this.smoothEngineFrequency = 48;
      this.smoothEngineVolume = 0;
      this.smoothThrottle = 0;
      this.enginePulsePhase = 0;
      this.effectDuck = 0;
      this.voices = [];
    }
    ensureStarted() {
      if (this.disabled) return false;
      if (!this.context) {
        this.context = createCompatibleAudioContext();
        if (!this.context) {
          this.disabled = true;
          return false;
        }
      }
      if (this.context.state === "suspended" && typeof this.context.resume === "function") {
        try {
          const resumeResult = this.context.resume();
          if (resumeResult && typeof resumeResult.catch === "function") resumeResult.catch(() => {
          });
        } catch (error) {
        }
      }
      if (!this.started) {
        try {
          const context2 = this.context;
          this.masterGain = context2.createGain();
          this.engineGain = context2.createGain();
          this.engineMidGain = context2.createGain();
          this.engineHighGain = context2.createGain();
          this.engineNoiseGain = context2.createGain();
          this.engineFilter = context2.createBiquadFilter();
          this.engineNoiseFilter = context2.createBiquadFilter();
          this.engineLow = context2.createOscillator();
          this.engineMid = context2.createOscillator();
          this.engineHigh = context2.createOscillator();
          this.engineNoise = createLoopingNoiseSource(context2);
          setAudioParam(this.masterGain.gain, 0.46);
          setAudioParam(this.engineGain.gain, 1e-4);
          setAudioParam(this.engineMidGain.gain, 0.07);
          setAudioParam(this.engineHighGain.gain, 0.018);
          setAudioParam(this.engineNoiseGain.gain, 1e-4);
          try {
            this.engineFilter.type = "lowpass";
          } catch (error) {
          }
          setAudioParam(this.engineFilter.frequency, 520);
          setAudioParam(this.engineFilter.Q, 0.72);
          try {
            this.engineNoiseFilter.type = "bandpass";
          } catch (error) {
          }
          setAudioParam(this.engineNoiseFilter.frequency, 720);
          setAudioParam(this.engineNoiseFilter.Q, 0.85);
          try {
            this.engineLow.type = "triangle";
          } catch (error) {
          }
          try {
            this.engineMid.type = "sawtooth";
          } catch (error) {
          }
          try {
            this.engineHigh.type = "triangle";
          } catch (error) {
          }
          setAudioParam(this.engineLow.frequency, this.smoothEngineFrequency);
          setAudioParam(this.engineMid.frequency, this.smoothEngineFrequency * 2.02);
          setAudioParam(this.engineHigh.frequency, this.smoothEngineFrequency * 4.07);
          this.engineLow.connect(this.engineFilter);
          this.engineMid.connect(this.engineMidGain);
          this.engineMidGain.connect(this.engineFilter);
          this.engineHigh.connect(this.engineHighGain);
          this.engineHighGain.connect(this.engineFilter);
          if (this.engineNoise) {
            this.engineNoise.connect(this.engineNoiseFilter);
            this.engineNoiseFilter.connect(this.engineNoiseGain);
            this.engineNoiseGain.connect(this.engineGain);
          }
          this.engineFilter.connect(this.engineGain);
          this.engineGain.connect(this.masterGain);
          this.masterGain.connect(context2.destination);
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
    }
    addTone(type, duration, startFrequency, endFrequency, volume) {
      if (!this.ensureStarted()) return;
      const context2 = this.context;
      const masterGain = this.masterGain;
      if (!context2 || !masterGain) return;
      try {
        const oscillator = context2.createOscillator();
        const gain = context2.createGain();
        try {
          oscillator.type = type;
        } catch (error) {
        }
        setAudioParam(oscillator.frequency, startFrequency);
        setAudioParam(gain.gain, 1e-4);
        oscillator.connect(gain);
        gain.connect(masterGain);
        safelyStartNode(oscillator);
        while (this.voices.length >= MAX_VOICES) {
          const oldest = this.voices.shift();
          safelyStopNode(oldest == null ? void 0 : oldest.oscillator);
          safelyStopNode(oldest == null ? void 0 : oldest.gain);
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
      } catch (error) {
      }
    }
    playLaneChange(direction) {
      const directionLift = direction > 0 ? 16 : -16;
      this.effectDuck = Math.max(this.effectDuck, 0.22);
      this.addTone("triangle", 0.065, 330 + directionLift, 205 + directionLift, 0.04);
      this.addTone("sine", 0.045, 510 + directionLift, 350 + directionLift, 0.01);
    }
    playOvertake(combo, count = 1) {
      const withinBlock = Math.max(0, combo - 1) % 10;
      const notePattern = [0, 2, 3, 5, 7, 8, 10, 12, 10, 12];
      const tier = Math.min(7, Math.floor(Math.max(0, combo - 1) / 10));
      const semitones = notePattern[withinBlock] + tier * 0.34;
      const baseFrequency = Math.min(760, 305 * Math.pow(2, semitones / 12));
      const volume = Math.min(0.064, 0.046 + Math.max(0, count - 1) * 6e-3);
      this.effectDuck = Math.max(this.effectDuck, 0.25);
      this.addTone("triangle", 0.07, baseFrequency * 0.95, baseFrequency, volume);
      this.addTone("sine", 0.046, baseFrequency * 1.45, baseFrequency * 1.49, volume * 0.12);
    }
    playSpeedTierUp(tier) {
      const start = Math.min(250, 118 + tier * 9);
      const end = Math.min(390, start * 1.42);
      this.effectDuck = Math.max(this.effectDuck, 0.18);
      this.addTone("sawtooth", 0.145, start, end, 0.036);
      this.addTone("triangle", 0.11, start * 1.95, end * 1.74, 0.018);
    }
    update(dt, snapshot) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      if (!this.started || this.disabled) return;
      const tierMultiplier = TIER_RPM_MULTIPLIER[snapshot.tier];
      const throttleTarget = snapshot.throttle && snapshot.state !== "CRASHED" ? 1 : 0;
      const throttleResponse = throttleTarget > this.smoothThrottle ? 8 : 4.6;
      this.smoothThrottle += (throttleTarget - this.smoothThrottle) * (1 - Math.exp(-dt * throttleResponse));
      const speedInsideBand = clamp(
        (snapshot.speed - snapshot.cruiseSpeed) / Math.max(1, snapshot.throttleMaxSpeed - snapshot.cruiseSpeed),
        0,
        1
      );
      const revAmount = clamp(this.smoothThrottle * 0.74 + speedInsideBand * 0.26, 0, 1);
      let targetFrequency = 48 * tierMultiplier * (1 + revAmount * 0.26);
      if (snapshot.state === "CRASHED") targetFrequency = 36;
      if (snapshot.state === "RECOVERING") targetFrequency *= 0.82;
      const engineResponse = 1 - Math.exp(-dt * 6.6);
      this.smoothEngineFrequency += (targetFrequency - this.smoothEngineFrequency) * engineResponse;
      const speedRatio = clamp(snapshot.speed / snapshot.maxSpeed, 0, 1);
      let targetVolume = 0.016 + snapshot.tier * 1e-3 + revAmount * 0.01 + speedRatio * 0.012;
      if (snapshot.state === "CRASHED") targetVolume = 35e-4;
      if (snapshot.state === "RECOVERING") targetVolume *= 0.72;
      this.smoothEngineVolume += (targetVolume - this.smoothEngineVolume) * (1 - Math.exp(-dt * 8));
      const pulseRate = 7.2 + snapshot.tier * 0.72 + revAmount * 6.4;
      this.enginePulsePhase = (this.enginePulsePhase + dt * pulseRate) % 1;
      const pulseWave = Math.max(0, Math.sin(this.enginePulsePhase * Math.PI * 2));
      const pulse = 0.82 + Math.pow(pulseWave, 3.2) * 0.18;
      this.effectDuck = Math.max(0, this.effectDuck - dt * 3.6);
      const duck = 1 - this.effectDuck * 0.28;
      setAudioParam((_a = this.engineLow) == null ? void 0 : _a.frequency, this.smoothEngineFrequency);
      setAudioParam((_b = this.engineMid) == null ? void 0 : _b.frequency, this.smoothEngineFrequency * (2.01 + revAmount * 0.035));
      setAudioParam((_c = this.engineHigh) == null ? void 0 : _c.frequency, this.smoothEngineFrequency * (4.03 + revAmount * 0.11));
      setAudioParam((_d = this.engineMidGain) == null ? void 0 : _d.gain, 0.052 + revAmount * 0.035 + speedRatio * 0.01);
      setAudioParam((_e = this.engineHighGain) == null ? void 0 : _e.gain, 0.012 + revAmount * 0.018);
      setAudioParam((_f = this.engineGain) == null ? void 0 : _f.gain, this.smoothEngineVolume * pulse * duck);
      setAudioParam((_g = this.engineFilter) == null ? void 0 : _g.frequency, 330 + snapshot.tier * 46 + revAmount * 740 + speedRatio * 260);
      setAudioParam((_h = this.engineNoiseFilter) == null ? void 0 : _h.frequency, 560 + snapshot.tier * 65 + revAmount * 920 + speedRatio * 380);
      setAudioParam((_i = this.engineNoiseGain) == null ? void 0 : _i.gain, (3e-3 + revAmount * 0.01 + speedRatio * 9e-3) * duck);
      for (let index = this.voices.length - 1; index >= 0; index--) {
        const voice = this.voices[index];
        voice.elapsed += dt;
        const t = clamp(voice.elapsed / voice.duration, 0, 1);
        const attack = Math.min(1, t / 0.1);
        const decay = Math.pow(1 - t, 1.7);
        const envelope = attack * decay;
        const frequency = voice.startFrequency + (voice.endFrequency - voice.startFrequency) * t;
        setAudioParam(voice.oscillator.frequency, frequency);
        setAudioParam(voice.gain.gain, Math.max(1e-4, voice.volume * envelope));
        if (t >= 1) {
          safelyStopNode(voice.oscillator);
          safelyStopNode(voice.gain);
          this.voices.splice(index, 1);
        }
      }
    }
    suspend() {
      if (!this.context || typeof this.context.suspend !== "function") return;
      try {
        const result = this.context.suspend();
        if (result && typeof result.catch === "function") result.catch(() => {
        });
      } catch (error) {
      }
    }
    resume() {
      if (!this.started) return;
      this.ensureStarted();
    }
  };
  var audio = new AudioEngine();

  // src/player.ts
  function laneInputStateAllows() {
    return player.state !== "CRASHED";
  }
  function requestLaneChange(direction) {
    if (!laneInputStateAllows()) return;
    audio.ensureStarted();
    const target = Math.max(0, Math.min(LANE_COUNT - 1, player.lane + direction));
    if (target === player.lane) return;
    audio.playLaneChange(direction);
    player.laneFrom = player.visualLane;
    player.laneTo = target;
    player.lane = target;
    player.laneChangeElapsed = 1e-4;
    if (player.state === "NORMAL" || player.state === "CHANGING_LANE") {
      player.state = "CHANGING_LANE";
    }
  }
  function setThrottle(active) {
    inputState.throttle = Boolean(active);
    if (inputState.throttle) audio.ensureStarted();
  }
  function beginCollision() {
    if (player.invincible > 0 || player.state === "CRASHED") return;
    player.state = "CRASHED";
    player.stateElapsed = 0;
    player.speed = 0;
    player.invincible = tuning.profile.invincibleSeconds;
    player.combo = 0;
    player.tierBoostElapsed = 0;
    player.collisionCount += 1;
    vibrate("medium");
  }
  function updatePlayer(dt) {
    player.previousDistance = player.distance;
    player.previousVisualLane = player.visualLane;
    player.invincible = Math.max(0, player.invincible - dt);
    player.tierBoostElapsed = Math.max(0, player.tierBoostElapsed - dt);
    player.passPopElapsed += dt;
    if (Number.isFinite(player.fireball)) player.fireball = Math.max(0, player.fireball - dt);
    if (player.laneChangeElapsed > 0) {
      player.laneChangeElapsed += dt;
      const t = Math.min(1, player.laneChangeElapsed / CHANGE_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      player.visualLane = player.laneFrom + (player.laneTo - player.laneFrom) * eased;
      if (t >= 1) {
        player.visualLane = player.laneTo;
        player.laneChangeElapsed = 0;
        if (player.state === "CHANGING_LANE") player.state = "NORMAL";
      }
    }
    if (player.state === "CRASHED") {
      player.stateElapsed += dt;
      player.speed = 0;
      if (player.stateElapsed >= 0.35) {
        player.state = "RECOVERING";
        player.stateElapsed = 0;
      }
    } else if (player.state === "RECOVERING") {
      player.stateElapsed += dt;
      const t = Math.min(1, player.stateElapsed / 0.7);
      player.speed = baseCruiseSpeed() * t;
      if (t >= 1) {
        player.speed = baseCruiseSpeed();
        player.state = "NORMAL";
        player.stateElapsed = 0;
      }
    } else {
      const targetSpeed = currentTargetSpeed();
      const acceleration = player.tierBoostElapsed > 0 ? PLAYER_TIER_ACCELERATION : PLAYER_ACCELERATION;
      const rate = targetSpeed >= player.speed ? acceleration : PLAYER_COAST_DECELERATION;
      player.speed = moveToward(player.speed, targetSpeed, rate * dt);
    }
    const before = player.distance;
    player.distance = advanceDistanceAtRoadSpeed(player.distance, player.speed, dt, player.visualLane);
    player.travelled += Math.max(0, player.distance - before);
  }

  // src/modes/ghostLane.ts
  var SWITCH_SECONDS = 4.5;
  var WARNING_SECONDS = 1.2;
  var timer = 0;
  var nextLane = 0;
  var ghostLane = {
    id: "ghost-lane",
    name: "GHOST LANE",
    rule: "每隔几秒一条车道带电 · 提前 1.2 秒预警",
    timeLimit: 60,
    scoreUnit: "PASSES",
    trafficScale: 1,
    trackId: "marina-sprint",
    stars: [10, 20, 33],
    setup() {
      timer = SWITCH_SECONDS;
      nextLane = Math.floor(Math.random() * LANE_COUNT);
      effects.hazardLane = -1;
    },
    update(dt, run2) {
      timer -= dt;
      if (timer <= 0) {
        effects.hazardLane = nextLane;
        let candidate = Math.floor(Math.random() * LANE_COUNT);
        if (candidate === nextLane) candidate = (candidate + 1) % LANE_COUNT;
        nextLane = candidate;
        timer = SWITCH_SECONDS;
      } else if (timer <= WARNING_SECONDS) {
        effects.hazardLane = nextLane;
      }
      const live = timer > WARNING_SECONDS;
      if (live && effects.hazardLane >= 0 && Math.abs(player.visualLane - effects.hazardLane) < 0.45 && player.state !== "CRASHED" && player.invincible <= 0) {
        run2.banner = "ZAPPED";
        run2.bannerTimer = 1;
        beginCollision();
      }
      run2.score = player.totalPasses;
      run2.progress = Math.max(0, Math.min(1, timer / SWITCH_SECONDS));
    }
  };

  // src/modes/hotRods.ts
  var HEAT_RISE_SECONDS = 3.2;
  var HEAT_FALL_SECONDS = 2;
  var hotRods = {
    id: "hot-rods",
    name: "HOT RODS",
    rule: "油门会过热 · 限时 60 秒跑出最远距离",
    timeLimit: 60,
    scoreUnit: "METRES",
    trafficScale: 1,
    trackId: "switchback",
    stars: [4e3, 8200, 12500],
    setup() {
      player.heat = 0;
    },
    update(dt, run2) {
      if (player.state === "CRASHED") {
        player.heat = Math.max(0, player.heat - dt / HEAT_FALL_SECONDS);
      } else if (inputState.throttle) {
        player.heat = Math.min(1, player.heat + dt / HEAT_RISE_SECONDS);
        if (player.heat >= 1) {
          player.heat = 0;
          run2.banner = "ENGINE BLOWN";
          run2.bannerTimer = 1.2;
          beginCollision();
        }
      } else {
        player.heat = Math.max(0, player.heat - dt / HEAT_FALL_SECONDS);
      }
      run2.score = Math.floor(player.travelled);
      run2.progress = player.heat;
    }
  };

  // src/modes/inTheZone.ts
  var ZONE_COUNT = 6;
  var ZONE_NEAR = 13;
  var ZONE_FAR = 66;
  var ZONE_LANE_TOLERANCE = 0.7;
  var ZONE_FILL_SECONDS = 2;
  var inTheZone = {
    id: "in-the-zone",
    name: "IN THE ZONE",
    rule: `跟住 ${ZONE_COUNT} 辆标记车尾流 · 待满即清除`,
    timeLimit: 75,
    scoreUnit: "POINTS",
    trafficScale: 0.9,
    trackId: "switchback",
    stars: [1e3, 2100, 3300],
    setup(_run, cars) {
      const stride = Math.max(1, Math.floor(cars.length / ZONE_COUNT));
      cars.forEach((car) => {
        car.hasZone = false;
        car.zoneFill = 0;
      });
      for (let i = 0; i < ZONE_COUNT; i++) {
        const car = cars[i * stride % cars.length];
        if (car) car.hasZone = true;
      }
    },
    update(dt, run2, cars) {
      let cleared = 0;
      let marked = 0;
      for (const car of cars) {
        if (!car.alive) continue;
        if (!car.hasZone) {
          if (car.zoneFill >= 1) cleared += 1;
          continue;
        }
        marked += 1;
        const gap = forwardPathDistance(player.distance, car.distance);
        const inBand = gap > ZONE_NEAR && gap < ZONE_FAR;
        const inLane = Math.abs(player.visualLane - car.visualLane) < ZONE_LANE_TOLERANCE;
        if (inBand && inLane && player.state !== "CRASHED") {
          car.zoneFill = Math.min(1, car.zoneFill + dt / ZONE_FILL_SECONDS);
          if (car.zoneFill >= 1) {
            car.hasZone = false;
            run2.banner = "ZONE CLEAR";
            run2.bannerTimer = 0.9;
          }
        } else {
          car.zoneFill = Math.max(0, car.zoneFill - dt * 0.55);
        }
      }
      run2.score = cleared * 500 + Math.max(0, Math.floor(run2.timeRemaining)) * 5;
      run2.progress = Math.min(1, cleared / Math.max(1, cleared + marked));
    },
    cleared(_run, cars) {
      return cars.every((car) => !car.hasZone);
    }
  };

  // src/modes/lastMan.ts
  var CULL_INTERVAL = 4;
  var timer2 = 0;
  var lastMan = {
    id: "last-man",
    name: "LAST MAN",
    rule: "对手每 4 秒自爆一辆 · 车越少分越难拿",
    timeLimit: 75,
    scoreUnit: "PASSES",
    trafficScale: 0.95,
    trackId: "marina-sprint",
    stars: [12, 24, 38],
    setup() {
      timer2 = CULL_INTERVAL;
    },
    update(dt, run2, cars) {
      timer2 -= dt;
      if (timer2 <= 0) {
        timer2 = CULL_INTERVAL;
        const alive2 = cars.filter((car) => car.alive);
        if (alive2.length > 2) {
          const victim = alive2[Math.floor(Math.random() * alive2.length)];
          victim.alive = false;
          victim.wreck = 1;
          run2.banner = `${alive2.length - 1} LEFT`;
          run2.bannerTimer = 0.8;
        }
      }
      run2.score = player.totalPasses;
      const alive = cars.filter((car) => car.alive).length;
      run2.progress = cars.length === 0 ? 0 : alive / cars.length;
    }
  };

  // src/modes/paceSetter.ts
  var BAND_HALF_WIDTH = 26;
  var BAND_MIN = 150;
  var BAND_MAX = 430;
  var BAND_PERIOD = 13;
  var inBandSeconds = 0;
  function paceTarget(elapsed) {
    const t = (Math.sin(elapsed / BAND_PERIOD * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    return BAND_MIN + (BAND_MAX - BAND_MIN) * t;
  }
  var paceSetter = {
    id: "pace-setter",
    name: "PACE SETTER",
    rule: "把车速保持在移动的目标区间内 · 计时 60 秒",
    timeLimit: 60,
    scoreUnit: "POINTS",
    trafficScale: 0.85,
    trackId: "grand-oval",
    stars: [1200, 2600, 4100],
    setup() {
      inBandSeconds = 0;
    },
    update(dt, run2) {
      const target = paceTarget(run2.elapsed);
      const delta = Math.abs(player.speed - target);
      const inside = delta <= BAND_HALF_WIDTH && player.state !== "CRASHED";
      if (inside) inBandSeconds += dt;
      run2.score = Math.floor(inBandSeconds * 100);
      run2.progress = Math.max(0, 1 - delta / (BAND_HALF_WIDTH * 3));
    }
  };

  // src/modes/rushHour.ts
  var RAMP_PER_SECOND2 = 0.011;
  var baseline2 = [];
  var rushHour = {
    id: "rush-hour",
    name: "RUSH HOUR",
    rule: "车流持续提速 · 撑满 75 秒超越尽可能多的车",
    timeLimit: 75,
    scoreUnit: "PASSES",
    trafficScale: 0.8,
    trackId: "grand-oval",
    stars: [18, 33, 50],
    setup(_run, cars) {
      baseline2 = cars.map((car) => car.baseSpeed);
    },
    update(_dt, run2, cars) {
      const ramp = 1 + run2.elapsed * RAMP_PER_SECOND2;
      cars.forEach((car, index) => {
        const original = baseline2[index];
        if (original !== void 0) car.baseSpeed = original * ramp;
      });
      run2.score = player.totalPasses;
      run2.progress = Math.min(1, (ramp - 1) / (RAMP_PER_SECOND2 * 75));
    }
  };

  // src/modes/slipstream.ts
  var TUCK_NEAR = 11;
  var TUCK_FAR = 30;
  var CHARGE_SECONDS = 1.6;
  var charge = 0;
  var slipstream = {
    id: "slipstream",
    name: "SLIPSTREAM",
    rule: "贴住前车尾流蓄力 · 满蓄时超车得双倍分",
    timeLimit: 60,
    scoreUnit: "POINTS",
    trafficScale: 0.95,
    trackId: "switchback",
    stars: [1400, 3e3, 5e3],
    setup() {
      charge = 0;
    },
    update(dt, run2, cars) {
      let tucked = false;
      for (const car of cars) {
        if (!car.alive) continue;
        const gap = forwardPathDistance(player.distance, car.distance);
        if (gap > TUCK_NEAR && gap < TUCK_FAR && Math.abs(player.visualLane - car.visualLane) < 0.6) {
          tucked = true;
          break;
        }
      }
      charge = tucked ? Math.min(1, charge + dt / CHARGE_SECONDS) : Math.max(0, charge - dt * 0.35);
      run2.progress = charge;
    },
    onOvertake(count, run2) {
      const multiplier = charge >= 1 ? 2 : 1;
      if (multiplier === 2) {
        run2.banner = "SLIPSTREAM x2";
        run2.bannerTimer = 0.8;
        charge = 0;
      }
      run2.score += count * 100 * multiplier;
    },
    onCrash(run2) {
      charge = 0;
      run2.banner = "SPUN OUT";
      run2.bannerTimer = 0.9;
    }
  };

  // src/modes/speedMonkey.ts
  var speedMonkey = {
    id: "speed-monkey",
    name: "SPEED MONKEY",
    rule: "速度只增不减 · 撞一次就结束",
    timeLimit: Infinity,
    scoreUnit: "COMBO",
    trafficScale: 1,
    trackId: "long-bay",
    stars: [10, 26, 48],
    update(_dt, run2) {
      run2.progress = -1;
      if (player.combo > run2.score) run2.score = player.combo;
    },
    onCrash(run2) {
      run2.outcome = "wrecked";
    }
  };

  // src/modes/sundayDrivers.ts
  var sundayDrivers = {
    id: "sunday-drivers",
    name: "SUNDAY DRIVERS",
    rule: "车流极慢 · 限时 60 秒超越尽可能多的车",
    timeLimit: 60,
    scoreUnit: "PASSES",
    trafficScale: 0.42,
    trackId: "grand-oval",
    stars: [30, 55, 82],
    update(_dt, run2) {
      run2.score = player.totalPasses;
      run2.progress = -1;
    },
    onCrash(run2) {
      run2.banner = `CRASH x${run2.crashes}`;
      run2.bannerTimer = 0.9;
    }
  };

  // src/modes/timeAttack.ts
  var LAPS = 3;
  var startDistance = 0;
  var timeAttack = {
    id: "time-attack",
    name: "TIME ATTACK",
    rule: `跑完 ${LAPS} 圈 · 用时越短越好`,
    timeLimit: 180,
    scoreUnit: "SECONDS",
    trafficScale: 0.9,
    trackId: "grand-oval",
    stars: [95, 80, 68],
    lowerIsBetter: true,
    setup() {
      startDistance = player.distance;
    },
    update(_dt, run2) {
      const lapsDone = (player.distance - startDistance) / arc.total;
      run2.progress = Math.min(1, lapsDone / LAPS);
      run2.score = Math.round(run2.elapsed * 10) / 10;
    },
    cleared() {
      return (player.distance - startDistance) / arc.total >= LAPS;
    }
  };

  // src/modes/index.ts
  var MODES = [
    speedMonkey,
    comboRacers,
    sundayDrivers,
    fireballFrenzy,
    deathRace,
    inTheZone,
    hotRods,
    slipstream,
    ghostLane,
    rushHour,
    paceSetter,
    lastMan,
    chainReaction,
    blackout,
    timeAttack,
    endurance
  ];
  var ORIGINAL_MODE_IDS = /* @__PURE__ */ new Set([
    "speed-monkey",
    "combo-racers",
    "sunday-drivers",
    "fireball-frenzy",
    "death-race",
    "in-the-zone",
    "hot-rods"
  ]);
  var BY_ID2 = new Map(MODES.map((mode) => [mode.id, mode]));
  function modeById(id) {
    const mode = BY_ID2.get(id);
    if (!mode) throw new Error(`unknown mode: ${id}`);
    return mode;
  }

  // src/storage.ts
  var STORAGE_KEY = "harbor-loop-bests-v1";
  var cache = null;
  function readRaw() {
    try {
      const anyWx = wx;
      if (typeof anyWx.getStorageSync === "function") {
        const value = anyWx.getStorageSync(STORAGE_KEY);
        return typeof value === "string" && value ? value : null;
      }
    } catch (error) {
    }
    try {
      if (typeof localStorage !== "undefined") return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
    }
    return null;
  }
  function writeRaw(value) {
    try {
      const anyWx = wx;
      if (typeof anyWx.setStorageSync === "function") {
        anyWx.setStorageSync(STORAGE_KEY, value);
        return;
      }
    } catch (error) {
    }
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
    }
  }
  function table() {
    if (cache) return cache;
    const raw = readRaw();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          cache = parsed;
          return cache;
        }
      } catch (error) {
      }
    }
    cache = {};
    return cache;
  }
  function key(modeId, difficulty) {
    return `${modeId}:${difficulty}`;
  }
  function bestScore(modeId, difficulty) {
    const value = table()[key(modeId, difficulty)];
    return typeof value === "number" ? value : null;
  }
  function submitScore(modeId, difficulty, score, lowerIsBetter) {
    const current = bestScore(modeId, difficulty);
    const improved = current === null || (lowerIsBetter ? score < current : score > current);
    if (!improved) return false;
    table()[key(modeId, difficulty)] = score;
    writeRaw(JSON.stringify(table()));
    return true;
  }
  function careerPoints() {
    return Object.entries(table()).reduce((total, [entryKey, value]) => {
      if (entryKey.startsWith("time-attack:")) return total;
      return total + (typeof value === "number" ? value : 0);
    }, 0);
  }

  // src/progress.ts
  var MAX_STARS_PER_ENTRY = 3;
  var unlockOverride = false;
  function setUnlockOverride(value) {
    unlockOverride = value;
  }
  var STARTING_MODE_COUNT = 3;
  var MODE_UNLOCK_COST = [3, 6, 10, 14, 19, 24, 30, 36, 43, 50, 58, 66, 75];
  var DIFFICULTY_UNLOCK_COST = {
    normal: 0,
    turbo: 6,
    master: 20
  };
  var DIFFICULTY_STAR_SCALE = {
    normal: 1,
    turbo: 1.15,
    master: 1.3
  };
  function starTarget(mode, tier, difficulty) {
    const base = mode.stars[tier];
    const scale2 = DIFFICULTY_STAR_SCALE[difficulty];
    return mode.lowerIsBetter ? base / scale2 : base * scale2;
  }
  function starsFor(modeId, difficulty) {
    const best2 = bestScore(modeId, difficulty);
    if (best2 === null) return 0;
    const mode = modeById(modeId);
    let earned = 0;
    for (let tier = 0; tier < MAX_STARS_PER_ENTRY; tier++) {
      const target = starTarget(mode, tier, difficulty);
      const reached = mode.lowerIsBetter ? best2 <= target : best2 >= target;
      if (reached) earned = tier + 1;
    }
    return earned;
  }
  function totalStars() {
    let total = 0;
    for (const mode of MODES) {
      for (const difficulty of DIFFICULTIES) {
        total += starsFor(mode.id, difficulty);
      }
    }
    return total;
  }
  function maxStars() {
    return MODES.length * DIFFICULTIES.length * MAX_STARS_PER_ENTRY;
  }
  function modeUnlockCost(modeId) {
    var _a;
    const index = MODES.findIndex((mode) => mode.id === modeId);
    if (index < STARTING_MODE_COUNT) return 0;
    return (_a = MODE_UNLOCK_COST[index - STARTING_MODE_COUNT]) != null ? _a : 0;
  }
  function modeUnlocked(modeId, stars = totalStars()) {
    return unlockOverride || stars >= modeUnlockCost(modeId);
  }
  function difficultyUnlockCost(difficulty) {
    return DIFFICULTY_UNLOCK_COST[difficulty];
  }
  function difficultyUnlocked(difficulty, stars = totalStars()) {
    return unlockOverride || stars >= DIFFICULTY_UNLOCK_COST[difficulty];
  }
  function nextUnlock() {
    const stars = totalStars();
    for (const difficulty of DIFFICULTIES) {
      const cost = DIFFICULTY_UNLOCK_COST[difficulty];
      if (stars < cost) return { label: DIFFICULTY_PROFILES[difficulty].label, cost };
    }
    for (const mode of MODES) {
      const cost = modeUnlockCost(mode.id);
      if (stars < cost) return { label: mode.name, cost };
    }
    return null;
  }
  function nextStarTarget(modeId, difficulty) {
    const mode = modeById(modeId);
    const earned = starsFor(modeId, difficulty);
    if (earned >= MAX_STARS_PER_ENTRY) return null;
    return Math.round(starTarget(mode, earned, difficulty));
  }

  // src/run.ts
  var run = {
    modeId: MODES[0].id,
    difficulty: "normal",
    elapsed: 0,
    timeRemaining: Infinity,
    score: 0,
    destroyed: 0,
    crashes: 0,
    outcome: "running",
    progress: -1,
    banner: "",
    bannerTimer: 0
  };
  var activeMode = MODES[0];
  function startRun(modeId, difficulty) {
    var _a;
    activeMode = modeById(modeId);
    setTrack(activeMode.trackId);
    applyTuning(difficulty, activeMode.trafficScale);
    resetGame();
    resetEffects();
    run.modeId = modeId;
    run.difficulty = difficulty;
    run.elapsed = 0;
    run.timeRemaining = activeMode.timeLimit;
    run.score = 0;
    run.destroyed = 0;
    run.crashes = 0;
    run.outcome = "running";
    run.progress = -1;
    run.banner = "";
    run.bannerTimer = 0;
    (_a = activeMode.setup) == null ? void 0 : _a.call(activeMode, run, aiCars);
  }
  function updateRun(dt) {
    var _a, _b, _c;
    if (run.outcome !== "running") return;
    run.elapsed += dt;
    if (Number.isFinite(run.timeRemaining)) {
      run.timeRemaining = Math.max(0, run.timeRemaining - dt);
    }
    run.bannerTimer = Math.max(0, run.bannerTimer - dt);
    if (run.bannerTimer <= 0) run.banner = "";
    (_a = activeMode.update) == null ? void 0 : _a.call(activeMode, dt, run, aiCars);
    if (run.outcome !== "running") return;
    if ((_b = activeMode.cleared) == null ? void 0 : _b.call(activeMode, run, aiCars)) run.outcome = "cleared";
    else if ((_c = activeMode.failed) == null ? void 0 : _c.call(activeMode, run, aiCars)) run.outcome = "wrecked";
    else if (run.timeRemaining <= 0) run.outcome = "timeout";
  }
  function runIsOver() {
    return run.outcome !== "running";
  }

  // src/app.ts
  var app = {
    screen: "MENU",
    difficulty: "normal",
    /** Pixels the mode list is scrolled by; only used when the list overflows. */
    menuScroll: 0,
    result: null
  };
  function openMenu() {
    app.screen = "MENU";
  }
  function startMode(modeId) {
    if (!modeUnlocked(modeId)) return false;
    startRun(modeId, app.difficulty);
    app.screen = "PLAYING";
    return true;
  }
  function retryRun() {
    const summary = app.result;
    if (summary) startRun(summary.modeId, summary.difficulty);
    else startMode(MODES[0].id);
    app.screen = "PLAYING";
  }
  function finishRun() {
    const mode = modeById(run.modeId);
    const lowerIsBetter = Boolean(mode.lowerIsBetter);
    const scoreCounts = run.score > 0 && !(lowerIsBetter && run.outcome !== "cleared");
    const newBest = scoreCounts && submitScore(run.modeId, run.difficulty, run.score, lowerIsBetter);
    app.result = {
      modeId: run.modeId,
      difficulty: run.difficulty,
      outcome: run.outcome,
      score: run.score,
      best: bestScore(run.modeId, run.difficulty),
      newBest,
      scoreUnit: mode.scoreUnit
    };
    if (newBest) submitFriendScore(careerPoints());
    app.screen = "RESULT";
  }

  // src/controls.ts
  var CONTROL_BAR_TOP = 738;
  var CONTROL_H = 72;
  var CONTROL_RADIUS = 18;
  var CONTROL_HIT_PADDING = 10;
  var CONTROL_FLASH_DURATION = 0.14;
  var CONTROLS = [
    { id: "left", kind: "lane", direction: 1, x: 20, w: 76 },
    { id: "right", kind: "lane", direction: -1, x: 104, w: 76 },
    { id: "throttle", kind: "throttle", direction: 0, x: 236, w: 134 }
  ].map((control) => __spreadProps(__spreadValues({}, control), { y: CONTROL_BAR_TOP, h: CONTROL_H }));
  function controlAtDesignPoint(x, y) {
    for (const control of CONTROLS) {
      if (x >= control.x - CONTROL_HIT_PADDING && x <= control.x + control.w + CONTROL_HIT_PADDING && y >= control.y - CONTROL_HIT_PADDING && y <= control.y + control.h + CONTROL_HIT_PADDING) {
        return control;
      }
    }
    return null;
  }
  var laneButtonFlash = {
    left: 0,
    right: 0
  };
  function updateControlFlash(dt) {
    laneButtonFlash.left = Math.max(0, laneButtonFlash.left - dt);
    laneButtonFlash.right = Math.max(0, laneButtonFlash.right - dt);
  }
  function flashLaneButton(id) {
    if (id === "throttle") return;
    laneButtonFlash[id] = CONTROL_FLASH_DURATION;
  }

  // src/theme.ts
  var COLORS = {
    water: "#163D52",
    waterDeep: "#102F42",
    waterLine: "rgba(255,255,255,0.045)",
    land: "#A8BE79",
    landLight: "#C0CF91",
    landDark: "#7F995F",
    roadShadow: "rgba(5,14,20,0.48)",
    roadEdge: "#20282D",
    curbLight: "#F1E9D7",
    curbRed: "#D86A59",
    road: "#626D73",
    roadHighlight: "rgba(255,255,255,0.045)",
    lane: "rgba(246,242,226,0.55)",
    player: "#F05A47",
    playerLight: "#FF8D73",
    playerStripe: "#FFF4D8",
    window: "#C8EDF1",
    ai: "#161B1E",
    aiLight: "#31383C",
    aiWindow: "#69777D",
    text: "#F7F4EA",
    muted: "rgba(247,244,234,0.66)",
    accent: "#57D5CB",
    accentLight: "#C5FFF7",
    button: "rgba(8,17,25,0.82)",
    buttonActive: "rgba(87,213,203,0.30)",
    buttonDisabled: "rgba(8,17,25,0.42)",
    buttonEdge: "rgba(247,244,234,0.28)"
  };
  var UI = {
    ground: "#12384E",
    groundDeep: "#0A2233",
    groundStripe: "rgba(255,255,255,0.028)",
    card: "#FFF6E4",
    cardAlt: "#FFEDCC",
    ink: "#22323F",
    inkSoft: "#6C7C88",
    outline: "#152532",
    primary: "#FFB43C",
    primaryDeep: "#E38C15",
    good: "#5FCF80",
    bad: "#FF6B5E",
    chip: "#1B3F55"
  };

  // src/render/primitives.ts
  function strokeClosedPath(points, width, color, dash = []) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.restore();
  }
  function roundRect(context2, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    context2.beginPath();
    context2.moveTo(x + radius, y);
    context2.arcTo(x + w, y, x + w, y + h, radius);
    context2.arcTo(x + w, y + h, x, y + h, radius);
    context2.arcTo(x, y + h, x, y, radius);
    context2.arcTo(x, y, x + w, y, radius);
    context2.closePath();
  }

  // src/render/hud.ts
  var BACK_BUTTON = { x: DESIGN_W - 52, y: 12, w: 40, h: 40 };
  function drawComboPill() {
    ctx.fillStyle = "rgba(8,17,25,0.66)";
    roundRect(ctx, 12, 12, 68, 42, 13);
    ctx.fill();
    ctx.fillStyle = player.combo > 0 ? COLORS.accentLight : COLORS.text;
    const tierPulse = player.tierBoostElapsed > 0 ? 1 + Math.sin((PLAYER_TIER_BOOST_DURATION - player.tierBoostElapsed) * Math.PI * 8) * 0.08 : 1;
    ctx.save();
    ctx.translate(46, 35);
    ctx.scale(tierPulse, tierPulse);
    ctx.font = "900 25px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`x${player.combo}`, 0, 5);
    ctx.restore();
  }
  function drawClockAndScore() {
    const mode = modeById(run.modeId);
    if (Number.isFinite(run.timeRemaining)) {
      const urgent = run.timeRemaining <= 10;
      ctx.fillStyle = "rgba(8,17,25,0.66)";
      roundRect(ctx, 88, 12, 74, 42, 13);
      ctx.fill();
      ctx.textAlign = "center";
      ctx.fillStyle = urgent ? "#FF7A6B" : COLORS.text;
      ctx.font = "900 22px monospace";
      ctx.fillText(run.timeRemaining.toFixed(1), 125, 41);
    }
    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.accentLight;
    ctx.font = "900 20px monospace";
    ctx.fillText(String(run.score), DESIGN_W - 60, 34);
    ctx.fillStyle = COLORS.muted;
    ctx.font = "700 8px sans-serif";
    ctx.fillText(mode.scoreUnit, DESIGN_W - 60, 46);
    ctx.textAlign = "center";
  }
  function drawBackButton() {
    roundRect(ctx, BACK_BUTTON.x, BACK_BUTTON.y, BACK_BUTTON.w, BACK_BUTTON.h, 12);
    ctx.fillStyle = COLORS.button;
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = COLORS.buttonEdge;
    ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.fillRect(BACK_BUTTON.x + 14, BACK_BUTTON.y + 12, 4, 16);
    ctx.fillRect(BACK_BUTTON.x + 22, BACK_BUTTON.y + 12, 4, 16);
  }
  function drawObjectiveBar() {
    if (run.progress < 0) return;
    const x = 12;
    const y = 62;
    const w = DESIGN_W - 24;
    const h = 6;
    roundRect(ctx, x, y, w, h, 3);
    ctx.fillStyle = "rgba(8,17,25,0.66)";
    ctx.fill();
    const filled = Math.max(0, Math.min(1, run.progress));
    if (filled > 0) {
      roundRect(ctx, x, y, w * filled, h, 3);
      ctx.fillStyle = COLORS.accent;
      ctx.fill();
    }
  }
  function drawBanner() {
    if (!run.banner || run.bannerTimer <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, run.bannerTimer * 2.4);
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.accentLight;
    ctx.font = "900 26px sans-serif";
    ctx.fillText(run.banner, DESIGN_W / 2, 372);
    ctx.restore();
  }
  function drawCrashBanner() {
    if (player.state !== "CRASHED") return;
    ctx.fillStyle = "rgba(255,79,82,0.92)";
    roundRect(ctx, 122, 390, 146, 54, 16);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 21px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CRASH!", 195, 420);
    ctx.font = "700 9px sans-serif";
    ctx.fillText("COMBO RESET", 195, 437);
  }
  function drawHud() {
    drawComboPill();
    drawClockAndScore();
    drawBackButton();
    drawObjectiveBar();
    drawCrashBanner();
    drawBanner();
  }
  function drawLaneArrow(cx, cy, direction, color) {
    const tip = direction > 0 ? -15 : 15;
    ctx.beginPath();
    ctx.moveTo(cx + tip, cy);
    ctx.lineTo(cx - tip * 0.6, cy - 15);
    ctx.lineTo(cx - tip * 0.6, cy + 15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  function drawControls() {
    for (const control of CONTROLS) {
      const active = control.kind === "throttle" ? inputState.throttle : laneButtonFlash[control.id] > 0;
      const cx = control.x + control.w * 0.5;
      const cy = control.y + control.h * 0.5;
      roundRect(ctx, control.x, control.y, control.w, control.h, CONTROL_RADIUS);
      ctx.fillStyle = COLORS.button;
      ctx.fill();
      if (active) {
        ctx.fillStyle = COLORS.buttonActive;
        ctx.fill();
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = active ? COLORS.accentLight : COLORS.buttonEdge;
      ctx.stroke();
      const glyph = active ? COLORS.accentLight : COLORS.text;
      if (control.kind === "lane") {
        drawLaneArrow(cx, cy, control.direction, glyph);
      } else {
        if (player.heat > 0) {
          const heatH = (control.h - 8) * Math.min(1, player.heat);
          roundRect(ctx, control.x + 4, control.y + control.h - 4 - heatH, control.w - 8, heatH, 12);
          ctx.fillStyle = player.heat > 0.75 ? "rgba(255,110,90,0.42)" : "rgba(255,181,90,0.26)";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(cx, cy - 19);
        ctx.lineTo(cx - 15, cy);
        ctx.lineTo(cx + 15, cy);
        ctx.closePath();
        ctx.fillStyle = glyph;
        ctx.fill();
        ctx.font = "900 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAS", cx, cy + 21);
      }
    }
  }

  // src/render/icons.ts
  function drawStar(cx, cy, radius, color, filled) {
    const inner = radius * 0.45;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? radius : inner;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }
  function drawLock(cx, cy, size, color) {
    const bodyW = size;
    const bodyH = size * 0.78;
    const bodyY = cy - bodyH / 2 + size * 0.16;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.4, size * 0.16);
    ctx.beginPath();
    ctx.arc(cx, bodyY, bodyW * 0.32, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(cx - bodyW / 2, bodyY, bodyW, bodyH);
    ctx.fill();
    ctx.restore();
  }

  // src/render/ui.ts
  function hits(rect, x, y) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }
  function panel(rect, style) {
    var _a, _b, _c, _d;
    const radius = (_a = style.radius) != null ? _a : 14;
    const lift = (_b = style.lift) != null ? _b : 4;
    const outline = (_c = style.outline) != null ? _c : UI.outline;
    if (lift > 0) {
      roundRect(ctx, rect.x, rect.y + lift, rect.w, rect.h, radius);
      ctx.fillStyle = outline;
      ctx.fill();
    }
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.lineWidth = (_d = style.outlineWidth) != null ? _d : 2.5;
    ctx.strokeStyle = outline;
    ctx.stroke();
  }
  var VARIANT_FILL = {
    primary: UI.primary,
    good: UI.good,
    plain: UI.card
  };
  function chunkyButton(rect, label, variant = "plain", size = 16) {
    panel(rect, { fill: VARIANT_FILL[variant], radius: Math.min(18, rect.h / 2), lift: 5 });
    ctx.textAlign = "center";
    ctx.fillStyle = UI.ink;
    ctx.font = `900 ${size}px sans-serif`;
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + size * 0.36);
  }
  function chip(rect, label, fill, textColor, size = 11) {
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, rect.h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.font = `900 ${size}px sans-serif`;
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + size * 0.36);
  }
  function headline(text, x, y, size, fill, align = "left") {
    ctx.textAlign = align;
    ctx.font = `900 ${size}px sans-serif`;
    ctx.fillStyle = UI.outline;
    ctx.fillText(text, x, y + 2.5);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
  }
  function screenBackground(width, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, UI.groundDeep);
    gradient.addColorStop(1, UI.ground);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.fillStyle = UI.groundStripe;
    for (let i = -height; i < width + height; i += 44) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 18, 0);
      ctx.lineTo(i + 18 + height, height);
      ctx.lineTo(i + height, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // src/screens/menu.ts
  var MARGIN = 14;
  var PILL_Y = 78;
  var PILL_H = 34;
  var LIST_TOP = 148;
  var ROW_H = 38;
  var ROW_GAP = 3;
  var toast = { text: "", timer: 0 };
  function updateMenu(dt) {
    toast.timer = Math.max(0, toast.timer - dt);
    if (toast.timer <= 0) toast.text = "";
  }
  function pillRect(index) {
    const w = (DESIGN_W - MARGIN * 2 - 12) / 3;
    return { x: MARGIN + index * (w + 6), y: PILL_Y, w, h: PILL_H };
  }
  function rowRect(index) {
    return {
      x: MARGIN,
      y: LIST_TOP + index * (ROW_H + ROW_GAP),
      w: DESIGN_W - MARGIN * 2,
      h: ROW_H
    };
  }
  function drawMenu() {
    screenBackground(DESIGN_W, DESIGN_H);
    const stars = totalStars();
    headline("HARBOR LOOP", MARGIN, 42, 28, UI.card);
    const starText = `${stars}/${maxStars()}`;
    ctx.font = "900 12px sans-serif";
    const starWidth = Math.max(78, ctx.measureText(starText).width + 42);
    const starChip = { x: DESIGN_W - MARGIN - starWidth, y: 22, w: starWidth, h: 26 };
    chip(starChip, "", UI.chip, UI.primary);
    drawStar(starChip.x + 17, starChip.y + 13, 7, UI.primary, true);
    ctx.textAlign = "left";
    ctx.fillStyle = UI.primary;
    ctx.font = "900 12px sans-serif";
    ctx.fillText(starText, starChip.x + 28, starChip.y + 17);
    const next = nextUnlock();
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,246,228,0.55)";
    ctx.font = "600 10px sans-serif";
    ctx.fillText(
      next ? `再拿 ${next.cost - stars} 颗星解锁 ${next.label}` : "全部模式和难度已解锁",
      MARGIN,
      60
    );
    DIFFICULTIES.forEach((difficulty, index) => {
      const rect = pillRect(index);
      const unlocked = difficultyUnlocked(difficulty, stars);
      const selected = app.difficulty === difficulty && unlocked;
      panel(rect, {
        fill: selected ? UI.primary : UI.chip,
        radius: rect.h / 2,
        lift: selected ? 4 : 2
      });
      ctx.textAlign = "center";
      if (!unlocked) {
        drawLock(rect.x + rect.w / 2 - 16, rect.y + rect.h / 2, 9, "rgba(255,246,228,0.5)");
        ctx.fillStyle = "rgba(255,246,228,0.5)";
        ctx.font = "900 11px sans-serif";
        ctx.fillText(`${difficultyUnlockCost(difficulty)}`, rect.x + rect.w / 2 + 10, rect.y + rect.h / 2 + 4);
        drawStar(rect.x + rect.w / 2 - 1, rect.y + rect.h / 2 - 1, 5, "rgba(255,246,228,0.5)", true);
      } else {
        ctx.fillStyle = selected ? UI.ink : UI.card;
        ctx.font = "900 13px sans-serif";
        ctx.fillText(DIFFICULTY_PROFILES[difficulty].label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 5);
      }
    });
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,246,228,0.72)";
    ctx.font = "600 11px sans-serif";
    ctx.fillText(DIFFICULTY_PROFILES[app.difficulty].blurb, DESIGN_W / 2, 130);
    MODES.forEach((mode, index) => {
      drawModeRow(mode.id, index, stars);
    });
    if (toast.text) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, toast.timer * 2.5);
      const width = 250;
      panel({ x: (DESIGN_W - width) / 2, y: DESIGN_H / 2 - 26, w: width, h: 52 }, {
        fill: UI.chip,
        radius: 14,
        lift: 4
      });
      ctx.textAlign = "center";
      ctx.fillStyle = UI.card;
      ctx.font = "900 13px sans-serif";
      ctx.fillText(toast.text, DESIGN_W / 2, DESIGN_H / 2 + 5);
      ctx.restore();
    }
    ctx.textAlign = "center";
  }
  function drawModeRow(modeId, index, stars) {
    const mode = MODES[index];
    const rect = rowRect(index);
    const unlocked = modeUnlocked(modeId, stars);
    const fromOriginal = ORIGINAL_MODE_IDS.has(modeId);
    panel(rect, {
      fill: unlocked ? fromOriginal ? UI.card : UI.cardAlt : "rgba(255,246,228,0.13)",
      radius: 11,
      lift: unlocked ? 3 : 1,
      outlineWidth: unlocked ? 2.5 : 1.4
    });
    if (!unlocked) {
      drawLock(rect.x + 22, rect.y + rect.h / 2, 11, "rgba(255,246,228,0.55)");
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,246,228,0.5)";
      ctx.font = "900 12px sans-serif";
      ctx.fillText(mode.name, rect.x + 40, rect.y + 24);
      ctx.textAlign = "right";
      ctx.fillStyle = UI.primary;
      ctx.font = "900 13px sans-serif";
      ctx.fillText(`${modeUnlockCost(modeId)}`, rect.x + rect.w - 14, rect.y + 25);
      drawStar(rect.x + rect.w - 30, rect.y + rect.h / 2 - 1, 6, UI.primary, true);
      return;
    }
    ctx.textAlign = "left";
    ctx.fillStyle = UI.ink;
    ctx.font = "900 13px sans-serif";
    ctx.fillText(mode.name, rect.x + 12, rect.y + 16);
    const nameWidth = ctx.measureText(mode.name).width;
    ctx.fillStyle = fromOriginal ? UI.primaryDeep : UI.good;
    ctx.font = "900 8px sans-serif";
    ctx.fillText(fromOriginal ? "PJ" : "NEW", rect.x + 17 + nameWidth, rect.y + 12);
    ctx.fillStyle = UI.inkSoft;
    ctx.font = "500 9.5px sans-serif";
    ctx.fillText(mode.rule, rect.x + 12, rect.y + 30);
    ctx.fillStyle = "rgba(34,50,63,0.34)";
    ctx.font = "700 7.5px sans-serif";
    ctx.fillText(trackById(mode.trackId).name, rect.x + 12, rect.y + 39.5);
    const earned = starsFor(modeId, app.difficulty);
    for (let i = 0; i < 3; i++) {
      drawStar(rect.x + rect.w - 66 + i * 15, rect.y + 14, 6, i < earned ? UI.primary : "rgba(34,50,63,0.18)", i < earned);
    }
    const best2 = bestScore(modeId, app.difficulty);
    ctx.textAlign = "right";
    if (best2 === null) {
      ctx.fillStyle = "rgba(34,50,63,0.3)";
      ctx.font = "900 10px monospace";
      ctx.fillText("--", rect.x + rect.w - 14, rect.y + 31);
    } else {
      ctx.fillStyle = UI.ink;
      ctx.font = "900 12px monospace";
      ctx.fillText(String(best2), rect.x + rect.w - 14, rect.y + 31);
    }
  }
  function handleMenuTap(x, y) {
    const stars = totalStars();
    for (let i = 0; i < DIFFICULTIES.length; i++) {
      if (!hits(pillRect(i), x, y)) continue;
      const difficulty = DIFFICULTIES[i];
      if (!difficultyUnlocked(difficulty, stars)) {
        showToast(`需要 ${difficultyUnlockCost(difficulty)} 颗星解锁`);
      } else {
        app.difficulty = difficulty;
      }
      return true;
    }
    for (let i = 0; i < MODES.length; i++) {
      if (!hits(rowRect(i), x, y)) continue;
      const mode = MODES[i];
      if (!modeUnlocked(mode.id, stars)) {
        showToast(`需要 ${modeUnlockCost(mode.id)} 颗星解锁`);
      } else {
        startMode(mode.id);
      }
      return true;
    }
    return false;
  }
  function showToast(text) {
    toast.text = text;
    toast.timer = 1.6;
  }

  // src/share.ts
  function shareTitle() {
    const summary = app.result;
    if (!summary) return "Harbor Loop — 16 种模式的像素赛车";
    const mode = modeById(summary.modeId);
    return `我在 ${mode.name}(${DIFFICULTY_LABEL[summary.difficulty]}) 拿了 ${summary.score} ${summary.scoreUnit}，来超我`;
  }
  function shareQuery() {
    const summary = app.result;
    if (!summary) return "";
    return `mode=${summary.modeId}&difficulty=${summary.difficulty}`;
  }
  function shareRun() {
    const api = wx;
    if (typeof api.shareAppMessage !== "function") return;
    try {
      api.shareAppMessage({ title: shareTitle(), query: shareQuery() });
    } catch (error) {
    }
  }
  function installShareMenu() {
    var _a, _b;
    const api = wx;
    try {
      (_a = api.showShareMenu) == null ? void 0 : _a.call(api, { withShareTicket: true });
      (_b = api.onShareAppMessage) == null ? void 0 : _b.call(api, () => ({ title: shareTitle(), query: shareQuery() }));
    } catch (error) {
    }
  }

  // src/screens/result.ts
  var MARGIN2 = 20;
  var CONTENT_W = DESIGN_W - MARGIN2 * 2;
  var SCORE_CARD = { x: MARGIN2, y: 96, w: CONTENT_W, h: 214 };
  var RANK_CARD = { x: MARGIN2, y: 328, w: CONTENT_W, h: 300 };
  var RETRY = { x: MARGIN2, y: 648, w: CONTENT_W, h: 56 };
  var SHARE = { x: MARGIN2, y: 716, w: CONTENT_W / 2 - 5, h: 50 };
  var MENU = { x: MARGIN2 + CONTENT_W / 2 + 5, y: 716, w: CONTENT_W / 2 - 5, h: 50 };
  var OUTCOME = {
    cleared: { text: "目标达成", fill: UI.good },
    timeout: { text: "时间到", fill: UI.primary },
    wrecked: { text: "撞毁", fill: UI.bad },
    running: { text: "", fill: UI.primary }
  };
  var rankingRequested = false;
  function enterResultScreen() {
    rankingRequested = false;
  }
  function drawResult() {
    var _a;
    const summary = app.result;
    if (!summary) return;
    const mode = modeById(summary.modeId);
    const outcome = (_a = OUTCOME[summary.outcome]) != null ? _a : OUTCOME.running;
    screenBackground(DESIGN_W, DESIGN_H);
    headline(mode.name, DESIGN_W / 2, 56, 24, UI.card, "center");
    ctx.font = "900 11px sans-serif";
    const diffLabel = DIFFICULTY_PROFILES[summary.difficulty].label;
    const diffWidth = Math.max(72, ctx.measureText(diffLabel).width + 32);
    chip(
      { x: (DESIGN_W - diffWidth) / 2, y: 66, w: diffWidth, h: 22 },
      diffLabel,
      UI.chip,
      UI.primary
    );
    panel(SCORE_CARD, { fill: UI.card, radius: 18, lift: 6 });
    ctx.textAlign = "center";
    ctx.fillStyle = outcome.fill;
    ctx.font = "900 17px sans-serif";
    ctx.fillText(outcome.text, DESIGN_W / 2, SCORE_CARD.y + 34);
    ctx.fillStyle = UI.ink;
    ctx.font = "900 70px monospace";
    ctx.fillText(String(summary.score), DESIGN_W / 2, SCORE_CARD.y + 116);
    ctx.fillStyle = UI.inkSoft;
    ctx.font = "900 11px sans-serif";
    ctx.fillText(summary.scoreUnit, DESIGN_W / 2, SCORE_CARD.y + 138);
    const earned = starsFor(summary.modeId, summary.difficulty);
    for (let i = 0; i < 3; i++) {
      drawStar(DESIGN_W / 2 - 34 + i * 34, SCORE_CARD.y + 162, 14, i < earned ? UI.primary : "rgba(34,50,63,0.16)", i < earned);
    }
    const target = nextStarTarget(summary.modeId, summary.difficulty);
    ctx.textAlign = "center";
    ctx.fillStyle = UI.inkSoft;
    ctx.font = "700 10px sans-serif";
    if (summary.newBest) {
      ctx.fillStyle = UI.primaryDeep;
      ctx.font = "900 11px sans-serif";
      ctx.fillText("NEW BEST!", DESIGN_W / 2, SCORE_CARD.y + 192);
    } else if (target !== null) {
      ctx.fillText(`下一颗星：${target} ${summary.scoreUnit}`, DESIGN_W / 2, SCORE_CARD.y + 192);
    } else if (summary.best !== null) {
      ctx.fillText(`BEST ${summary.best}`, DESIGN_W / 2, SCORE_CARD.y + 192);
    }
    drawRankingPanel();
    chunkyButton(RETRY, "再来一次", "primary", 18);
    chunkyButton(SHARE, "分享成绩", "good", 15);
    chunkyButton(MENU, "选择模式", "plain", 15);
  }
  function drawRankingPanel() {
    panel(RANK_CARD, { fill: UI.chip, radius: 16, lift: 5 });
    ctx.textAlign = "left";
    ctx.fillStyle = UI.card;
    ctx.font = "900 12px sans-serif";
    ctx.fillText("好友排行榜", RANK_CARD.x + 14, RANK_CARD.y + 26);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,246,228,0.45)";
    ctx.font = "600 9px sans-serif";
    ctx.fillText("按生涯积分排名", RANK_CARD.x + RANK_CARD.w - 14, RANK_CARD.y + 26);
    ctx.textAlign = "center";
    const listY = RANK_CARD.y + 38;
    const listH = RANK_CARD.h - 48;
    if (!leaderboardAvailable()) {
      ctx.fillStyle = "rgba(255,246,228,0.38)";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("好友榜仅在微信小游戏内可用", DESIGN_W / 2, RANK_CARD.y + RANK_CARD.h / 2);
      return;
    }
    if (!rankingRequested) {
      requestFriendRanking(RANK_CARD.w - 20, listH, DPR);
      rankingRequested = true;
    }
    const shared = sharedCanvas();
    if (shared) {
      try {
        ctx.drawImage(shared, RANK_CARD.x + 10, listY, RANK_CARD.w - 20, listH);
      } catch (error) {
      }
    }
  }
  function handleResultTap(x, y) {
    if (hits(RETRY, x, y)) {
      retryRun();
      return true;
    }
    if (hits(MENU, x, y)) {
      openMenu();
      return true;
    }
    if (hits(SHARE, x, y)) {
      shareRun();
      return true;
    }
    return false;
  }

  // src/input.ts
  var activePointers = /* @__PURE__ */ new Map();
  function refreshThrottleFromPointers() {
    let held = false;
    for (const assignment of activePointers.values()) {
      if (assignment === "throttle") {
        held = true;
        break;
      }
    }
    setThrottle(held);
  }
  function pressControl(control) {
    if (control.kind === "throttle") return;
    flashLaneButton(control.id);
    requestLaneChange(control.direction);
  }
  function pointerDown(pointerId, screenX, screenY) {
    const x = screenToDesignX(screenX);
    const y = screenToDesignY(screenY);
    if (app.screen === "MENU") {
      handleMenuTap(x, y);
      return;
    }
    if (app.screen === "RESULT") {
      handleResultTap(x, y);
      return;
    }
    if (x >= BACK_BUTTON.x && x <= BACK_BUTTON.x + BACK_BUTTON.w && y >= BACK_BUTTON.y && y <= BACK_BUTTON.y + BACK_BUTTON.h) {
      releaseAllPointers();
      openMenu();
      return;
    }
    const control = controlAtDesignPoint(x, y);
    if (control) {
      activePointers.set(pointerId, control.id);
      if (control.kind === "throttle") audio.ensureStarted();
      pressControl(control);
      refreshThrottleFromPointers();
      return;
    }
    activePointers.set(pointerId, "track");
    requestLaneChange(x < DESIGN_W * 0.5 ? 1 : -1);
  }
  function pointerMove(pointerId, screenX, screenY) {
    if (app.screen !== "PLAYING") return;
    if (!activePointers.has(pointerId)) return;
    const control = controlAtDesignPoint(screenToDesignX(screenX), screenToDesignY(screenY));
    const previous = activePointers.get(pointerId);
    if (control && control.kind === "throttle") {
      if (previous !== "throttle") audio.ensureStarted();
      activePointers.set(pointerId, "throttle");
    } else if (previous === "throttle") {
      activePointers.set(pointerId, "none");
    }
    refreshThrottleFromPointers();
  }
  function pointerUp(pointerId) {
    if (!activePointers.delete(pointerId)) return;
    refreshThrottleFromPointers();
  }
  function releaseAllPointers() {
    activePointers.clear();
    setThrottle(false);
  }
  function isThrottleKey(event) {
    const key2 = String(event.key || "").toLowerCase();
    const code = String(event.code || "");
    const keyCode = Number(event.keyCode || event.which || 0);
    return key2 === "arrowup" || key2 === "up" || key2 === "w" || key2 === " " || key2 === "spacebar" || code === "ArrowUp" || code === "KeyW" || code === "Space" || keyCode === 38 || keyCode === 87 || keyCode === 32;
  }
  function handleKeyboardInput(event) {
    if (app.screen !== "PLAYING") return;
    const key2 = String(event.key || "").toLowerCase();
    const code = String(event.code || "");
    const keyCode = Number(event.keyCode || event.which || 0);
    let handled = false;
    if (key2 === "arrowleft" || key2 === "left" || key2 === "a" || code === "ArrowLeft" || code === "KeyA" || keyCode === 37 || keyCode === 65) {
      requestLaneChange(1);
      handled = true;
    } else if (key2 === "arrowright" || key2 === "right" || key2 === "d" || code === "ArrowRight" || code === "KeyD" || keyCode === 39 || keyCode === 68) {
      requestLaneChange(-1);
      handled = true;
    } else if (isThrottleKey(event)) {
      setThrottle(true);
      handled = true;
    } else if (key2 === "r" || code === "KeyR" || keyCode === 82) {
      retryRun();
      handled = true;
    } else if (key2 === "escape" || code === "Escape" || keyCode === 27) {
      releaseAllPointers();
      openMenu();
      handled = true;
    }
    if (handled && typeof event.preventDefault === "function") event.preventDefault();
  }
  function handleKeyboardRelease(event) {
    if (!isThrottleKey(event)) return;
    setThrottle(false);
    if (typeof event.preventDefault === "function") event.preventDefault();
  }
  function installInput() {
    const usingWxTouch = typeof wx.onTouchStart === "function";
    if (usingWxTouch) {
      const forEachChanged = (event, handler) => {
        const list = event && (event.changedTouches || event.touches) || [];
        for (let i = 0; i < list.length; i++) {
          const touch = list[i];
          if (touch) handler(touch, touch.identifier != null ? touch.identifier : i);
        }
      };
      wx.onTouchStart((event) => forEachChanged(event, (touch, id) => pointerDown(id, touch.clientX, touch.clientY)));
      if (typeof wx.onTouchMove === "function") {
        wx.onTouchMove((event) => forEachChanged(event, (touch, id) => pointerMove(id, touch.clientX, touch.clientY)));
      }
      if (typeof wx.onTouchEnd === "function") {
        wx.onTouchEnd((event) => forEachChanged(event, (_touch, id) => pointerUp(id)));
      }
      if (typeof wx.onTouchCancel === "function") {
        wx.onTouchCancel((event) => forEachChanged(event, (_touch, id) => pointerUp(id)));
      }
    }
    if (!usingWxTouch && canvas && typeof canvas.addEventListener === "function") {
      if (typeof canvas.setAttribute === "function") canvas.setAttribute("tabindex", "0");
      canvas.tabIndex = 0;
      const localPoint = (event) => {
        const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: VIEW_W, height: VIEW_H };
        return {
          x: (event.clientX - rect.left) * VIEW_W / Math.max(1, rect.width),
          y: (event.clientY - rect.top) * VIEW_H / Math.max(1, rect.height)
        };
      };
      canvas.addEventListener("pointerdown", (event) => {
        if (typeof canvas.focus === "function") canvas.focus({ preventScroll: true });
        const point = localPoint(event);
        pointerDown(event.pointerId, point.x, point.y);
        if (typeof event.preventDefault === "function") event.preventDefault();
      });
      if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
        window.addEventListener("pointermove", (event) => {
          const point = localPoint(event);
          pointerMove(event.pointerId, point.x, point.y);
        });
        window.addEventListener("pointerup", (event) => pointerUp(event.pointerId));
        window.addEventListener("pointercancel", (event) => pointerUp(event.pointerId));
      }
      if (typeof canvas.focus === "function") {
        setTimeout(() => canvas.focus({ preventScroll: true }), 0);
      }
    }
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("keydown", handleKeyboardInput, { capture: true, passive: false });
      window.addEventListener("keyup", handleKeyboardRelease, { capture: true, passive: false });
      window.addEventListener("blur", releaseAllPointers);
    }
  }
  var debugPointerCount = () => activePointers.size;

  // src/render/overlays.ts
  function drawHazardLane() {
    if (effects.hazardLane < 0) return;
    const path = pathForLane(effects.hazardLane);
    strokeClosedPath(path, 7.4, "rgba(255,96,84,0.42)");
    strokeClosedPath(path, 2.6, "rgba(255,196,120,0.85)", [7, 6]);
  }
  function drawBlackout() {
    if (effects.dim <= 0) return;
    ctx.save();
    ctx.globalAlpha = effects.dim;
    ctx.fillStyle = "#050C12";
    ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
    ctx.restore();
    if (effects.dim > 0.5) {
      ctx.save();
      ctx.globalAlpha = (effects.dim - 0.5) * 0.6;
      ctx.fillStyle = COLORS.accent;
      ctx.fillRect(0, DESIGN_H * 0.5 - 1, DESIGN_W, 2);
      ctx.restore();
    }
  }

  // src/render/road.ts
  function drawCurbs(path, phase = 0) {
    ctx.save();
    ctx.lineCap = "butt";
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
      ctx.fillStyle = i % 2 === 0 ? "#F5F0E2" : "#242A2E";
      ctx.fillRect(-2.2, i * 9, 4.4, 9);
      ctx.fillStyle = i % 2 === 0 ? "#242A2E" : "#F5F0E2";
      ctx.fillRect(2.2, i * 9, 4.4, 9);
    }
    ctx.restore();
  }

  // src/render/scenery.ts
  function drawTree(x, y, size = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(13,35,30,0.22)";
    ctx.beginPath();
    ctx.ellipse(2, 4, 9 * size, 5 * size, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5C7E48";
    ctx.beginPath();
    ctx.arc(-3 * size, 0, 6.5 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#739556";
    ctx.beginPath();
    ctx.arc(3 * size, -2 * size, 7 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#94AD69";
    ctx.beginPath();
    ctx.arc(0, -6 * size, 5.5 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawUmbrella(x, y, size = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(7,21,28,0.20)";
    ctx.beginPath();
    ctx.ellipse(2, 5, 9 * size, 4 * size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6B5140";
    ctx.lineWidth = 1.3 * size;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 8 * size);
    ctx.stroke();
    const colors = ["#F2E7C9", "#E9864F", "#F2E7C9", "#E9864F"];
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
    gradient.addColorStop(1, "#12364A");
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
    const decor = trackById(activeTrackId).decor;
    decor.medians.forEach(([x, y, w, h], i) => {
      ctx.fillStyle = COLORS.landDark;
      roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
      ctx.fill();
      ctx.fillStyle = i % 2 === 0 ? COLORS.land : COLORS.landLight;
      roundRect(ctx, x, y, w, h, 9);
      ctx.fill();
    });
    for (const [x, y, size] of decor.trees) drawTree(x, y, size);
    for (const [x, y, size] of decor.umbrellas) drawUmbrella(x, y, size);
    for (const [x, y] of decor.buoys) {
      ctx.fillStyle = "rgba(240,231,204,0.75)";
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(232,112,79,0.85)";
      ctx.beginPath();
      ctx.arc(x, y - 2.8, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // src/render/staticLayer.ts
  var layer = null;
  var layerCtx = null;
  var renderedTrack = null;
  var unavailable = false;
  function ensureLayer() {
    if (unavailable) return false;
    if (layer && layerCtx) return true;
    layer = createOffscreenCanvas(Math.floor(VIEW_W * DPR), Math.floor(VIEW_H * DPR));
    layerCtx = layer ? layer.getContext("2d") : null;
    if (!layer || !layerCtx) {
      unavailable = true;
      return false;
    }
    return true;
  }
  function renderLayer(target) {
    target.setTransform(DPR, 0, 0, DPR, 0, 0);
    target.clearRect(0, 0, VIEW_W, VIEW_H);
    target.save();
    target.translate(offsetX, offsetY);
    target.scale(scale, scale);
    withRenderTarget(target, () => {
      drawBackground();
      drawTrack();
    });
    target.restore();
  }
  function drawStaticScene() {
    if (!ensureLayer() || !layer || !layerCtx) {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      drawBackground();
      drawTrack();
      ctx.restore();
      return;
    }
    if (renderedTrack !== activeTrackId) {
      renderLayer(layerCtx);
      renderedTrack = activeTrackId;
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }

  // src/render/vehicles.ts
  var PLAYER_STYLE = {
    body: COLORS.player,
    cabin: COLORS.playerLight,
    window: COLORS.window,
    lights: "#FFE6A4",
    stripe: COLORS.playerStripe
  };
  var AI_STYLE = {
    body: COLORS.ai,
    cabin: COLORS.aiLight,
    window: COLORS.aiWindow,
    lights: "#C5D3D8",
    stripe: null
  };
  function drawVehicle(distance, laneIndex, style, alpha = 1, indicatorDirection = 0, indicatorOn = false) {
    const p = sampleAtDistance(distance, laneIndex);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1.8;
    ctx.fillStyle = style.body;
    roundRect(ctx, -7.8, -4, 15.6, 8, 2.8);
    ctx.fill();
    ctx.shadowColor = "transparent";
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
      ctx.fillStyle = "#FFD55C";
      const indicatorY = indicatorDirection > 0 ? 3.65 : -4.85;
      ctx.fillRect(2.8, indicatorY, 3.2, 1.4);
      ctx.fillRect(-5.5, indicatorY, 2.6, 1.4);
    }
    ctx.restore();
  }
  function drawAiCar(car) {
    const indicatorOn = car.state === "WARNING" && Math.floor(car.stateElapsed * 30) % 2 === 0;
    drawVehicle(car.distance, car.visualLane, AI_STYLE, 1, car.direction, indicatorOn);
  }
  function drawWreck(car) {
    const p = sampleAtDistance(car.distance, car.visualLane);
    const t = Math.max(0, Math.min(1, car.wreck));
    ctx.save();
    ctx.globalAlpha = t;
    ctx.translate(p.x, p.y);
    const radius = 5 + (1 - t) * 12;
    ctx.fillStyle = "rgba(255,150,72,0.55)";
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(46,30,26,0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawZone(car) {
    const gap = forwardPathDistance(player.distance, car.distance);
    const engaged = gap > 13 && gap < 66 && Math.abs(player.visualLane - car.visualLane) < 0.7;
    ctx.save();
    for (let offset = 16; offset <= 62; offset += 8) {
      const p = sampleAtDistance(car.distance - offset, car.visualLane);
      ctx.globalAlpha = engaged ? 0.55 : 0.26;
      ctx.fillStyle = engaged ? COLORS.accentLight : COLORS.accent;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    const head = sampleAtDistance(car.distance, car.visualLane);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(8,17,25,0.7)";
    ctx.fillRect(head.x - 9, head.y - 11, 18, 3);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(head.x - 9, head.y - 11, 18 * Math.max(0, Math.min(1, car.zoneFill)), 3);
    ctx.restore();
  }
  function playerAlpha() {
    if (player.invincible > 0) return Math.floor(player.invincible * 12) % 2 === 0 ? 0.25 : 1;
    return 1;
  }
  function drawFireballAura() {
    if (player.fireball <= 0) return;
    const p = sampleAtDistance(player.distance, player.visualLane);
    const pulse = 0.72 + Math.sin(player.travelled * 0.06) * 0.28;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(255,164,72,0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, 11 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(255,226,150,0.85)";
    ctx.beginPath();
    ctx.arc(0, 0, 7 + pulse * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawCars() {
    for (const car of aiCars) {
      if (!car.alive) {
        if (car.wreck > 0) drawWreck(car);
        continue;
      }
      if (car.hasZone) drawZone(car);
      drawAiCar(car);
    }
    drawFireballAura();
    drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, playerAlpha());
  }

  // src/scoring.ts
  var WRECK_SECONDS = 0.9;
  function destroyCar(car) {
    var _a, _b;
    car.alive = false;
    car.wreck = WRECK_SECONDS;
    car.hasZone = false;
    run.destroyed += 1;
    audio.playSpeedTierUp(Math.min(7, 2 + run.destroyed));
    vibrate("medium");
    (_b = (_a = activeMode).onDestroy) == null ? void 0 : _b.call(_a, car, run);
  }
  function crash() {
    var _a, _b;
    beginCollision();
    run.crashes += 1;
    (_b = (_a = activeMode).onCrash) == null ? void 0 : _b.call(_a, run);
  }
  function detectCollisions() {
    var _a, _b, _c;
    if (player.invincible > 0 || player.state === "CRASHED") return false;
    for (const car of aiCars) {
      if (!car.alive) continue;
      const laneDistanceNow = Math.abs(player.visualLane - car.visualLane);
      const laneDistanceBefore = Math.abs(player.previousVisualLane - car.previousVisualLane);
      const laneDistance = Math.min(laneDistanceNow, laneDistanceBefore);
      const pathDistance = circularDistance(player.distance, car.distance);
      const previousGap = player.previousDistance - car.previousDistance;
      const currentGap = player.distance - car.distance;
      const previousPassIndex = Math.floor(previousGap / arc.total);
      const currentPassIndex = Math.floor(currentGap / arc.total);
      const sweptThroughCar = currentPassIndex > previousPassIndex;
      const touching = laneDistance <= COLLISION_LANE_DISTANCE && (pathDistance <= COLLISION_PATH_DISTANCE || sweptThroughCar);
      if (!touching) continue;
      const response = (_c = (_b = (_a = activeMode).onContact) == null ? void 0 : _b.call(_a, car, run)) != null ? _c : "crash";
      if (response === "ignore") continue;
      if (response === "destroy") {
        destroyCar(car);
        continue;
      }
      crash();
      return true;
    }
    return false;
  }
  function detectOvertakes() {
    var _a, _b;
    for (const car of aiCars) {
      if (!car.alive) continue;
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
        vibrate(newTier > previousTier ? "medium" : "light");
        (_b = (_a = activeMode).onOvertake) == null ? void 0 : _b.call(_a, overtakes, run);
      } else if (currentPassIndex < car.passIndex) {
        car.passIndex = currentPassIndex;
      }
    }
  }

  // src/main.ts
  var lastTime = Date.now();
  function stepRace(dt) {
    updateControlFlash(dt);
    updateAi(dt);
    updatePlayer(dt);
    audio.update(dt, engineSnapshot());
    const collided = detectCollisions();
    if (!collided) detectOvertakes();
    updateRun(dt);
  }
  function drawRace() {
    drawStaticScene();
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    drawHazardLane();
    drawCars();
    drawBlackout();
    drawHud();
    drawControls();
    ctx.restore();
  }
  function frame(nowValue) {
    const now = typeof nowValue === "number" ? nowValue : Date.now();
    const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1e3));
    lastTime = now;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    if (app.screen === "PLAYING") {
      stepRace(dt);
      drawRace();
    } else {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      if (app.screen === "MENU") {
        updateMenu(dt);
        drawMenu();
      } else {
        drawResult();
      }
      ctx.restore();
    }
    if (app.screen === "PLAYING" && runIsOver()) {
      releaseAllPointers();
      enterResultScreen();
      finishRun();
    }
    scheduleFrame(frame);
  }
  installInput();
  installShareMenu();
  if (typeof wx.onHide === "function") {
    wx.onHide(() => {
      releaseAllPointers();
      audio.suspend();
    });
  }
  if (typeof wx.onShow === "function") wx.onShow(() => audio.resume());
  scheduleFrame(frame);
  return __toCommonJS(main_exports);
})();
