/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, HelpCircle, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Optics Codex & Sanctuary Mechanics</h2>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Section 1: Objective */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Core Objective</span>
            </h3>
            <p className="leading-relaxed text-slate-400">
              Guide coherent laser light from the Emitter to energize every Crystal Core. Target crystals require light of the exact specified wavelength. When all crystals resonate simultaneously, the chamber awakens!
            </p>
          </div>

          {/* Section 2: Optical Artifacts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Optical Artifacts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Precision Mirror</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Deflects incident light at a 90° angle. Click or press Space to rotate the mirror 90° between diagonal orientations.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Refraction Prism</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Splits incoming light: one beam passes straight through, while a secondary beam deflects 90° sideways.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Quantum Portal</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Coupled wormholes. Beams entering one portal instantly emerge from its twin maintaining their original velocity and angle.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Color Filter</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Isolates specific wavelengths. White light passing through emerges as pure filtered color. Non-matching wavelengths are absorbed.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Polarizer</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Allows only parallel light rays (horizontal or vertical) to cross. Orthogonal light waves are blocked.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Obsidian Wall & Glass</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Obsidian blocks absorb light entirely. Glass blocks allow light to pass through unobstructed while protecting corridors.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Color Mixing Spectrum */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Additive Chromatic Synthesis</h3>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap gap-4 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-red-400">Red</span>
                <span className="text-slate-500">+</span>
                <span className="text-emerald-400">Green</span>
                <span className="text-slate-500">=</span>
                <span className="text-amber-400 font-bold">Yellow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-400">Red</span>
                <span className="text-slate-500">+</span>
                <span className="text-blue-400">Blue</span>
                <span className="text-slate-500">=</span>
                <span className="text-fuchsia-400 font-bold">Magenta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">Green</span>
                <span className="text-slate-500">+</span>
                <span className="text-blue-400">Blue</span>
                <span className="text-slate-500">=</span>
                <span className="text-cyan-400 font-bold">Cyan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Red + Green + Blue</span>
                <span className="text-slate-500">=</span>
                <span className="text-white font-bold">White (Full Spectrum)</span>
              </div>
            </div>
          </div>

          {/* Section 4: Controls */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Keyboard & Mouse Controls</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                <span className="text-cyan-400">Click / Space</span>: Rotate component
              </div>
              <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                <span className="text-cyan-400">WASD / Arrows</span>: Move cursor
              </div>
              <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                <span className="text-cyan-400">Z / Ctrl+Z</span>: Undo move
              </div>
              <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                <span className="text-cyan-400">Y / Ctrl+Y</span>: Redo move
              </div>
              <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                <span className="text-cyan-400">R</span>: Reset chamber
              </div>
              <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                <span className="text-cyan-400">H</span>: Toggle hint
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
