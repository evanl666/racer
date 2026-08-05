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
/** Design-space y the numbers will not rise above, keeping them clear of the HUD. */
const FLOATER_CEILING = 78;

const floaters: Floater[] = Array.from({ length: FLOATER_POOL }, () => ({
  x: 0, y: 0, text: '', life: 0, maxLife: 1, size: 12, color: '#fff'
}));

let nextFloater = 0;

/** Pops a number above a point; used for the running combo on the player car. */
export function floatText(x: number, y: number, text: string, color: string, size = 26, life = 1.05): void {
  const floater = floaters[nextFloater];
  nextFloater = (nextFloater + 1) % FLOATER_POOL;
  floater.x = x;
  floater.y = y;
  floater.text = text;
  floater.color = color;
  floater.size = size;
  floater.maxLife = life;
  floater.life = floater.maxLife;
}

export function updateFloaters(dt: number): void {
  for (const floater of floaters) {
    if (floater.life <= 0) continue;
    floater.life -= dt;
    // Rises quickly at first and then eases off, so it clears the car without
    // sailing away over the length of the longer hold.
    const age = 1 - floater.life / floater.maxLife;
    floater.y -= dt * 34 * Math.max(0.15, 1 - age);
    // Stop short of the HUD: a pass near the top of the board used to send the
    // number up among the readouts.
    if (floater.y < FLOATER_CEILING) floater.y = FLOATER_CEILING;
  }
}

export function drawFloaters(): void {
  ctx.save();
  ctx.textAlign = 'center';
  for (const floater of floaters) {
    if (floater.life <= 0) continue;
    const t = floater.life / floater.maxLife;
    const age = 1 - t;

    // Overshoot then settle: the number punches in rather than fading up.
    const pop = age < 0.16
      ? 0.5 + (age / 0.16) * 0.72
      : 1.22 - Math.min(1, (age - 0.16) / 0.2) * 0.22;

    // Holds at full opacity for most of its life, then goes in the last third.
    ctx.globalAlpha = Math.min(1, t * 3);

    ctx.save();
    ctx.translate(floater.x, floater.y);
    ctx.scale(pop, pop);

    ctx.font = `900 ${floater.size}px monospace`;
    // Heavy dark outline: the number sits over cars and road markings.
    ctx.lineWidth = floater.size * 0.28;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(6,14,20,0.9)';
    ctx.strokeText(floater.text, 0, 0);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

export function clearFloaters(): void {
  for (const floater of floaters) floater.life = 0;
}
