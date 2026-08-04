/**
 * WeChat friend leaderboard.
 *
 * Scores live in the player's own cloud storage (`wx.setUserCloudStorage`), and
 * the ranking itself is drawn by the open data context — a separate JS context
 * that is the only place allowed to read friends' data. We hand it a message and
 * blit the shared canvas it renders into.
 *
 * Outside WeChat every entry point degrades to a no-op so the browser build runs
 * unchanged.
 */

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
