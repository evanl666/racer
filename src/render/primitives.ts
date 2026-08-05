import { ctx } from '../platform';
import type { Vec2 } from '../types';

export function strokeClosedPath(
  points: Vec2[],
  width: number,
  color: string | CanvasPattern,
  dash: number[] = []
): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}

export function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}


/** A copy of a path translated by (dx, dy), for cast shadows and bevels. */
export function offsetPath(points: Vec2[], dx: number, dy: number): Vec2[] {
  return points.map((point) => ({ x: point.x + dx, y: point.y + dy }));
}
