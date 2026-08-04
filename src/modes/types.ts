/** The contract every race mode implements. */

import type { TrackId } from '../tracks';
import type { AiCar } from '../types';

export type ModeId =
  // Modes documented for the original PixelJunk Racers.
  | 'speed-monkey'
  | 'combo-racers'
  | 'sunday-drivers'
  | 'fireball-frenzy'
  | 'death-race'
  | 'in-the-zone'
  | 'hot-rods'
  // Original modes, built in the same slot-car vocabulary to fill out the roster.
  | 'slipstream'
  | 'ghost-lane'
  | 'rush-hour'
  | 'pace-setter'
  | 'last-man'
  | 'chain-reaction'
  | 'blackout'
  | 'time-attack'
  | 'endurance';

export type Difficulty = 'normal' | 'turbo' | 'master';

export type RunOutcome = 'running' | 'cleared' | 'timeout' | 'wrecked';

/** What a body-to-body contact does. Modes decide; scoring.ts carries it out. */
export type ContactResponse = 'crash' | 'destroy' | 'ignore';

export interface RunState {
  modeId: ModeId;
  difficulty: Difficulty;
  elapsed: number;
  /** Seconds left, or Infinity for the untimed modes. */
  timeRemaining: number;
  score: number;
  destroyed: number;
  crashes: number;
  outcome: RunOutcome;
  /** Objective progress in 0..1, drawn as a bar. Negative means "no bar". */
  progress: number;
  /** Short transient message shown centre-screen. */
  banner: string;
  bannerTimer: number;
}

export interface ModeDefinition {
  id: ModeId;
  /** Original PixelJunk Racers mode name. */
  name: string;
  /** Objective, one line, shown in the menu and during the run. */
  rule: string;
  /** Seconds, or Infinity when the mode ends some other way. */
  timeLimit: number;
  /** Suffix for the score readout, e.g. 'COMBO' or 'CARS'. */
  scoreUnit: string;
  /** Traffic speed multiplier applied on top of the difficulty scale. */
  trafficScale: number;
  /** Which circuit this mode is raced on. */
  trackId: TrackId;
  /**
   * Score needed for one, two and three stars, in this mode's own unit.
   * Stars are the game's single progression currency: they gate every mode and
   * difficulty past the starting three.
   */
  stars: [number, number, number];
  /** Higher score is better for every mode except those that set this false. */
  lowerIsBetter?: boolean;

  setup?(run: RunState, cars: AiCar[]): void;
  update?(dt: number, run: RunState, cars: AiCar[]): void;
  onOvertake?(count: number, run: RunState): void;
  onContact?(car: AiCar, run: RunState): ContactResponse;
  /** Called after a contact resolved as 'crash'. */
  onCrash?(run: RunState): void;
  /** Called after a contact resolved as 'destroy'. */
  onDestroy?(car: AiCar, run: RunState): void;
  /** Objective met — the run ends as 'cleared'. */
  cleared?(run: RunState, cars: AiCar[]): boolean;
  /** Run ends as 'wrecked' before the clock runs out. */
  failed?(run: RunState, cars: AiCar[]): boolean;
}
