/** Water, park medians and buoys — everything behind the road. */

import { ctx, DESIGN_H, DESIGN_W } from '../platform';
import { COLORS } from '../theme';
import { activeTrackId } from '../track';
import { trackById } from '../tracks';
import { project } from './camera';
import { ISLAND_DEPTH, SHADOW_X, SHADOW_Y } from './light';
import { fillRibbon } from './primitives';

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

/**
 * A moored boat: hull, deck and cabin, pointing along `angle`. These are what
 * make the water read as a marina rather than as empty background.
 */
function drawBoat(x: number, y: number, size: number, angle: number): void {
  const length = 26 * size;
  const beam = 8.5 * size;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Shadow on the water.
  ctx.fillStyle = 'rgba(60,80,92,0.28)';
  ctx.beginPath();
  ctx.ellipse(1.5 * size, 1.8 * size, length * 0.5, beam * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hull: a pointed bow at +x tapering to a square transom at -x.
  ctx.fillStyle = '#F4F3EE';
  ctx.beginPath();
  ctx.moveTo(length * 0.5, 0);
  ctx.quadraticCurveTo(length * 0.12, -beam * 0.5, -length * 0.42, -beam * 0.42);
  ctx.lineTo(-length * 0.5, -beam * 0.3);
  ctx.lineTo(-length * 0.5, beam * 0.3);
  ctx.lineTo(-length * 0.42, beam * 0.42);
  ctx.quadraticCurveTo(length * 0.12, beam * 0.5, length * 0.5, 0);
  ctx.closePath();
  ctx.fill();

  // Deck and cabin.
  ctx.fillStyle = '#D8DCDA';
  ctx.beginPath();
  ctx.moveTo(length * 0.32, 0);
  ctx.quadraticCurveTo(length * 0.05, -beam * 0.3, -length * 0.34, -beam * 0.26);
  ctx.lineTo(-length * 0.34, beam * 0.26);
  ctx.quadraticCurveTo(length * 0.05, beam * 0.3, length * 0.32, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#9FB0B8';
  ctx.fillRect(-length * 0.2, -beam * 0.2, length * 0.26, beam * 0.4);
  ctx.fillStyle = '#5E7480';
  ctx.fillRect(-length * 0.14, -beam * 0.12, length * 0.14, beam * 0.24);
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
  gradient.addColorStop(1, '#94AEBA');
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

  // Islands are projected quads: their far edge is narrower than their near one,
  // which is most of what sells the plane as a plane.
  const quad = (x: number, y: number, w: number, h: number, dx = 0, dy = 0): void => {
    const top = [project(x + dx, y + dy), project(x + w + dx, y + dy)];
    const bottom = [project(x + dx, y + h + dy), project(x + w + dx, y + h + dy)];
    fillRibbon(top, bottom, ctx.fillStyle as string);
  };

  decor.medians.forEach(([x, y, w, h], i) => {
    ctx.fillStyle = 'rgba(4,12,18,0.42)';
    quad(x - 4, y - 4, w + 8, h + 8, SHADOW_X * ISLAND_DEPTH, SHADOW_Y * ISLAND_DEPTH);
    ctx.fillStyle = '#5A7043';
    quad(x - 4, y - 4, w + 8, h + 8, SHADOW_X * ISLAND_DEPTH * 0.5, SHADOW_Y * ISLAND_DEPTH * 0.5);
    ctx.fillStyle = COLORS.landDark;
    quad(x - 4, y - 4, w + 8, h + 8);
    ctx.fillStyle = i % 2 === 0 ? COLORS.land : COLORS.landLight;
    quad(x, y, w, h);
  });

  for (const [x, y, size] of decor.trees) {
    const p = project(x, y);
    drawTree(p.x, p.y, size * p.scale);
  }
  for (const [x, y, size] of decor.umbrellas) {
    const p = project(x, y);
    drawUmbrella(p.x, p.y, size * p.scale);
  }
  for (const [x, y, size, angle] of decor.boats) {
    const p = project(x, y);
    drawBoat(p.x, p.y, size * p.scale, angle);
  }

  // A few distant buoys fill negative space without competing with cars.
  for (const [x, y] of decor.buoys) {
    const p = project(x, y);
    ctx.fillStyle = 'rgba(240,231,204,0.75)';
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * p.scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232,112,79,0.85)';
    ctx.beginPath(); ctx.arc(p.x, p.y - 2.8 * p.scale, 1.2 * p.scale, 0, Math.PI * 2); ctx.fill();
  }

  drawVignette();
}

/**
 * A soft darkening at the edges. Costs one gradient in the cached layer and
 * does more for the sense of a lit scene than any single other change.
 */
function drawVignette(): void {
  const gradient = ctx.createRadialGradient(
    DESIGN_W * 0.42, DESIGN_H * 0.38, DESIGN_H * 0.18,
    DESIGN_W * 0.5, DESIGN_H * 0.5, DESIGN_H * 0.72
  );
  gradient.addColorStop(0, 'rgba(255,255,245,0.10)');
  gradient.addColorStop(0.55, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(40,60,72,0.32)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
}
