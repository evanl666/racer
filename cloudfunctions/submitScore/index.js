// Records one score. Called from the game; never trusted blindly.
//
// The caller's openid comes from the WeChat context rather than the payload, so
// a client cannot write to somebody else's row. Only an improvement is stored,
// which also makes the call idempotent.

const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const scores = db.collection('harbor_scores');

/** Modes score in different units and directions; sortKey normalises both. */
function sortKeyFor(score, lowerIsBetter) {
  return lowerIsBetter ? -score : score;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { ok: false, reason: 'no-identity' };

  const modeId = String(event.modeId || '');
  const difficulty = String(event.difficulty || '');
  const day = String(event.day || '');
  const score = Number(event.score);
  const lowerIsBetter = Boolean(event.lowerIsBetter);
  const nickname = String(event.nickname || '').slice(0, 24);

  if (!modeId || !difficulty || !Number.isFinite(score)) {
    return { ok: false, reason: 'bad-payload' };
  }
  // A cap keeps a tampered client from parking an unbeatable number at the top.
  if (score < 0 || score > 1e7) return { ok: false, reason: 'out-of-range' };

  const key = `${OPENID}:${modeId}:${difficulty}:${day}`;
  const sortKey = sortKeyFor(score, lowerIsBetter);

  const existing = await scores.where({ key }).limit(1).get();
  const previous = existing.data[0];

  if (!previous) {
    await scores.add({
      data: {
        key,
        openid: OPENID,
        modeId,
        difficulty,
        day,
        score,
        sortKey,
        nickname,
        updatedAt: db.serverDate()
      }
    });
    return { ok: true, improved: true };
  }

  if (sortKey <= previous.sortKey) return { ok: true, improved: false };

  await scores.doc(previous._id).update({
    data: { score, sortKey, nickname, updatedAt: db.serverDate() }
  });
  return { ok: true, improved: true };
};
