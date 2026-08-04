/**
 * WeChat friend leaderboard.
 *
 * Scores live in the player's own cloud storage (`wx.setUserCloudStorage`), and
 * the ranking itself is drawn by the open data context — a separate JS context
 * that is the only place allowed to read friends' data. We hand it a message and
 * blit the shared canvas it renders into.
 *
 * The global and daily boards need real storage, which the open data context
 * cannot provide — it only ever sees friends. Those go through CloudBase.
 *
 * Outside WeChat every entry point degrades to a no-op so the browser build runs
 * unchanged.
 */

import { callFunction, cloudAvailable } from './cloud';
import type { Difficulty, ModeId } from './modes/types';

type OpenDataContext = {
  postMessage(message: unknown): void;
  canvas: WxCanvas;
};

let openDataContext: OpenDataContext | null = null;
let openDataChecked = false;

function context(): OpenDataContext | null {
  if (openDataChecked) return openDataContext;
  openDataChecked = true;
  const api = wx as unknown as { getOpenDataContext?(): OpenDataContext };
  if (typeof api.getOpenDataContext === 'function') {
    try {
      openDataContext = api.getOpenDataContext();
    } catch (error) {
      openDataContext = null;
    }
  }
  return openDataContext;
}

/** True when a friend ranking can actually be shown. */
export function leaderboardAvailable(): boolean {
  return context() !== null;
}

/** Publishes the player's career total so friends' clients can rank it. */
export function submitFriendScore(points: number): void {
  const api = wx as unknown as {
    setUserCloudStorage?(options: {
      KVDataList: Array<{ key: string; value: string }>;
      success?: () => void;
      fail?: () => void;
    }): void;
  };
  if (typeof api.setUserCloudStorage !== 'function') return;
  try {
    api.setUserCloudStorage({
      // WeChat requires string values; the key is what the open data context reads.
      KVDataList: [{ key: 'career', value: String(Math.round(points)) }],
      fail: () => {}
    });
  } catch (error) {
    /* a failed upload must never interrupt the result screen */
  }
}

/** Asks the open data context to redraw the friend ranking at this size. */
export function requestFriendRanking(width: number, height: number, dpr: number): void {
  const ctx = context();
  if (!ctx) return;
  try {
    // The shared canvas is sized from the main context; the sub-context only draws.
    ctx.canvas.width = Math.floor(width * dpr);
    ctx.canvas.height = Math.floor(height * dpr);
    ctx.postMessage({ type: 'render', key: 'career', width, height, dpr });
  } catch (error) {
    /* leave the panel blank rather than crash the result screen */
  }
}

/** The canvas the open data context draws into, ready to be blitted. */
export function sharedCanvas(): WxCanvas | null {
  const ctx = context();
  return ctx ? ctx.canvas : null;
}


// ---------------------------------------------------------------------------
// Global / daily board, backed by CloudBase
// ---------------------------------------------------------------------------

export interface GlobalRow {
  rank: number;
  nickname: string;
  score: number;
  self: boolean;
}

export interface GlobalBoard {
  rows: GlobalRow[];
  selfRank: number | null;
  total: number;
  state: 'idle' | 'loading' | 'ready' | 'failed' | 'unavailable';
}

const boards = new Map<string, GlobalBoard>();

function boardKey(modeId: ModeId, difficulty: Difficulty, day: string): string {
  return `${modeId}:${difficulty}:${day}`;
}

export function globalBoardAvailable(): boolean {
  return cloudAvailable();
}

/** Publishes a score to the global board. Failures are silent by design. */
export function submitGlobalScore(
  modeId: ModeId,
  difficulty: Difficulty,
  score: number,
  lowerIsBetter: boolean,
  day = ''
): void {
  if (!cloudAvailable()) return;
  void callFunction('submitScore', { modeId, difficulty, score, lowerIsBetter, day });
  // The cached page is now stale.
  boards.delete(boardKey(modeId, difficulty, day));
}

/**
 * Returns the cached board, kicking off a fetch the first time it is asked for.
 * The result screen simply redraws every frame and shows whatever state it is in.
 */
export function globalBoard(modeId: ModeId, difficulty: Difficulty, day = ''): GlobalBoard {
  const key = boardKey(modeId, difficulty, day);
  const cached = boards.get(key);
  if (cached) return cached;

  const board: GlobalBoard = {
    rows: [],
    selfRank: null,
    total: 0,
    state: cloudAvailable() ? 'loading' : 'unavailable'
  };
  boards.set(key, board);
  if (board.state === 'unavailable') return board;

  void callFunction<{
    ok?: boolean;
    rows?: GlobalRow[];
    selfRank?: number | null;
    total?: number;
  }>('topScores', { modeId, difficulty, day, limit: 20 }).then((result) => {
    if (!result || !result.ok) {
      board.state = 'failed';
      return;
    }
    board.rows = result.rows ?? [];
    board.selfRank = result.selfRank ?? null;
    board.total = result.total ?? 0;
    board.state = 'ready';
  });

  return board;
}
