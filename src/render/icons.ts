/** Small vector glyphs. Drawn as paths so they render identically everywhere. */

import { ctx } from '../platform';

export function drawStar(cx: number, cy: number, radius: number, color: string, filled: boolean): void {
  const inner = radius * 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

export function drawLock(cx: number, cy: number, size: number, color: string): void {
  const bodyW = size;
  const bodyH = size * 0.78;
  const bodyY = cy - bodyH / 2 + size * 0.16;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.4, size * 0.16);

  // Shackle.
  ctx.beginPath();
  ctx.arc(cx, bodyY, bodyW * 0.32, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Body.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(cx - bodyW / 2, bodyY, bodyW, bodyH);
  ctx.fill();
  ctx.restore();
}
