/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Direction, GridPos, LightColor, TileState } from '../types/game';
import { COLOR_CONFIG, TraceResult } from '../game/raytracer';
import { ParticleSystem } from '../game/particles';

interface GameCanvasProps {
  grid: (TileState | null)[][];
  width: number;
  height: number;
  traceResult: TraceResult;
  cursorPos: GridPos;
  onTileClick: (x: number, y: number) => void;
  onCursorMove: (x: number, y: number) => void;
  particleSystem: ParticleSystem;
  shakeIntensity: number;
  isVictory: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  grid,
  width,
  height,
  traceResult,
  cursorPos,
  onTileClick,
  onCursorMove,
  particleSystem,
  shakeIntensity,
  isVictory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smooth rotation animation state per tile: currentAngle glides toward target angle
  const animRotations = useRef<Map<string, number>>(new Map());
  // Animated photon pulse phase
  const pulsePhase = useRef<number>(0);
  const lastTime = useRef<number>(performance.now());
  const animationFrameId = useRef<number | null>(null);

  // Canvas dimensions
  const [dimensions, setDimensions] = useState<{ size: number; tileSize: number }>({
    size: 600,
    tileSize: 75,
  });

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const availableW = rect.width - 24;
      const availableH = rect.height - 24;
      
      const maxDim = Math.min(availableW, availableH, 740);
      const computedTileSize = Math.floor(maxDim / Math.max(width, height));
      const finalSize = computedTileSize * Math.max(width, height);

      setDimensions({
        size: finalSize,
        tileSize: computedTileSize,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);

  // Main 60fps render loop
  const renderFrame = useCallback((now: number) => {
    const rawDt = (now - lastTime.current) / 1000;
    const dt = Math.min(rawDt, 0.05); // clamped delta time
    lastTime.current = now;

    pulsePhase.current = (pulsePhase.current + dt * 4) % (Math.PI * 2);

    const canvas = canvasRef.current;
    if (!canvas) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
      return;
    }

    const { tileSize } = dimensions;
    const boardW = width * tileSize;
    const boardH = height * tileSize;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== boardW * dpr || canvas.height !== boardH * dpr) {
      canvas.width = boardW * dpr;
      canvas.height = boardH * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Apply decaying camera shake
    if (shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * shakeIntensity * 10;
      const sy = (Math.random() - 0.5) * shakeIntensity * 10;
      ctx.translate(sx, sy);
    }

    // 1. Draw Sanctuary Floor
    ctx.fillStyle = '#0b0f19'; // Deep obsidian midnight slate
    ctx.fillRect(0, 0, boardW, boardH);

    // Subtle grid lines & floor tile accents
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = x * tileSize;
        const py = y * tileSize;

        // Base tile fill
        ctx.fillStyle = (x + y) % 2 === 0 ? '#0f172a' : '#0d1527';
        ctx.fillRect(px, py, tileSize, tileSize);

        // Tile inner bevel outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);

        // Subtle corner nodes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(px + 1, py + 1, 2, 2);
      }
    }

