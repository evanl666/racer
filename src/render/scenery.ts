/** Water, park medians and buoys — everything behind the road. */

import { ctx, DESIGN_H, DESIGN_W } from '../platform';
import { COLORS } from '../theme';
import { activeTrackId } from '../track';
import { trackById } from '../tracks';
import { roundRect } from './primitives';

function drawTree(x: number, y: number, size = 1): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(13,35,30,0.22)';
  ctx.beginPath(); ctx.ellipse(2, 4, 9 * size, 5 * size, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5C7E48';
  ctx.beginPath(); ctx.arc(-3 * size, 0, 6.5 * size, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#739556';
  ctx.beginPath(); ctx.arc(3 * size, -2 * size, 7 * size, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#94AD69';
  ctx.beginPath(); ctx.arc(0, -6 * size, 5.5 * size, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawUmbrella(x: number, y: number, size = 1): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(7,21,28,0.20)';
  ctx.beginPath(); ctx.ellipse(2, 5, 9 * size, 4 * size, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#6B5140'; ctx.lineWidth = 1.3 * size;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 8 * size); ctx.stroke();
  const colors = ['#F2E7C9', '#E9864F', '#F2E7C9', '#E9864F'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 9 * size, i * Math.PI / 2, (i + 1) * Math.PI / 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawBackground(): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, DESIGN_H);
  gradient.addColorStop(0, COLORS.waterDeep);
  gradient.addColorStop(0.55, COLORS.water);
  gradient.addColorStop(1, '#12364A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

  ctx.strokeStyle = COLORS.waterLine;
  ctx.lineWidth = 1;
  for (let y = 102; y < 690; y += 20) {
    ctx.beginPath();
    for (let x = 0; x <= DESIGN_W; x += 18) {
      const yy = y + Math.sin((x + y) * 0.038) * 1.7;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // Decor follows the circuit: each track declares where its dry land is, so
  // islands never end up drawn across the road.
  const decor = trackById(activeTrackId).decor;

  decor.medians.forEach(([x, y, w, h], i) => {
    ctx.fillStyle = COLORS.landDark;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? COLORS.land : COLORS.landLight;
    roundRect(ctx, x, y, w, h, 9);
    ctx.fill();
  });

  for (const [x, y, size] of decor.trees) drawTree(x, y, size);
  for (const [x, y, size] of decor.umbrellas) drawUmbrella(x, y, size);

  // A few distant buoys fill negative space without competing with cars.
  for (const [x, y] of decor.buoys) {
    ctx.fillStyle = 'rgba(240,231,204,0.75)';
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232,112,79,0.85)';
    ctx.beginPath(); ctx.arc(x, y - 2.8, 1.2, 0, Math.PI * 2); ctx.fill();
  }
}
