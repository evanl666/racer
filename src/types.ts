/** Shared data shapes. Keeping them in one place stops each module inventing its own. */

export interface Vec2 {
  x: number;
  y: number;
}

/** A point on a lane path, plus the heading used to rotate a car sprite. */
export interface TrackSample extends Vec2 {
  angle: number;
}

export type PlayerLifecycle = 'NORMAL' | 'CHANGING_LANE' | 'CRASHED' | 'RECOVERING';
export type AiLifecycle = 'IDLE' | 'WARNING' | 'CHANGING';

export interface Player {
  distance: number;
  lane: number;
  visualLane: number;
  laneFrom: number;
  laneTo: number;
  laneChangeElapsed: number;
  speed: number;
  state: PlayerLifecycle;
  stateElapsed: number;
  invincible: number;
  combo: number;
  bestCombo: number;
  totalPasses: number;
  passPopElapsed: number;
  tierBoostElapsed: number;
  previousDistance: number;
  previousVisualLane: number;
  collisionCount: number;
}

export interface AiCar {
  id: number;
  distance: number;
  lane: number;
  visualLane: number;
  laneFrom: number;
  laneTo: number;
  baseSpeed: number;
  speed: number;
  previousDistance: number;
  previousVisualLane: number;
  state: AiLifecycle;
  stateElapsed: number;
  direction: number;
  decisionTimer: number;
  passIndex: number;
}

export interface AiBlueprint {
  fraction: number;
  lane: number;
  speed: number;
}

export interface VehicleStyle {
  body: string;
  cabin: string;
  window: string;
  lights: string;
  stripe: string | null;
}

export type ControlKind = 'lane' | 'throttle';
export type ControlId = 'left' | 'right' | 'throttle';

export interface Control {
  id: ControlId;
  kind: ControlKind;
  /** +1 moves one lane left, -1 one lane right; 0 for the throttle. */
  direction: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Everything the audio engine needs to voice one frame. Passing a snapshot keeps
 * audio.ts free of any dependency on game state, so neither module imports the other.
 */
export interface EngineSnapshot {
  tier: number;
  throttle: boolean;
  speed: number;
  cruiseSpeed: number;
  throttleMaxSpeed: number;
  maxSpeed: number;
  state: PlayerLifecycle;
}

export interface PointerEventLike {
  clientX: number;
  clientY: number;
  pointerId: number;
  preventDefault?(): void;
}

export interface KeyboardEventLike {
  key?: string;
  code?: string;
  keyCode?: number;
  which?: number;
  preventDefault?(): void;
}
