/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Star, Lock, Play, Sparkles } from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../game/levels';
import { GameProgressState, LevelData } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface LevelSelectModalProps {
  progress: GameProgressState;
  currentLevelId: string;
  onSelectLevel: (level: LevelData) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  currentLevelId,
  onSelectLevel,
  onClose,
}) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState<number>(1);

  // Group levels by sanctuary
  const sanctuaries = [
    { id: 1, name: 'The Dawn Aperture', subtitle: 'Basics & Reflection' },
    { id: 2, name: 'Chromatic Spectrum', subtitle: 'Filters & Additive Light' },
    { id: 3, name: 'Refraction Gates', subtitle: 'Prisms & Quantum Portals' },
    { id: 4, name: 'The Celestial Core', subtitle: 'Grand Harmonic Synthesis' },
  ];

  // Calculate total stars earned
  const totalStars = Object.values(progress.levels).reduce((sum, lvl) => sum + (lvl.stars || 0), 0);
  const maxStars = CAMPAIGN_LEVELS.length * 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Sanctuary Navigation</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{totalStars} / {maxStars} Stars Illuminated</span>
              <span aria-hidden="true">·</span>
              <span>24 Ancient Chambers</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sanctuary Chapter Tabs (Functional Buttons) */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto">
          {sanctuaries.map(s => {
            const isActive = selectedSanctuary === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedSanctuary(s.id);
                }}
                className={`flex flex-col text-left px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-slate-800/90 border-cyan-500/50 text-white shadow-sm'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-xs font-semibold whitespace-nowrap">Chapter {s.id}: {s.name}</span>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{s.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Levels Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CAMPAIGN_LEVELS.filter(lvl => lvl.sanctuaryId === selectedSanctuary).map(lvl => {
            const lvlProgress = progress.levels[lvl.id];
            const isCompleted = lvlProgress?.completed;
            const stars = lvlProgress?.stars || 0;
            const isCurrent = lvl.id === currentLevelId;

            // Unlock criteria: Level 1 is always unlocked; subsequent levels are unlocked if previous is completed or it is current
            const lvlIndex = CAMPAIGN_LEVELS.findIndex(l => l.id === lvl.id);
            const prevLvl = CAMPAIGN_LEVELS[lvlIndex - 1];
            const isUnlocked = lvlIndex === 0 || isCompleted || (prevLvl && progress.levels[prevLvl.id]?.completed);

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    soundEngine.playClick();
                    onSelectLevel(lvl);
                  }
                }}
                className={`relative p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-36 ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-slate-800/80 border-cyan-400 shadow-md shadow-cyan-950/30 cursor-pointer hover:border-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer'
                }`}
              >
                {/* Level Title & Par */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-400">
                      Level {String(lvlIndex + 1).padStart(2, '0')}
                    </span>
                    {!isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">
                        Par {lvl.parMoves}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">
                    {lvl.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-normal font-light">
                    {lvl.description}
                  </p>
                </div>

                {/* Bottom Row: Stars & Play Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(st => (
                      <Star
                        key={st}
                        className={`w-3.5 h-3.5 ${
                          st <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {isUnlocked && (
                    <span className="text-xs font-medium text-cyan-400 flex items-center gap-1 hover:underline">
                      <Play className="w-3 h-3 fill-cyan-400" />
                      <span>{isCompleted ? 'Replay' : 'Enter'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
