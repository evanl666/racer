/**
 * Particle system.
 *
 * A fixed pool with no allocation during play: bursts overwrite the oldest
 * particles once the pool is full, which keeps frame time flat no matter how
 * many events land at once. Particles live in design space, so they follow the
 * same transform as the cars.
 */

import { ctx } from '../platform';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  drag: number;
  color: string;
  /** Streaks are drawn along their velocity; the rest are dots. */
  streak: boolean;
}

const POOL_SIZE = 160;

const pool: Particle[] = Array.from({ length: POOL_SIZE }, () => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1, drag: 3, color: '#fff', streak: false
}));

let nextIndex = 0;

function take(): Particle {
  // Prefer a dead slot; otherwise recycle round-robin so a burst never allocates.
  for (let i = 0; i < POOL_SIZE; i++) {
    const candidate = pool[(nextIndex + i) % POOL_SIZE];
    if (candidate.life <= 0) {
      nextIndex = (nextIndex + i + 1) % POOL_SIZE;
      return candidate;
    }
  }
  const particle = pool[nextIndex];
  nextIndex = (nextIndex + 1) % POOL_SIZE;
  return particle;
}

export interface BurstOptions {
  count: number;
  speed: number;
  spread?: number;
  /** Direction in radians. Omit for a full circle. */
  angle?: number;
  life: number;
  size: number;
  colors: string[];
  drag?: number;
  streak?: boolean;
}

export function burst(x: number, y: number, options: BurstOptions): void {
  const spread = options.spread ?? Math.PI * 2;
  const base = options.angle ?? 0;

  for (let i = 0; i < options.count; i++) {
    const particle = take();
    const angle = base + (Math.random() - 0.5) * spread;
    const speed = options.speed * (0.55 + Math.random() * 0.75);

    particle.x = x;
    particle.y = y;
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.maxLife = options.life * (0.7 + Math.random() * 0.6);
    particle.life = particle.maxLife;
    particle.size = options.size * (0.7 + Math.random() * 0.7);
    particle.drag = options.drag ?? 3.2;
    particle.color = options.colors[Math.floor(Math.random() * options.colors.length)];
    particle.streak = Boolean(options.streak);
  }
}

export function updateParticles(dt: number): void {
  for (const particle of pool) {
    if (particle.life <= 0) continue;
    particle.life -= dt;
    const decay = Math.max(0, 1 - particle.drag * dt);
    particle.vx *= decay;
    particle.vy *= decay;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
}

export function drawParticles(): void {
  ctx.save();
  for (const particle of pool) {
    if (particle.life <= 0) continue;
    const t = particle.life / particle.maxLife;
    ctx.globalAlpha = Math.min(1, t * 1.4);
    ctx.fillStyle = particle.color;

    if (particle.streak) {
      // Length follows speed, so fast debris reads as a line and slow as a dot.
      const length = Math.min(14, Math.hypot(particle.vx, particle.vy) * 0.035);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = particle.size * t;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - particle.vx * 0.02, particle.y - particle.vy * 0.02);
      ctx.stroke();
      void length;
    } else {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * t, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function clearParticles(): void {
  for (const particle of pool) particle.life = 0;
}

/** Live particle count, for the headless tests. */
export function activeParticles(): number {
  let count = 0;
  for (const particle of pool) if (particle.life > 0) count += 1;
  return count;
}


// ---------------------------------------------------------------------------
// Floating text
// ---------------------------------------------------------------------------

interface Floater {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const FLOATER_POOL = 8;

const floaters: Floater[] = Array.from({ length: FLOATER_POOL }, () => ({
  x: 0, y: 0, text: '', life: 0, maxLife: 1, size: 12, color: '#fff'
}));

let nextFloater = 0;

/** Pops a number above a point; used for the running combo on the player car. */
export function floatText(x: number, y: number, text: string, color: string, size = 13): void {
  const floater = floaters[nextFloater];
  nextFloater = (nextFloater + 1) % FLOATER_POOL;
  floater.x = x;
  floater.y = y;
  floater.text = text;
  floater.color = color;
  floater.size = size;
  floater.maxLife = 0.55;
  floater.life = floater.maxLife;
}

export function updateFloaters(dt: number): void {
  for (const floater of floaters) {
    if (floater.life <= 0) continue;
    floater.life -= dt;
    // Drifts up as it fades, which is what makes it read as a pop rather than a label.
    floater.y -= dt * 26;
  }
}

export function drawFloaters(): void {
  ctx.save();
  ctx.textAlign = 'center';
  for (const floater of floaters) {
    if (floater.life <= 0) continue;
    const t = floater.life / floater.maxLife;
    ctx.globalAlpha = Math.min(1, t * 1.8);
    ctx.font = `900 ${floater.size}px monospace`;
    ctx.fillStyle = 'rgba(8,17,25,0.75)';
    ctx.fillText(floater.text, floater.x, floater.y + 1.2);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x, floater.y);
  }
  ctx.restore();
}

export function clearFloaters(): void {
  for (const floater of floaters) floater.life = 0;
}
