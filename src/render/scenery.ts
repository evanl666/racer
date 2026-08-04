/** Water, park medians and buoys — everything behind the road. */

import { ctx, DESIGN_H, DESIGN_W } from '../platform';
import { COLORS } from '../theme';
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

  // Slim miniature park medians sit between the long straights. Their low detail
  // keeps the track readable while giving the circuit a deliberate toy-city identity.
  const medians: Array<[number, number, number, number]> = [
    [178, 111, 113, 16],
    [178, 201, 113, 16],
    [178, 291, 113, 16],
    [178, 381, 113, 16],
    [178, 471, 113, 16],
    [178, 561, 113, 16],
    [178, 651, 113, 16]
  ];
  for (let i = 0; i < medians.length; i++) {
    const [x, y, w, h] = medians[i];
    ctx.fillStyle = COLORS.landDark;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? COLORS.land : COLORS.landLight;
    roundRect(ctx, x, y, w, h, 9);
    ctx.fill();
  }

  drawTree(194, 119, 0.40); drawUmbrella(242, 119, 0.38);
  drawTree(265, 209, 0.38); drawTree(205, 299, 0.40);
  drawUmbrella(252, 389, 0.38); drawTree(204, 479, 0.40);
  drawTree(265, 569, 0.38); drawUmbrella(220, 659, 0.38);

  // A few distant buoys fill negative space without competing with cars.
  const buoys: Array<[number, number]> = [[26, 128], [365, 250], [25, 628], [366, 650]];
  for (const [x, y] of buoys) {
    ctx.fillStyle = 'rgba(240,231,204,0.75)';
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232,112,79,0.85)';
    ctx.beginPath(); ctx.arc(x, y - 2.8, 1.2, 0, Math.PI * 2); ctx.fill();
  }
}
