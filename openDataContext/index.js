// Open data context: the only place allowed to read friends' cloud storage.
//
// This runs in a separate JS context from the game, cannot be bundled with it,
// and can only draw into the shared canvas. The main game sizes that canvas,
// posts a render message, then blits the result.
//
// Plain ES5-ish JavaScript on purpose: this file is not compiled by esbuild.

var sharedCanvas = wx.getSharedCanvas();
var ctx = sharedCanvas.getContext('2d');

var COLORS = {
  text: '#F7F4EA',
  muted: 'rgba(247,244,234,0.55)',
  accent: '#57D5CB',
  accentLight: '#C5FFF7',
  row: 'rgba(255,255,255,0.05)',
  self: 'rgba(87,213,203,0.16)'
};

var ROW_H = 34;
var lastRequest = null;
var avatars = {};

wx.onMessage(function (data) {
  if (!data || data.type !== 'render') return;
  lastRequest = data;
  loadRanking(data);
});

function loadRanking(request) {
  if (typeof wx.getFriendCloudStorage !== 'function') {
    paintMessage('好友数据不可用', request);
    return;
  }
  wx.getFriendCloudStorage({
    keyList: [request.key || 'career'],
    success: function (res) {
      paintRanking(res && res.data ? res.data : [], request);
    },
    fail: function () {
      paintMessage('排行榜加载失败', request);
    }
  });
}

function scoreOf(entry, key) {
  var list = entry && entry.KVDataList ? entry.KVDataList : [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].key === key) {
      var value = parseInt(list[i].value, 10);
      return isNaN(value) ? 0 : value;
    }
  }
  return 0;
}

function clear(request) {
  var dpr = request.dpr || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, request.width, request.height);
}

function paintMessage(message, request) {
  clear(request);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '600 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(message, request.width / 2, request.height / 2);
}

function paintRanking(entries, request) {
  var key = request.key || 'career';
  var rows = entries
    .map(function (entry) {
      return {
        name: entry.nickname || '玩家',
        avatar: entry.avatarUrl || '',
        score: scoreOf(entry, key),
        self: Boolean(entry.isSelf)
      };
    })
    .filter(function (row) {
      return row.score > 0;
    })
    .sort(function (a, b) {
      return b.score - a.score;
    });

  if (rows.length === 0) {
    paintMessage('还没有好友上榜，分享一局试试', request);
    return;
  }

  clear(request);

  var visible = Math.min(rows.length, Math.floor(request.height / ROW_H));
  for (var i = 0; i < visible; i++) {
    paintRow(rows[i], i, request);
  }
}

function paintRow(row, index, request) {
  var y = index * ROW_H;
  var w = request.width;

  ctx.fillStyle = row.self ? COLORS.self : (index % 2 === 0 ? COLORS.row : 'transparent');
  ctx.fillRect(0, y, w, ROW_H - 2);

  ctx.textAlign = 'left';
  ctx.fillStyle = index < 3 ? COLORS.accentLight : COLORS.muted;
  ctx.font = '900 13px monospace';
  ctx.fillText(String(index + 1), 8, y + 22);

  drawAvatar(row.avatar, 30, y + 5, 24, request);

  ctx.fillStyle = COLORS.text;
  ctx.font = '600 12px sans-serif';
  ctx.fillText(truncate(row.name, 8), 62, y + 22);

  ctx.textAlign = 'right';
  ctx.fillStyle = row.self ? COLORS.accentLight : COLORS.accent;
  ctx.font = '900 13px monospace';
  ctx.fillText(String(row.score), w - 8, y + 22);
  ctx.textAlign = 'left';
}

function truncate(name, max) {
  if (!name) return '玩家';
  return name.length > max ? name.slice(0, max) + '…' : name;
}

function drawAvatar(url, x, y, size, request) {
  if (!url) return;

  var cached = avatars[url];
  if (cached && cached.ready) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    try {
      ctx.drawImage(cached.image, x, y, size, size);
    } catch (error) {
      /* a broken avatar must not blank the whole board */
    }
    ctx.restore();
    return;
  }
  if (cached) return;

  if (typeof wx.createImage !== 'function') return;
  var image = wx.createImage();
  var record = { image: image, ready: false };
  avatars[url] = record;
  image.onload = function () {
    record.ready = true;
    // Repaint once the picture arrives, using the most recent request size.
    if (lastRequest) loadRanking(lastRequest);
  };
  image.onerror = function () {
    record.ready = false;
  };
  image.src = url;
  void request;
}
