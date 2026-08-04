// Returns the top of a board plus the caller's own rank.
//
// Scores are stored with a normalised sortKey, so a single descending sort works
// for every mode including the one where a lower time is better.

const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const command = db.command;
const scores = db.collection('harbor_scores');

const MAX_LIMIT = 50;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();

  const modeId = String(event.modeId || '');
  const difficulty = String(event.difficulty || '');
  const day = String(event.day || '');
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(event.limit) || 20));

  if (!modeId || !difficulty) return { ok: false, reason: 'bad-payload' };

  const filter = { modeId, difficulty, day };

  const top = await scores
    .where(filter)
    .orderBy('sortKey', 'desc')
    .limit(limit)
    .field({ openid: true, nickname: true, score: true, sortKey: true })
    .get();

  const rows = top.data.map((row, index) => ({
    rank: index + 1,
    nickname: row.nickname || '玩家',
    score: row.score,
    self: row.openid === OPENID
  }));

  // Own rank, even when outside the returned page: count everyone ahead.
  let selfRank = null;
  let selfScore = null;
  if (OPENID) {
    const mine = await scores.where({ ...filter, openid: OPENID }).limit(1).get();
    const row = mine.data[0];
    if (row) {
      selfScore = row.score;
      const ahead = await scores
        .where({ ...filter, sortKey: command.gt(row.sortKey) })
        .count();
      selfRank = ahead.total + 1;
    }
  }

  const total = await scores.where(filter).count();

  return { ok: true, rows, selfRank, selfScore, total: total.total };
};
