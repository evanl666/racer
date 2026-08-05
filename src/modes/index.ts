/**
 * Mode registry. Order here is the order shown in the menu.
 *
 * The first seven are the modes documented for Q-Games' PixelJunk Racers; the
 * rest are original, built from the same three verbs the original allows —
 * change lane, work the throttle, pass a car.
 */

import { blackout } from './blackout';
import { chainReaction } from './chainReaction';
import { comboRacers } from './comboRacers';
import { deathRace } from './deathRace';
import { endurance } from './endurance';
import { fireballFrenzy } from './fireballFrenzy';
import { ghostLane } from './ghostLane';
import { hotRods } from './hotRods';
import { inTheZone } from './inTheZone';
import { lastMan } from './lastMan';
import { paceSetter } from './paceSetter';
import { rushHour } from './rushHour';
import { slipstream } from './slipstream';
import { speedMonkey } from './speedMonkey';
import { sundayDrivers } from './sundayDrivers';
import { timeAttack } from './timeAttack';
import type { ModeDefinition, ModeId } from './types';

export const MODES: ModeDefinition[] = [
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

/** Ids of the seven modes that come from the original game. */
export const ORIGINAL_MODE_IDS: ReadonlySet<ModeId> = new Set<ModeId>([
  'speed-monkey',
  'combo-racers',
  'sunday-drivers',
  'fireball-frenzy',
  'death-race',
  'in-the-zone',
  'hot-rods'
]);

/**
 * Modes visible to players. The rest are built and tested but held back: sixteen
 * at once buried the one mode the game is actually about. Add ids here to ship
 * them.
 */
export const RELEASED_MODE_IDS: ReadonlySet<ModeId> = new Set<ModeId>(['combo-racers']);

/** Menu order, filtered to what has shipped. */
export const RELEASED_MODES: ModeDefinition[] = MODES.filter((mode) => RELEASED_MODE_IDS.has(mode.id));

const BY_ID = new Map<ModeId, ModeDefinition>(MODES.map((mode) => [mode.id, mode]));

export function modeById(id: ModeId): ModeDefinition {
  const mode = BY_ID.get(id);
  if (!mode) throw new Error(`unknown mode: ${id}`);
  return mode;
}
