/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LightColor } from '../types/game';
import { COLOR_CONFIG } from './raytracer';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly MAX_PARTICLES = 300;

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, tileSize: number) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x * tileSize, p.y * tileSize, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public emitSparks(gridX: number, gridY: number, color: LightColor, count: number = 8) {
    if (this.particles.length >= this.MAX_PARTICLES) return;
    const col = COLOR_CONFIG[color]?.hex || '#ffffff';

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.02 + Math.random() * 0.05;
      const life = 0.3 + Math.random() * 0.4;

      this.particles.push({
        x: gridX,
        y: gridY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 1.5 + Math.random() * 2.5,
        color: col,
        alpha: 1,
        decay: 1 / life,
      });
    }
  }

  public emitDust(startX: number, startY: number, endX: number, endY: number, color: LightColor) {
    if (this.particles.length >= this.MAX_PARTICLES || Math.random() > 0.35) return;
    const col = COLOR_CONFIG[color]?.hex || '#ffffff';
    const t = Math.random();
    const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 0.15;
    const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 0.15;
    const life = 0.5 + Math.random() * 0.5;

    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.005,
      vy: (Math.random() - 0.5) * 0.005,
      life,
      maxLife: life,
      size: 1 + Math.random() * 1.5,
      color: col,
      alpha: 0.6,
      decay: 1 / life,
    });
  }

  public emitVictoryBurst(width: number, height: number) {
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#06b6d4', '#d946ef', '#ffffff'];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.04 + Math.random() * 0.09;
      const life = 0.8 + Math.random() * 1.0;
      const col = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 2.5 + Math.random() * 3.5,
        color: col,
        alpha: 1,
        decay: 1 / life,
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
