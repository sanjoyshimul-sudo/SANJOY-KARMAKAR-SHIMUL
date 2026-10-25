/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Play, Copy, Check, RotateCcw, Trash2, Download, Upload, Sparkles } from 'lucide-react';
import { Direction, GridPos, LevelData, LightColor, TileState, TileType } from '../types/game';
import { COLOR_CONFIG, traceOpticalGrid } from '../game/raytracer';
import { soundEngine } from '../audio/soundEngine';

interface LevelEditorModalProps {
  onClose: () => void;
  onPlayCustomLevel: (level: LevelData) => void;
}

export const LevelEditorModal: React.FC<LevelEditorModalProps> = ({
  onClose,
  onPlayCustomLevel,
}) => {
  const [gridSize, setGridSize] = useState<number>(8);
  const [levelName, setLevelName] = useState<string>('My Custom Sanctuary');
  const [parMoves, setParMoves] = useState<number>(3);
  const [selectedTool, setSelectedTool] = useState<TileType | 'ERASE'>('MIRROR');
  const [selectedColor, setSelectedColor] = useState<LightColor>('RED');
  const [selectedDir, setSelectedDir] = useState<Direction>('RIGHT');
  const [selectedPortalId, setSelectedPortalId] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [showImport, setShowImport] = useState<boolean>(false);

  // Initialize empty grid
  const [grid, setGrid] = useState<(TileState | null)[][]>(() => {
    const g: (TileState | null)[][] = [];
    for (let y = 0; y < 8; y++) {
      const row: (TileState | null)[] = [];
      for (let x = 0; x < 8; x++) row.push(null);
      g.push(row);
    }
    // Default starter setup
    g[2][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
    g[2][4] = { type: 'MIRROR', rotation: 90, isFixed: false };
    g[5][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
    return g;
  });

  const handleResize = (newSize: number) => {
    setGridSize(newSize);
    setGrid(prev => {
      const g: (TileState | null)[][] = [];
      for (let y = 0; y < newSize; y++) {
        const row: (TileState | null)[] = [];
        for (let x = 0; x < newSize; x++) {
          row.push(prev[y]?.[x] || null);
        }
        g.push(row);
      }
      return g;
    });
  };

  const handleTileClick = (x: number, y: number) => {
    soundEngine.playClick();
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      const existing = next[y][x];

      if (selectedTool === 'ERASE') {
        next[y][x] = null;
        return next;
      }

      // If clicking same piece type, cycle rotation
      if (existing && existing.type === selectedTool) {
        next[y][x] = {
          ...existing,
          rotation: (existing.rotation + 90) % 360,
        };
        return next;
      }

      // Otherwise place new piece
      next[y][x] = {
        type: selectedTool,
        rotation: 0,
        direction: selectedTool === 'LASER_EMITTER' ? selectedDir : undefined,
        color: ['LASER_EMITTER', 'CRYSTAL_RECEIVER', 'FILTER'].includes(selectedTool) ? selectedColor : undefined,
        portalId: selectedTool === 'PORTAL' ? selectedPortalId : undefined,
        isFixed: ['LASER_EMITTER', 'CRYSTAL_RECEIVER', 'WALL', 'GLASS'].includes(selectedTool),
      };
      return next;
    });
  };

  const handleClear = () => {
    soundEngine.playUndo();
    const g: (TileState | null)[][] = [];
    for (let y = 0; y < gridSize; y++) {
      const row: (TileState | null)[] = [];
      for (let x = 0; x < gridSize; x++) row.push(null);
      g.push(row);
    }
    setGrid(g);
  };

  const currentLevelData: LevelData = {
    id: `custom_${Date.now()}`,
    name: levelName || 'Custom Chamber',
    sanctuaryId: 99,
    sanctuaryName: 'Architect Sanctum',
    parMoves,
    width: gridSize,
    height: gridSize,
    description: 'A custom crafted optical refraction chamber.',
    grid,
  };

  const trace = traceOpticalGrid(grid, gridSize, gridSize);

  const handleExport = () => {
    const json = JSON.stringify(currentLevelData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.grid && parsed.width && parsed.height) {
        setGridSize(parsed.width);
        setGrid(parsed.grid);
        if (parsed.name) setLevelName(parsed.name);
        if (parsed.parMoves) setParMoves(parsed.parMoves);
        setShowImport(false);
        setImportJsonText('');
      }
    } catch {
      // invalid json
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-base font-bold text-slate-100">Sanctuary Architect</h2>
            <span className="text-xs text-slate-500 font-mono">Custom Chamber Creator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Export JSON'}</span>
            </button>

            <button
              onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import</span>
            </button>

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
        </div>

        {/* Import JSON Area Drawer */}
        {showImport && (
          <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center gap-3">
            <input
              type="text"
              placeholder="Paste custom level JSON here..."
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              onClick={handleImport}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Load Level
            </button>
          </div>
        )}

        {/* Main Editor Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left: Palette & Configuration */}
          <div className="w-full md:w-72 p-4 border-r border-slate-800/80 overflow-y-auto space-y-4 bg-slate-950/40 text-xs">
            {/* Level Meta */}
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Chamber Title</label>
              <input
                type="text"
                value={levelName}
                onChange={e => setLevelName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Grid Size</label>
                <select
                  value={gridSize}
                  onChange={e => handleResize(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs cursor-pointer"
                >
                  <option value={6}>6 x 6</option>
                  <option value={7}>7 x 7</option>
                  <option value={8}>8 x 8</option>
                  <option value={9}>9 x 9</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Par Moves</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={parMoves}
                  onChange={e => setParMoves(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            {/* Component Palette */}
            <div>
              <label className="text-slate-400 block mb-2 font-medium">Optical Tools</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'MIRROR', label: 'Mirror' },
                  { id: 'DOUBLE_MIRROR', label: 'Dbl Mirror' },
                  { id: 'PRISM', label: 'Split Prism' },
                  { id: 'LASER_EMITTER', label: 'Laser Node' },
                  { id: 'CRYSTAL_RECEIVER', label: 'Crystal Target' },
                  { id: 'PORTAL', label: 'Wormhole' },
                  { id: 'FILTER', label: 'Color Filter' },
                  { id: 'POLARIZER', label: 'Polarizer' },
                  { id: 'WALL', label: 'Obsidian Wall' },
                  { id: 'GLASS', label: 'Glass Barrier' },
                  { id: 'ERASE', label: 'Eraser' },
                ].map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedTool(tool.id as TileType | 'ERASE');
                    }}
                    className={`px-2.5 py-2 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer ${
                      selectedTool === tool.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters for selected tool */}
            {['LASER_EMITTER', 'CRYSTAL_RECEIVER', 'FILTER'].includes(selectedTool) && (
              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">Light Wavelength</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['RED', 'GREEN', 'BLUE', 'YELLOW', 'CYAN', 'MAGENTA', 'WHITE'] as LightColor[]).map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`h-7 rounded border flex items-center justify-center text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        selectedColor === c ? 'ring-2 ring-white scale-105' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor: COLOR_CONFIG[c].hex,
                        color: c === 'WHITE' || c === 'YELLOW' ? '#000000' : '#ffffff',
                      }}
                    >
                      {c[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTool === 'LASER_EMITTER' && (
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Emission Direction</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['UP', 'RIGHT', 'DOWN', 'LEFT'] as Direction[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDir(d)}
                      className={`py-1 rounded text-center text-xs font-mono border cursor-pointer ${
                        selectedDir === d ? 'bg-cyan-900/80 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {d[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTool === 'PORTAL' && (
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Portal Frequency Pair</label>
                <div className="grid grid-cols-2 gap-1">
                  {[1, 2].map(id => (
                    <button
                      key={id}
                      onClick={() => setSelectedPortalId(id)}
                      className={`py-1 rounded text-center text-xs font-mono border cursor-pointer ${
                        selectedPortalId === id ? 'bg-cyan-900/80 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Portal {id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 transition-colors cursor-pointer text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chamber Grid</span>
            </button>
          </div>

          {/* Right: Grid Interactive Canvas View */}
          <div className="flex-1 flex flex-col items-center justify-between p-4 bg-slate-950">
            <div className="flex items-center justify-between w-full max-w-md text-xs font-mono text-slate-400 mb-2">
              <span>Status: {trace.isSolved ? ' Solved' : ' Unsolved'}</span>
              <span>
                Crystals: {trace.poweredReceivers.length} / {trace.totalReceivers}
              </span>
            </div>

            {/* Grid preview matrix */}
            <div
              className="grid gap-1 p-2 bg-slate-900 border border-slate-800 rounded-xl"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, y) =>
                row.map((tile, x) => (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleTileClick(x, y)}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500 rounded-lg flex items-center justify-center text-xs font-mono relative cursor-pointer transition-colors"
                  >
                    {tile && (
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          color: tile.color ? COLOR_CONFIG[tile.color]?.hex : '#38bdf8',
                        }}
                      >
                        {tile.type === 'LASER_EMITTER' ? `L${tile.direction?.[0]}` :
                         tile.type === 'CRYSTAL_RECEIVER' ? `C` :
                         tile.type === 'MIRROR' ? `${tile.rotation}°/` :
                         tile.type === 'PRISM' ? `Δ` :
                         tile.type === 'PORTAL' ? `@${tile.portalId}` :
                         tile.type === 'FILTER' ? `F` :
                         tile.type === 'POLARIZER' ? `||` :
                         tile.type === 'WALL' ? `■` :
                         tile.type === 'GLASS' ? `□` : '•'}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Playtest CTA */}
            <div className="w-full max-w-md mt-4">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onPlayCustomLevel(currentLevelData);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Playtest Chamber Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
