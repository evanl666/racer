/**
 * Seeded randomness for gameplay.
 *
 * The daily challenge is only meaningful if everyone drives the same traffic, so
 * every decision that affects the simulation draws from here instead of
 * Math.random. Seeding makes a run reproducible from a single integer; clearing
 * the seed returns to system randomness for ordinary play.
 *
 * mulberry32: tiny, fast, and good enough for traffic patterns. It is not a
 * cryptographic generator and does not need to be.
 */

let state = 0;
let seeded = false;

export function setSeed(seed: number): void {
  // Any 32-bit value works; the >>> keeps it unsigned after the mix.
  state = (seed >>> 0) || 1;
  seeded = true;
}

export function clearSeed(): void {
  seeded = false;
}

export function isSeeded(): boolean {
  return seeded;
}

/** Uniform in [0, 1). Deterministic while seeded. */
export function random(): number {
  if (!seeded) return Math.random();
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [0, max). */
export function randomInt(max: number): number {
  return Math.floor(random() * max);
}

/** Turns an arbitrary string (a date, a mode id) into a stable 32-bit seed. */
export function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
