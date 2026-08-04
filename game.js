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
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/main.ts
  var main_exports = {};
  __export(main_exports, {
    aiCars: () => aiCars,
    debugPointerCount: () => debugPointerCount,
    inputState: () => inputState,
    laneButtonFlash: () => laneButtonFlash,
    player: () => player,
    resetGame: () => resetGame
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
  var MAX_SIMULTANEOUS_AI_ACTIONS = 2;
  var AI_LANE_CLEAR_DISTANCE = 32;
  var AI_PLAYER_BASE_SAFETY_DISTANCE = 50;
  var AI_PLAYER_MAX_SAFETY_DISTANCE = 265;
  var AI_PLAYER_SAFETY_PER_SPEED = 0.39;
  var AI_PLAYER_REAR_SAFETY_DISTANCE = 30;
  var COLLISION_PATH_DISTANCE = 11.5;
  var COLLISION_LANE_DISTANCE = 0.48;
  var AI_BLUEPRINTS = [
    { fraction: 0.07, lane: 0, speed: 84 },
    { fraction: 0.39, lane: 0, speed: 88 },
    { fraction: 0.72, lane: 0, speed: 86 },
    { fraction: 0.16, lane: 1, speed: 92 },
    { fraction: 0.5, lane: 1, speed: 96 },
    { fraction: 0.84, lane: 1, speed: 94 },
    { fraction: 0.25, lane: 2, speed: 98 },
    { fraction: 0.59, lane: 2, speed: 103 },
    { fraction: 0.92, lane: 2, speed: 100 },
    { fraction: 0.1, lane: 3, speed: 104 },
    { fraction: 0.44, lane: 3, speed: 109 },
    { fraction: 0.77, lane: 3, speed: 106 },
    { fraction: 0.2, lane: 4, speed: 110 },
    { fraction: 0.54, lane: 4, speed: 114 },
    { fraction: 0.88, lane: 4, speed: 112 },
    { fraction: 0.31, lane: 5, speed: 116 },
    { fraction: 0.64, lane: 5, speed: 120 },
    { fraction: 0.97, lane: 5, speed: 118 }
  ];

  // src/track.ts
  function buildLongBayCircuit() {
    const points = [];
    function pushPoint(x, y) {
      const last = points[points.length - 1];
      if (!last || Math.hypot(last.x - x, last.y - y) > 0.01) points.push({ x, y });
    }
    function lineTo(x, y, spacing = 3) {
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
    arcTo(110, 640, 60, Math.PI / 2, Math.PI);
    lineTo(50, 130);
    arcTo(110, 130, 60, Math.PI, 3 * Math.PI / 2);
    if (points.length > 1 && Math.hypot(
      points[points.length - 1].x - points[0].x,
      points[points.length - 1].y - points[0].y
    ) < 0.1) points.pop();
    return points;
  }
  var centerPath = buildLongBayCircuit();
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
  var arc = buildArcData(centerPath);
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
  var laneCenterPaths = Array.from({ length: LANE_COUNT }, (_, lane) => pathForLane(lane));
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
  var laneDividerPaths = Array.from({ length: LANE_COUNT - 1 }, (_, i) => pathForLane(i + 0.5));
  var outerRoadEdgePath = pathAtOffset(ROAD_HALF_WIDTH - 1.8);
  var innerRoadEdgePath = pathAtOffset(-ROAD_HALF_WIDTH + 1.8);

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
    collisionCount: 0
  };
  var aiCars = [];
  function resetGame() {
    player.distance = arc.total * 0.03;
    player.lane = STARTING_LANE;
    player.visualLane = STARTING_LANE;
    player.laneFrom = STARTING_LANE;
    player.laneTo = STARTING_LANE;
    player.laneChangeElapsed = 0;
    player.speed = PLAYER_CRUISE_BASE_SPEED;
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
        state: "IDLE",
        stateElapsed: 0,
        direction: 0,
        decisionTimer: AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY),
        passIndex: Math.floor((player.distance - distance) / arc.total)
      };
    });
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
  function engineSnapshot() {
    return {
      tier: currentSpeedTier(),
      throttle: inputState.throttle,
      speed: player.speed,
      cruiseSpeed: currentCruiseSpeed(),
      throttleMaxSpeed: currentThrottleMaxSpeed(),
      maxSpeed: PLAYER_MAX_SPEED,
      state: player.state
    };
  }

  // src/ai.ts
  function currentAiPlayerSafetyDistance() {
    const speedExtra = Math.max(0, player.speed - PLAYER_CRUISE_BASE_SPEED) * AI_PLAYER_SAFETY_PER_SPEED;
    return Math.min(AI_PLAYER_MAX_SAFETY_DISTANCE, AI_PLAYER_BASE_SAFETY_DISTANCE + speedExtra);
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
      if (car.state === "WARNING" || car.state === "CHANGING") count += 1;
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
    if (Math.abs(player.visualLane - targetLane) < 0.72 && circularDistance(car.distance, player.distance) < currentAiPlayerSafetyDistance()) {
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
      car.previousDistance = car.distance;
      car.previousVisualLane = car.visualLane;
      car.decisionTimer -= dt;
      if (car.state === "IDLE" && car.decisionTimer <= 0) {
        car.decisionTimer = AI_MIN_DECISION_DELAY + Math.random() * (AI_MAX_DECISION_DELAY - AI_MIN_DECISION_DELAY);
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
  function createLoopingNoiseSource(context) {
    if (!context || typeof context.createBuffer !== "function" || typeof context.createBufferSource !== "function") return null;
    try {
      const sampleRate = context.sampleRate || 44100;
      const frameCount = Math.max(1, Math.floor(sampleRate * 1.25));
      const buffer = context.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < frameCount; index++) {
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
          const context = this.context;
          this.masterGain = context.createGain();
          this.engineGain = context.createGain();
          this.engineMidGain = context.createGain();
          this.engineHighGain = context.createGain();
          this.engineNoiseGain = context.createGain();
          this.engineFilter = context.createBiquadFilter();
          this.engineNoiseFilter = context.createBiquadFilter();
          this.engineLow = context.createOscillator();
          this.engineMid = context.createOscillator();
          this.engineHigh = context.createOscillator();
          this.engineNoise = createLoopingNoiseSource(context);
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
          this.masterGain.connect(context.destination);
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
      const context = this.context;
      const masterGain = this.masterGain;
      if (!context || !masterGain) return;
      try {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
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
    player.invincible = 1.25;
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
      player.speed = PLAYER_CRUISE_BASE_SPEED * t;
      if (t >= 1) {
        player.speed = PLAYER_CRUISE_BASE_SPEED;
        player.state = "NORMAL";
        player.stateElapsed = 0;
      }
    } else {
      const targetSpeed = currentTargetSpeed();
      const acceleration = player.tierBoostElapsed > 0 ? PLAYER_TIER_ACCELERATION : PLAYER_ACCELERATION;
      const rate = targetSpeed >= player.speed ? acceleration : PLAYER_COAST_DECELERATION;
      player.speed = moveToward(player.speed, targetSpeed, rate * dt);
    }
    player.distance = advanceDistanceAtRoadSpeed(player.distance, player.speed, dt, player.visualLane);
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
    const key = String(event.key || "").toLowerCase();
    const code = String(event.code || "");
    const keyCode = Number(event.keyCode || event.which || 0);
    return key === "arrowup" || key === "up" || key === "w" || key === " " || key === "spacebar" || code === "ArrowUp" || code === "KeyW" || code === "Space" || keyCode === 38 || keyCode === 87 || keyCode === 32;
  }
  function handleKeyboardInput(event) {
    const key = String(event.key || "").toLowerCase();
    const code = String(event.code || "");
    const keyCode = Number(event.keyCode || event.which || 0);
    let handled = false;
    if (key === "arrowleft" || key === "left" || key === "a" || code === "ArrowLeft" || code === "KeyA" || keyCode === 37 || keyCode === 65) {
      requestLaneChange(1);
      handled = true;
    } else if (key === "arrowright" || key === "right" || key === "d" || code === "ArrowRight" || code === "KeyD" || keyCode === 39 || keyCode === 68) {
      requestLaneChange(-1);
      handled = true;
    } else if (isThrottleKey(event)) {
      setThrottle(true);
      handled = true;
    } else if (key === "r" || code === "KeyR" || keyCode === 82) {
      resetGame();
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

  // src/render/hud.ts
  function drawHud() {
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
    if (player.state === "CRASHED") {
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
    drawTree(194, 119, 0.4);
    drawUmbrella(242, 119, 0.38);
    drawTree(265, 209, 0.38);
    drawTree(205, 299, 0.4);
    drawUmbrella(252, 389, 0.38);
    drawTree(204, 479, 0.4);
    drawTree(265, 569, 0.38);
    drawUmbrella(220, 659, 0.38);
    const buoys = [[26, 128], [365, 250], [25, 628], [366, 650]];
    for (const [x, y] of buoys) {
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
  function playerAlpha() {
    if (player.invincible > 0) return Math.floor(player.invincible * 12) % 2 === 0 ? 0.25 : 1;
    return 1;
  }
  function drawCars() {
    for (const car of aiCars) drawAiCar(car);
    drawVehicle(player.distance, player.visualLane, PLAYER_STYLE, playerAlpha());
  }

  // src/scoring.ts
  function detectCollisions() {
    if (player.invincible > 0 || player.state === "CRASHED") return false;
    for (const car of aiCars) {
      const laneDistanceNow = Math.abs(player.visualLane - car.visualLane);
      const laneDistanceBefore = Math.abs(player.previousVisualLane - car.previousVisualLane);
      const laneDistance = Math.min(laneDistanceNow, laneDistanceBefore);
      const pathDistance = circularDistance(player.distance, car.distance);
      const previousGap = player.previousDistance - car.previousDistance;
      const currentGap = player.distance - car.distance;
      const previousPassIndex = Math.floor(previousGap / arc.total);
      const currentPassIndex = Math.floor(currentGap / arc.total);
      const sweptThroughCar = currentPassIndex > previousPassIndex;
      if (laneDistance <= COLLISION_LANE_DISTANCE && (pathDistance <= COLLISION_PATH_DISTANCE || sweptThroughCar)) {
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
        vibrate(newTier > previousTier ? "medium" : "light");
      } else if (currentPassIndex < car.passIndex) {
        car.passIndex = currentPassIndex;
      }
    }
  }

  // src/main.ts
  var lastTime = Date.now();
  function frame(nowValue) {
    const now = typeof nowValue === "number" ? nowValue : Date.now();
    const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1e3));
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
