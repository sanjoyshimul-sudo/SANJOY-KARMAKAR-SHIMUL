/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, RotateCcw, Undo2, Redo2, Lightbulb, Compass, HelpCircle, Layers } from 'lucide-react';
import { LevelData } from '../types/game';
import { TraceResult } from '../game/raytracer';

interface GameHUDProps {
  level: LevelData;
  moves: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onLevelSelect: () => void;
  onOpenHelp: () => void;
  onOpenEditor: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  traceResult: TraceResult;
  showHint: boolean;
  onToggleHint: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  moves,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onLevelSelect,
  onOpenHelp,
  onOpenEditor,
  onToggleSound,
  isMuted,
  traceResult,
  showHint,
  onToggleHint,
}) => {
  const energizedCount = traceResult.poweredReceivers.length;
  const totalReceivers = traceResult.totalReceivers;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6">
      {/* Top Header Perimeter Cluster */}
      <header className="flex items-start justify-between gap-4">
        {/* Left: Sanctuary & Level Meta */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onLevelSelect}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              title="Return to Level Selection"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sanctuaries</span>
            </button>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-semibold text-slate-200">{level.name}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="hidden sm:inline text-slate-400">{level.sanctuaryName}</span>
            </div>
          </div>
        </div>

        {/* Right: Metrics (Moves, Par, Targets) */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-300 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] tracking-wide uppercase">Moves</span>
              <span className="text-slate-100 font-semibold tabular-nums text-sm">
                {String(moves).padStart(2, '0')}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400 text-[11px] tabular-nums" title="Target Par Moves">
                Par {String(level.parMoves).padStart(2, '0')}
              </span>
            </div>

            <span aria-hidden="true" className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] tracking-wide uppercase">Crystals</span>
              <span className={`font-semibold tabular-nums text-sm ${energizedCount === totalReceivers && totalReceivers > 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {energizedCount}/{totalReceivers}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Docked Top Hint Banner - Never covers the playfield */}
      {showHint && level.hint && (
        <div className="pointer-events-auto self-start mt-2 max-w-lg bg-slate-900/95 border border-amber-500/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl shadow-xl animate-fade-in flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="leading-relaxed">{level.hint}</p>
          </div>
          <button
            onClick={onToggleHint}
            className="text-amber-400/70 hover:text-amber-200 text-xs font-mono px-1.5 py-0.5 rounded hover:bg-amber-950/50 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Footer Perimeter Cluster */}
      <footer className="flex items-end justify-between gap-4">
        {/* Left Actions: Undo, Redo, Reset, Hint */}
        <div className="flex items-center gap-2">
          <div className="pointer-events-auto flex items-center p-1 bg-slate-900/80 border border-slate-700/60 rounded-lg shadow-sm">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-md transition-colors cursor-pointer ${
                canUndo ? 'text-slate-200 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo Move [Z]"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-md transition-colors cursor-pointer ${
                canRedo ? 'text-slate-200 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo Move [Y]"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-700 mx-1" />
            <button
              onClick={onReset}
              className="p-2 rounded-md text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Reset Puzzle [R]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onToggleHint}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors shadow-sm cursor-pointer whitespace-nowrap ${
              showHint
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Insight Hint [H]"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Hint</span>
          </button>
        </div>

        {/* Center Control Hint for Quick Reference */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 font-mono tracking-tight">
          <span>Click / Space Rotate</span>
          <span aria-hidden="true">·</span>
          <span>WASD Move Cursor</span>
          <span aria-hidden="true">·</span>
          <span>Z Undo</span>
          <span aria-hidden="true">·</span>
          <span>R Reset</span>
          <span aria-hidden="true">·</span>
          <span>Esc Menu</span>
        </div>

        {/* Right Tools: Sound, Guide, Editor */}
        <div className="flex items-center gap-2">
          <div className="pointer-events-auto flex items-center p-1 bg-slate-900/80 border border-slate-700/60 rounded-lg shadow-sm">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Optics Codex & Guide [?]"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenEditor}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sanctuary Architect (Level Editor)"
            >
              <Layers className="w-4 h-4 text-fuchsia-400" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
