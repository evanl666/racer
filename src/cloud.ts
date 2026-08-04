/**
 * WeChat Cloud Development (CloudBase) access.
 *
 * The open data context can only ever see *friends*, so a global or daily
 * ranking needs real storage. CloudBase is the standard answer for a mini game
 * with no server team: a managed document database plus cloud functions, with
 * WeChat identity already attached to every call, so the client never handles a
 * credential and cannot forge an openid.
 *
 * Everything here degrades to "unavailable" when wx.cloud is missing (browser
 * preview) or the environment id has not been filled in yet, so the game runs
 * unchanged without it.
 */

/**
 * Cloud environment id. Fill this in from the WeChat DevTools cloud console
 * after creating an environment; until then the game runs with local scores and
 * the friend ranking only.
 */
export const CLOUD_ENV = '';

type CloudApi = {
  init(options: { env: string; traceUser?: boolean }): void;
  callFunction(options: {
    name: string;
    data?: unknown;
    success?: (res: { result?: unknown }) => void;
    fail?: (err: unknown) => void;
  }): void;
};

let initialised = false;
let unavailable = false;

function api(): CloudApi | null {
  if (unavailable) return null;
  const scope = wx as unknown as { cloud?: CloudApi };
  const cloud = scope.cloud;
  if (!cloud || typeof cloud.callFunction !== 'function' || !CLOUD_ENV) {
    unavailable = true;
    return null;
  }

  if (!initialised) {
    try {
      cloud.init({ env: CLOUD_ENV, traceUser: true });
      initialised = true;
    } catch (error) {
      unavailable = true;
      return null;
    }
  }
  return cloud;
}

export function cloudAvailable(): boolean {
  return api() !== null;
}

/**
 * Calls a cloud function. Resolves to null on any failure — a ranking that
 * cannot load must never interrupt play.
 */
export function callFunction<T>(name: string, data: unknown): Promise<T | null> {
  const cloud = api();
  if (!cloud) return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: T | null): void => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    try {
      cloud.callFunction({
        name,
        data,
        success: (res) => finish((res?.result ?? null) as T | null),
        fail: () => finish(null)
      });
    } catch (error) {
      finish(null);
    }

    // Mini game network calls can hang; a ranking is never worth a stuck screen.
    setTimeout(() => finish(null), 6000);
  });
}
