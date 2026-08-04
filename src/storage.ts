/**
 * Personal best scores, kept per (mode, difficulty).
 *
 * WeChat storage is synchronous and tiny; the browser falls back to localStorage
 * so the preview build behaves the same. Any failure degrades to in-memory only,
 * because losing a best score must never break a run.
 */

import type { Difficulty, ModeId } from './modes/types';

const STORAGE_KEY = 'harbor-loop-bests-v1';

type BestTable = Record<string, number>;

let cache: BestTable | null = null;

function readRaw(): string | null {
  try {
    const anyWx = wx as unknown as { getStorageSync?(key: string): unknown };
    if (typeof anyWx.getStorageSync === 'function') {
      const value = anyWx.getStorageSync(STORAGE_KEY);
      return typeof value === 'string' && value ? value : null;
    }
  } catch (error) {
    /* fall through to localStorage */
  }
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    /* storage unavailable */
  }
  return null;
}

function writeRaw(value: string): void {
  try {
    const anyWx = wx as unknown as { setStorageSync?(key: string, data: unknown): void };
    if (typeof anyWx.setStorageSync === 'function') {
      anyWx.setStorageSync(STORAGE_KEY, value);
      return;
    }
  } catch (error) {
    /* fall through to localStorage */
  }
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    /* best scores stay in memory for this session */
  }
}

function table(): BestTable {
  if (cache) return cache;
  const raw = readRaw();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object') {
        cache = parsed as BestTable;
        return cache;
      }
    } catch (error) {
      /* corrupt payload: start clean rather than crash on launch */
    }
  }
  cache = {};
  return cache;
}

function key(modeId: ModeId, difficulty: Difficulty): string {
  return `${modeId}:${difficulty}`;
}

export function bestScore(modeId: ModeId, difficulty: Difficulty): number | null {
  const value = table()[key(modeId, difficulty)];
  return typeof value === 'number' ? value : null;
}

/** Records a score if it beats the stored one. Returns true when it is a new best. */
export function submitScore(
  modeId: ModeId,
  difficulty: Difficulty,
  score: number,
  lowerIsBetter: boolean
): boolean {
  const current = bestScore(modeId, difficulty);
  const improved = current === null || (lowerIsBetter ? score < current : score > current);
  if (!improved) return false;

  table()[key(modeId, difficulty)] = score;
  writeRaw(JSON.stringify(table()));
  return true;
}

/** Total of every personal best, used as the single number for the friend ranking. */
export function careerPoints(): number {
  return Object.entries(table()).reduce((total, [entryKey, value]) => {
    // Time Attack stores seconds, where lower is better, so it must not inflate
    // the career total. Every other mode contributes its score directly.
    if (entryKey.startsWith('time-attack:')) return total;
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}