    // 2. Render Optical Laser Beams
    const segments = traceResult.segments;
    for (const seg of segments) {
      const sx = seg.startX * tileSize;
      const sy = seg.startY * tileSize;
      const ex = seg.endX * tileSize;
      const ey = seg.endY * tileSize;

      const col = COLOR_CONFIG[seg.color] || COLOR_CONFIG.RED;

      // Spawn dust motes along beams
      if (Math.random() < 0.25) {
        particleSystem.emitDust(seg.startX, seg.startY, seg.endX, seg.endY, seg.color);
      }

      // Outer glow layer
      ctx.save();
      ctx.strokeStyle = col.hex;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = tileSize * 0.24;
      ctx.lineCap = 'round';
      ctx.shadowColor = col.hex;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Middle vibrant beam
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = Math.max(3, tileSize * 0.08);
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // White-hot core beam
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.5, tileSize * 0.03);
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Animated traveling photon pulse packet
      const dist = Math.hypot(ex - sx, ey - sy);
      if (dist > 5) {
        const pulseProgress = ((pulsePhase.current * 40) % dist) / dist;
        const pulseX = sx + (ex - sx) * pulseProgress;
        const pulseY = sy + (ey - sy) * pulseProgress;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = col.hex;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, tileSize * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. Render Grid Tiles & Optical Components
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = grid[y]?.[x];
        const px = x * tileSize;
        const py = y * tileSize;
        const cx = px + tileSize * 0.5;
        const cy = py + tileSize * 0.5;

        // Is this tile currently selected by keyboard/cursor?
        const isSelected = cursorPos.x === x && cursorPos.y === y;

        if (tile) {
          // Smooth rotation interpolation
          const key = `${x},${y}`;
          const targetRot = (tile.rotation % 360);
          let currentRot = animRotations.current.get(key) ?? targetRot;
          // Smooth glide
          const diff = (targetRot - currentRot + 540) % 360 - 180;
          currentRot += diff * Math.min(1, dt * 18);
          animRotations.current.set(key, currentRot);

          ctx.save();
          ctx.translate(cx, cy);

          switch (tile.type) {
            case 'WALL': {
              // Ancient obsidian pillar
              ctx.fillStyle = '#1e293b';
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 1.5;
              const r = tileSize * 0.38;
              ctx.beginPath();
              ctx.roundRect(-r, -r, r * 2, r * 2, 6);
              ctx.fill();
              ctx.stroke();

              // Runic center inscription
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
              ctx.lineWidth = 1;
              ctx.strokeRect(-r * 0.45, -r * 0.45, r * 0.9, r * 0.9);
              break;
            }

            case 'GLASS': {
              // Optical transparent glass pane
              ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
              ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
              ctx.lineWidth = 1.5;
              const r = tileSize * 0.38;
              ctx.beginPath();
              ctx.roundRect(-r, -r, r * 2, r * 2, 6);
              ctx.fill();
              ctx.stroke();

              // Internal glint diagonal
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.beginPath();
              ctx.moveTo(-r * 0.6, -r * 0.6);
              ctx.lineTo(r * 0.6, r * 0.6);
              ctx.stroke();
              break;
            }

            case 'MIRROR': {
              // Rotatable silver mirror prism
              ctx.rotate((currentRot * Math.PI) / 180);

              // Circular mount base
              ctx.fillStyle = '#1e293b';
              ctx.strokeStyle = tile.isFixed ? '#475569' : '#38bdf8';
              ctx.lineWidth = tile.isFixed ? 1.5 : 2;
              ctx.beginPath();
              ctx.arc(0, 0, tileSize * 0.36, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Diagonal 45-deg silver mirror line (from bottom-left to top-right)
              const mLen = tileSize * 0.34;
              ctx.strokeStyle = '#f8fafc';
              ctx.lineWidth = 4;
              ctx.lineCap = 'round';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = tile.isFixed ? 3 : 8;
              ctx.beginPath();
              ctx.moveTo(-mLen, mLen);
              ctx.lineTo(mLen, -mLen);
              ctx.stroke();

              // Subtle rotation indicator dots if interactive
              if (!tile.isFixed) {
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(-mLen * 0.6, -mLen * 0.6, 2, 0, Math.PI * 2);
                ctx.arc(mLen * 0.6, mLen * 0.6, 2, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            }

            case 'DOUBLE_MIRROR': {
              ctx.rotate((currentRot * Math.PI) / 180);
              // Two-sided crossed mirror prism
              ctx.fillStyle = '#1e293b';
              ctx.strokeStyle = '#c084fc';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, 0, tileSize * 0.36, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              const mLen = tileSize * 0.34;
              ctx.strokeStyle = '#f8fafc';
              ctx.lineWidth = 4;
              ctx.lineCap = 'round';
              ctx.shadowColor = '#c084fc';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.moveTo(-mLen, mLen);
              ctx.lineTo(mLen, -mLen);
              ctx.stroke();
              break;
            }

            case 'PRISM': {
              // Crystalline triangular beam splitter
              ctx.rotate((currentRot * Math.PI) / 180);

              const pSize = tileSize * 0.36;
              ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2;
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 10;

              ctx.beginPath();
              ctx.moveTo(0, -pSize);
              ctx.lineTo(pSize * 0.866, pSize * 0.5);
              ctx.lineTo(-pSize * 0.866, pSize * 0.5);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              // Inner refracting facets
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(0, -pSize);
              ctx.lineTo(0, pSize * 0.5);
              ctx.stroke();
              break;
            }

            case 'LASER_EMITTER': {
              const col = COLOR_CONFIG[tile.color || 'RED'];
              // Rotate to face emitter direction
              let angle = 0;
              if (tile.direction === 'UP') angle = -Math.PI / 2;
              else if (tile.direction === 'DOWN') angle = Math.PI / 2;
              else if (tile.direction === 'LEFT') angle = Math.PI;
              ctx.rotate(angle);

              // Heavy mounting block
              ctx.fillStyle = '#0f172a';
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 2;
              const r = tileSize * 0.34;
              ctx.beginPath();
              ctx.roundRect(-r, -r, r * 1.5, r * 2, 4);
              ctx.fill();
              ctx.stroke();

              // Laser focus barrel
              ctx.fillStyle = col.hex;
              ctx.shadowColor = col.hex;
              ctx.shadowBlur = 14;
              ctx.beginPath();
              ctx.arc(r * 0.5, 0, tileSize * 0.12, 0, Math.PI * 2);
              ctx.fill();

              // Inner diode glint
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(r * 0.5, 0, tileSize * 0.05, 0, Math.PI * 2);
              ctx.fill();
              break;
            }

            case 'CRYSTAL_RECEIVER': {
              const isPowered = traceResult.poweredReceivers.some(
                pr => pr.x === x && pr.y === y
              );
              const col = COLOR_CONFIG[tile.color || 'RED'];

              // Pulsing resonant aura if powered
              if (isPowered) {
                const pulse = 1 + Math.sin(pulsePhase.current * 3) * 0.15;
                ctx.fillStyle = col.glow;
                ctx.shadowColor = col.hex;
                ctx.shadowBlur = 24;
                ctx.beginPath();
                ctx.arc(0, 0, tileSize * 0.42 * pulse, 0, Math.PI * 2);
                ctx.fill();

                // Emit sparks at active crystal
                if (Math.random() < 0.3) {
                  particleSystem.emitSparks(x + 0.5, y + 0.5, tile.color || 'RED', 2);
                }
              }

              // Base receiver receptacle ring
              ctx.fillStyle = '#0f172a';
              ctx.strokeStyle = isPowered ? col.hex : '#475569';
              ctx.lineWidth = isPowered ? 2.5 : 1.5;
              ctx.beginPath();
              ctx.arc(0, 0, tileSize * 0.36, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Faceted Crystal Gem in center
              ctx.fillStyle = isPowered ? col.hex : '#1e293b';
              ctx.strokeStyle = col.hex;
              ctx.lineWidth = 2;
              ctx.shadowColor = col.hex;
              ctx.shadowBlur = isPowered ? 16 : 4;

              const cR = tileSize * 0.22;
              // Hexagonal crystal gem
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const th = (i * Math.PI) / 3;
                const gx = Math.cos(th) * cR;
                const gy = Math.sin(th) * cR;
                if (i === 0) ctx.moveTo(gx, gy);
                else ctx.lineTo(gx, gy);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              // Center glint
              ctx.fillStyle = isPowered ? '#ffffff' : col.hex;
              ctx.beginPath();
              ctx.arc(0, 0, cR * 0.3, 0, Math.PI * 2);
              ctx.fill();
              break;
            }

            case 'PORTAL': {
              // Quantum wormhole vortex
              const portalColors = tile.portalId === 2 ? '#f59e0b' : '#06b6d4';
              const angle = pulsePhase.current * (tile.portalId === 2 ? -2.5 : 2.5);
              ctx.rotate(angle);

              // Swirling portal rings
              ctx.fillStyle = '#0f172a';
              ctx.strokeStyle = portalColors;
              ctx.lineWidth = 2.5;
              ctx.shadowColor = portalColors;
              ctx.shadowBlur = 16;
              ctx.beginPath();
              ctx.ellipse(0, 0, tileSize * 0.36, tileSize * 0.22, 0, 0, Math.PI * 2);
              ctx.stroke();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.ellipse(0, 0, tileSize * 0.2, tileSize * 0.12, 0, 0, Math.PI * 2);
              ctx.stroke();

              // Counter-rotating center core
              ctx.fillStyle = portalColors;
              ctx.beginPath();
              ctx.arc(0, 0, tileSize * 0.08, 0, Math.PI * 2);
              ctx.fill();
              break;
            }

            case 'FILTER': {
              const col = COLOR_CONFIG[tile.color || 'RED'];
              // Optical chromatic glass filter panel
              ctx.fillStyle = '#0f172a';
              ctx.strokeStyle = col.hex;
              ctx.lineWidth = 2;
              const r = tileSize * 0.36;
              ctx.beginPath();
              ctx.roundRect(-r, -r, r * 2, r * 2, 6);
              ctx.fill();
              ctx.stroke();

              // Filter lens
              ctx.fillStyle = col.glow;
              ctx.shadowColor = col.hex;
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(0, 0, tileSize * 0.22, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              break;
            }

            case 'POLARIZER': {
              ctx.rotate((currentRot * Math.PI) / 180);
              // Nano-slit polarizer grid
              ctx.fillStyle = '#1e293b';
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 1.5;
              const r = tileSize * 0.36;
              ctx.beginPath();
              ctx.roundRect(-r, -r, r * 2, r * 2, 6);
              ctx.fill();
              ctx.stroke();

              // Horizontal polarization slits
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.lineWidth = 1;
              for (let s = -r * 0.6; s <= r * 0.6; s += tileSize * 0.1) {
                ctx.beginPath();
                ctx.moveTo(-r * 0.7, s);
                ctx.lineTo(r * 0.7, s);
                ctx.stroke();
              }
              break;
            }
          }

          ctx.restore();
        }

        // 4. Selection Brackets Cursor
        if (isSelected) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;

          const bPad = 3;
          const bLen = tileSize * 0.22;
          const left = px + bPad;
          const right = px + tileSize - bPad;
          const top = py + bPad;
          const bottom = py + tileSize - bPad;

          // Top-Left corner
          ctx.beginPath();
          ctx.moveTo(left, top + bLen);
          ctx.lineTo(left, top);
          ctx.lineTo(left + bLen, top);
          ctx.stroke();

          // Top-Right corner
          ctx.beginPath();
          ctx.moveTo(right - bLen, top);
          ctx.lineTo(right, top);
          ctx.lineTo(right, top + bLen);
          ctx.stroke();

          // Bottom-Left corner
          ctx.beginPath();
          ctx.moveTo(left, bottom - bLen);
          ctx.lineTo(left, bottom);
          ctx.lineTo(left + bLen, bottom);
          ctx.stroke();

          // Bottom-Right corner
          ctx.beginPath();
          ctx.moveTo(right - bLen, bottom);
          ctx.lineTo(right, bottom);
          ctx.lineTo(right, bottom - bLen);
          ctx.stroke();

          ctx.restore();
        }
      }
    }

    // 5. Update & Render Particle System
    particleSystem.update(dt);
    particleSystem.render(ctx, tileSize);

    ctx.restore();

    animationFrameId.current = requestAnimationFrame(renderFrame);
  }, [dimensions, grid, width, height, traceResult, cursorPos, particleSystem, shakeIntensity]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [renderFrame]);

  // Handle pointer interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridX = Math.floor(clickX / dimensions.tileSize);
    const gridY = Math.floor(clickY / dimensions.tileSize);

    if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
      onCursorMove(gridX, gridY);
      onTileClick(gridX, gridY);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridX = Math.floor(clickX / dimensions.tileSize);
    const gridY = Math.floor(clickY / dimensions.tileSize);

    if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
      if (gridX !== cursorPos.x || gridY !== cursorPos.y) {
        onCursorMove(gridX, gridY);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-3 select-none touch-none overflow-hidden"
    >
      <div
        className="relative rounded-2xl p-1 bg-slate-900/90 border border-slate-700/60 shadow-2xl shadow-cyan-950/20 backdrop-blur-xs flex items-center justify-center"
        style={{
          width: dimensions.tileSize * width + 10,
          height: dimensions.tileSize * height + 10,
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handlePointerMove}
          className="rounded-xl cursor-pointer block"
          style={{
            width: dimensions.tileSize * width,
            height: dimensions.tileSize * height,
          }}
        />
      </div>
    </div>
  );
};
