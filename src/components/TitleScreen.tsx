/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Compass, Calendar, Layers, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

// Import generated atmospheric background
import backdropImage from '../assets/images/lumina_game_backdrop_1792922724287.jpg';

interface TitleScreenProps {
  onStartCampaign: () => void;
  onOpenLevelSelect: () => void;
  onPlayDaily: () => void;
  onOpenEditor: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartCampaign,
  onOpenLevelSelect,
  onPlayDaily,
  onOpenEditor,
  isMuted,
  onToggleSound,
}) => {
  // Interactive centerpiece prism angle that responds to mouse/touch drag or auto-rotation
  const [prismAngle, setPrismAngle] = useState<number>(35);
  const isDragging = useRef<boolean>(false);
  const lastMouseX = useRef<number>(0);

  // Auto-sway prism when idle
  useEffect(() => {
    let animId: number;
    let time = 0;
    const loop = () => {
      time += 0.015;
      if (!isDragging.current) {
        setPrismAngle(prev => 35 + Math.sin(time) * 18);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard shortcut: Space or Enter starts game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        soundEngine.playClick();
        onStartCampaign();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartCampaign]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastMouseX.current = e.clientX;
    soundEngine.playRotate();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;
    setPrismAngle(prev => (prev + delta * 0.5) % 360);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-10 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Cinematic Ambient Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={backdropImage}
          alt="Sanctuary Backdrop"
          className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      {/* Top Bar Navigation / Utility */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400/90 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Optical Refraction Sanctuary</span>
        </div>

        <button
          onClick={onToggleSound}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isMuted ? 'Muted' : 'Audio Active'}</span>
        </button>
      </div>

      {/* Centerpiece: Interactive Prismatic Lockup with Bespoke SVG */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-2xl mx-auto">
        {/* Interactive Prism Centerpiece */}
        <div
          onPointerDown={handlePointerDown}
          className="relative w-36 h-36 mb-6 flex items-center justify-center cursor-grab active:cursor-grabbing group"
          title="Drag to rotate the central refraction prism"
        >
          {/* Multi-wavelength refracting rays emitted from center */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-75"
            style={{ transform: `rotate(${prismAngle}deg)` }}
          >
            {/* Incident White Beam */}
            <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-28 h-1 bg-white shadow-[0_0_12px_#ffffff]" />
            {/* Spectrum Dispersion Rays */}
            <div className="absolute left-1/2 top-1/2 w-44 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444] origin-left -rotate-25" />
            <div className="absolute left-1/2 top-1/2 w-48 h-0.5 bg-amber-400 shadow-[0_0_10px_#f59e0b] origin-left -rotate-12" />
            <div className="absolute left-1/2 top-1/2 w-52 h-0.5 bg-emerald-400 shadow-[0_0_10px_#22c55e] origin-left rotate-0" />
            <div className="absolute left-1/2 top-1/2 w-48 h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4] origin-left rotate-12" />
            <div className="absolute left-1/2 top-1/2 w-44 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6] origin-left rotate-25" />
            <div className="absolute left-1/2 top-1/2 w-40 h-0.5 bg-fuchsia-500 shadow-[0_0_10px_#d946ef] origin-left rotate-38" />
          </div>

          {/* Prism Crystal Polygon */}
          <div
            className="relative z-10 w-20 h-20 transition-transform duration-75"
            style={{ transform: `rotate(${prismAngle * 0.4}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              <polygon
                points="50,10 90,85 10,85"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#38bdf8"
                strokeWidth="3"
              />
              <polygon
                points="50,22 80,80 20,80"
                fill="rgba(56, 189, 248, 0.15)"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1.5"
              />
              <line x1="50" y1="22" x2="50" y2="80" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Bespoke Inline SVG Title Lockup */}
        <div className="mb-4">
          <svg className="w-72 md:w-96 h-18 mx-auto" viewBox="0 0 400 80" fill="none">
            <defs>
              <linearGradient id="luminaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="35%" stopColor="#818cf8" />
                <stop offset="70%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="58"
              textAnchor="middle"
              fill="url(#luminaGrad)"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="56"
              fontWeight="800"
              letterSpacing="12"
            >
              LUMINA
            </text>
          </svg>
        </div>

        {/* Subtitle with 30-40% negative space discipline */}
        <p className="text-sm md:text-base text-slate-400 font-light max-w-lg mx-auto mb-8 leading-relaxed">
          Direct coherent light beams with precision optical mirrors, prisms, and portals to awaken the dormant crystal cores.
        </p>

        {/* Action Button Strip */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              onStartCampaign();
            }}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer whitespace-nowrap active:scale-98"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Enter Sanctuary</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenLevelSelect();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Sanctuary Map</span>
          </button>
        </div>

        {/* Secondary Modes */}
        <div className="flex items-center gap-6 mt-4 text-xs">
          <button
            onClick={() => {
              soundEngine.playClick();
              onPlayDaily();
            }}
            className="text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Enigma</span>
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenEditor();
            }}
            className="text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Sanctuary Architect (Editor)</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-4">
        <span>Click / Space to Start</span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>WASD / Arrow Keys Move</span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>Space / Click Rotate Mirror</span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>Z Undo</span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>Esc Menu</span>
      </div>
    </div>
  );
};
