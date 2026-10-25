/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Star, ArrowRight, RotateCcw, Compass, Sparkles, Trophy } from 'lucide-react';
import { LevelData } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface VictoryModalProps {
  level: LevelData;
  moves: number;
  timeSec: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  moves,
  timeSec,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  // Calculate star rating
  let stars = 1;
  if (moves <= level.parMoves) {
    stars = 3;
  } else if (moves <= level.parMoves + 2) {
    stars = 2;
  }

  // Play fanfare on mount
  useEffect(() => {
    soundEngine.playVictory();
  }, []);

  // Format seconds mm:ss
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-center animate-fade-in flex flex-col items-center">
        {/* Glow halo */}
        <div className="absolute -top-12 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Victory Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 text-cyan-400">
          <Trophy className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sanctuary Awakened</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-1">{level.name}</h2>
        <p className="text-xs text-slate-400 mb-6 font-light">{level.sanctuaryName}</p>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(st => (
            <div
              key={st}
              className={`p-2 rounded-xl border transition-all ${
                st <= stars
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 scale-105 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/30 border-slate-800 text-slate-700'
              }`}
            >
              <Star className={`w-6 h-6 ${st <= stars ? 'fill-amber-400' : ''}`} />
            </div>
          ))}
        </div>

        {/* Performance Metrics Table */}
        <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 mb-6 text-xs font-mono grid grid-cols-3 divide-x divide-slate-800">
          <div className="px-2">
            <span className="text-slate-500 block text-[10px] uppercase">Moves</span>
            <span className={`text-base font-semibold tabular-nums ${moves <= level.parMoves ? 'text-emerald-400' : 'text-slate-200'}`}>
              {moves}
            </span>
          </div>

          <div className="px-2">
            <span className="text-slate-500 block text-[10px] uppercase">Target Par</span>
            <span className="text-base font-semibold text-slate-400 tabular-nums">
              {level.parMoves}
            </span>
          </div>

          <div className="px-2">
            <span className="text-slate-500 block text-[10px] uppercase">Duration</span>
            <span className="text-base font-semibold text-slate-300 tabular-nums">
              {formatTime(timeSec)}
            </span>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {hasNextLevel ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                onNextLevel();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <span>Next Chamber</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="py-2 text-xs font-semibold text-emerald-400">
              All Chambers in Lumina Mastered!
            </div>
          )}

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => {
                soundEngine.playClick();
                onReplay();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onLevelSelect();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
