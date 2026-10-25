/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, GameProgressState, GridPos, LevelData, TileState } from './types/game';
import { CAMPAIGN_LEVELS, getDailyEnigma } from './game/levels';
import { traceOpticalGrid, TraceResult } from './game/raytracer';
import { ParticleSystem } from './game/particles';
import { soundEngine } from './audio/soundEngine';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { HelpModal } from './components/HelpModal';
import { LevelEditorModal } from './components/LevelEditorModal';

const DEFAULT_PROGRESS: GameProgressState = {
  unlockedLevelId: CAMPAIGN_LEVELS[0].id,
  levels: {},
  audioMuted: false,
  ambientMuted: false,
};

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('TITLE_MENU');
  const [currentLevel, setCurrentLevel] = useState<LevelData>(CAMPAIGN_LEVELS[0]);
  const [grid, setGrid] = useState<(TileState | null)[][]>(() =>
    JSON.parse(JSON.stringify(CAMPAIGN_LEVELS[0].grid))
  );

  // Undo / Redo history stacks
  const [history, setHistory] = useState<(TileState | null)[][][]>([]);
  const [redoStack, setRedoStack] = useState<(TileState | null)[][][]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());

  // Cursor for keyboard navigation
  const [cursorPos, setCursorPos] = useState<GridPos>({ x: 0, y: 0 });

  // Camera shake intensity (decays each frame)
  const [shakeIntensity, setShakeIntensity] = useState<number>(0);

  // Particle system singleton
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());

  // Progress loaded from localStorage
  const [progress, setProgress] = useState<GameProgressState>(() => {
    try {
      const saved = localStorage.getItem('lumina_game_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PROGRESS;
  });

  // Save progress helper
  const saveProgress = (newProgress: GameProgressState) => {
    setProgress(newProgress);
    try {
      localStorage.setItem('lumina_game_progress', JSON.stringify(newProgress));
    } catch {
      // ignore
    }
  };

  // Trace active optical ray grid
  const traceResult = traceOpticalGrid(grid, currentLevel.width, currentLevel.height);

  // Track previously powered receivers to play audio and trigger screen shake when a new one powers up
  const prevPoweredCount = useRef<number>(0);

  useEffect(() => {
    const currentPowered = traceResult.poweredReceivers.length;
    if (currentPowered > prevPoweredCount.current) {
      // New crystal energized!
      const lastColor = traceResult.poweredReceivers[currentPowered - 1]?.color;
      soundEngine.playCrystalEnergize(lastColor);
      setShakeIntensity(0.4);

      // Spawn spark bursts on crystal
      const lastRec = traceResult.poweredReceivers[currentPowered - 1];
      if (lastRec) {
        particleSystemRef.current.emitSparks(lastRec.x + 0.5, lastRec.y + 0.5, lastRec.color, 12);
      }
    }
    prevPoweredCount.current = currentPowered;
  }, [traceResult.poweredReceivers]);

  // Puzzle Solved Transition
  useEffect(() => {
    if (traceResult.isSolved && gameMode === 'PLAYING') {
      // Hitstop and victory transition
      setTimeout(() => {
        soundEngine.playVictory();
        particleSystemRef.current.emitVictoryBurst(currentLevel.width, currentLevel.height);
        setGameMode('VICTORY');

        // Calculate stars
        let stars = 1;
        if (moves <= currentLevel.parMoves) stars = 3;
        else if (moves <= currentLevel.parMoves + 2) stars = 2;

        const currentLvlProgress = progress.levels[currentLevel.id];
        const bestStars = Math.max(stars, currentLvlProgress?.stars || 0);
        const bestMoves = currentLvlProgress ? Math.min(moves, currentLvlProgress.bestMoves) : moves;

        // Unlock next campaign level
        const currIdx = CAMPAIGN_LEVELS.findIndex(l => l.id === currentLevel.id);
        const nextLvl = CAMPAIGN_LEVELS[currIdx + 1];

        const updatedProgress: GameProgressState = {
          ...progress,
          unlockedLevelId: nextLvl ? nextLvl.id : progress.unlockedLevelId,
          levels: {
            ...progress.levels,
            [currentLevel.id]: {
              completed: true,
              stars: bestStars,
              bestMoves,
              bestTimeSec: elapsedSec,
            },
          },
        };
        saveProgress(updatedProgress);
      }, 350);
    }
  }, [traceResult.isSolved, gameMode, moves, currentLevel, elapsedSec, progress]);

  // Timer loop for playing state
  useEffect(() => {
    if (gameMode !== 'PLAYING') return;
    const interval = setInterval(() => {
      setElapsedSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameMode]);

  // Decay screen shake
  useEffect(() => {
    if (shakeIntensity <= 0) return;
    const timer = setTimeout(() => {
      setShakeIntensity(prev => Math.max(0, prev - 0.1));
    }, 50);
    return () => clearTimeout(timer);
  }, [shakeIntensity]);

  // Load level helper
  const loadLevel = useCallback((lvl: LevelData) => {
    setCurrentLevel(lvl);
    setGrid(JSON.parse(JSON.stringify(lvl.grid)));
    setHistory([]);
    setRedoStack([]);
    setMoves(0);
    setElapsedSec(0);
    setShowHint(false);
    setCursorPos({ x: 0, y: 0 });
    prevPoweredCount.current = 0;
    particleSystemRef.current.clear();
    setGameMode('PLAYING');
    setShowLevelSelect(false);
  }, []);

  // Tile rotation interaction handler
  const handleRotateTile = useCallback((x: number, y: number) => {
    const tile = grid[y]?.[x];
    if (!tile || tile.isFixed) return;

    // Optical rotatable components: MIRROR, DOUBLE_MIRROR, PRISM, POLARIZER
    if (['MIRROR', 'DOUBLE_MIRROR', 'PRISM', 'POLARIZER'].includes(tile.type)) {
      soundEngine.playRotate();

      // Push previous state to undo stack
      setHistory(prev => [...prev, JSON.parse(JSON.stringify(grid))]);
      setRedoStack([]); // Clear redo on new action
      setMoves(prev => prev + 1);

      // Rotate 90 degrees
      setGrid(prev => {
        const next = prev.map(row => [...row]);
        const target = next[y][x]!;
        next[y][x] = {
          ...target,
          rotation: (target.rotation + 90) % 360,
        };
        return next;
      });

      // Spawn spark on rotation
      particleSystemRef.current.emitSparks(x + 0.5, y + 0.5, 'CYAN', 4);
    }
  }, [grid]);

  // Undo move
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    soundEngine.playUndo();
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(grid))]);
    setHistory(prev => prev.slice(0, -1));
    setGrid(previous);
    setMoves(prev => Math.max(0, prev - 1));
  }, [history, grid]);

  // Redo move
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    soundEngine.playRotate();
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(grid))]);
    setRedoStack(prev => prev.slice(0, -1));
    setGrid(next);
    setMoves(prev => prev + 1);
  }, [redoStack, grid]);

  // Reset current level
  const handleReset = useCallback(() => {
    soundEngine.playUndo();
    const freshLevel = CAMPAIGN_LEVELS.find(l => l.id === currentLevel.id) || currentLevel;
    setCurrentLevel(freshLevel);
    setGrid(JSON.parse(JSON.stringify(freshLevel.grid)));
    setHistory([]);
    setRedoStack([]);
    setMoves(0);
    prevPoweredCount.current = 0;
  }, [currentLevel]);

  // Keyboard navigation & controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (gameMode !== 'PLAYING') {
        if (e.key === 'Escape') {
          if (showHelp) setShowHelp(false);
          else if (showEditor) setShowEditor(false);
          else if (showLevelSelect) setShowLevelSelect(false);
          else if (gameMode === 'VICTORY') setGameMode('LEVEL_SELECT');
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setCursorPos(prev => ({ ...prev, y: Math.max(0, prev.y - 1) }));
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setCursorPos(prev => ({ ...prev, y: Math.min(currentLevel.height - 1, prev.y + 1) }));
          break;

        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setCursorPos(prev => ({ ...prev, x: Math.max(0, prev.x - 1) }));
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setCursorPos(prev => ({ ...prev, x: Math.min(currentLevel.width - 1, prev.x + 1) }));
          break;

        case ' ':
        case 'Enter':
          e.preventDefault();
          handleRotateTile(cursorPos.x, cursorPos.y);
          break;

        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey || !e.shiftKey) {
            e.preventDefault();
            handleUndo();
          }
          break;

        case 'y':
        case 'Y':
          e.preventDefault();
          handleRedo();
          break;

        case 'r':
        case 'R':
          e.preventDefault();
          handleReset();
          break;

        case 'h':
        case 'H':
          e.preventDefault();
          setShowHint(prev => !prev);
          break;

        case 'Escape':
          e.preventDefault();
          setShowLevelSelect(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, currentLevel, cursorPos, handleRotateTile, handleUndo, handleRedo, handleReset, showHelp, showEditor, showLevelSelect]);

  // Audio mute toggle
  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Next level navigation
  const handleNextLevel = () => {
    const currIdx = CAMPAIGN_LEVELS.findIndex(l => l.id === currentLevel.id);
    if (currIdx >= 0 && currIdx < CAMPAIGN_LEVELS.length - 1) {
      loadLevel(CAMPAIGN_LEVELS[currIdx + 1]);
    } else {
      setShowLevelSelect(true);
    }
  };

  // Daily Enigma launcher
  const handlePlayDaily = () => {
    const today = new Date().toISOString().split('T')[0];
    const dailyLvl = getDailyEnigma(today);
    loadLevel(dailyLvl);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Title Screen */}
      {gameMode === 'TITLE_MENU' && (
        <TitleScreen
          onStartCampaign={() => {
            // Find highest unlocked level
            const unlockedIdx = CAMPAIGN_LEVELS.findIndex(l => l.id === progress.unlockedLevelId);
            const targetLvl = CAMPAIGN_LEVELS[Math.max(0, unlockedIdx)] || CAMPAIGN_LEVELS[0];
            loadLevel(targetLvl);
          }}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onPlayDaily={handlePlayDaily}
          onOpenEditor={() => setShowEditor(true)}
          isMuted={isMuted}
          onToggleSound={toggleSound}
        />
      )}

      {/* 2. Active Game Screen */}
      {(gameMode === 'PLAYING' || gameMode === 'VICTORY') && (
        <main className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Low-Occlusion HUD Overlay */}
          <GameHUD
            level={currentLevel}
            moves={moves}
            canUndo={history.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onLevelSelect={() => setShowLevelSelect(true)}
            onOpenHelp={() => setShowHelp(true)}
            onOpenEditor={() => setShowEditor(true)}
            onToggleSound={toggleSound}
            isMuted={isMuted}
            traceResult={traceResult}
            showHint={showHint}
            onToggleHint={() => setShowHint(prev => !prev)}
          />

          {/* 60fps Canvas Viewport */}
          <GameCanvas
            grid={grid}
            width={currentLevel.width}
            height={currentLevel.height}
            traceResult={traceResult}
            cursorPos={cursorPos}
            onTileClick={handleRotateTile}
            onCursorMove={(x, y) => setCursorPos({ x, y })}
            particleSystem={particleSystemRef.current}
            shakeIntensity={shakeIntensity}
            isVictory={gameMode === 'VICTORY'}
          />
        </main>
      )}

      {/* 3. Victory Modal */}
      {gameMode === 'VICTORY' && (
        <VictoryModal
          level={currentLevel}
          moves={moves}
          timeSec={elapsedSec}
          hasNextLevel={
            CAMPAIGN_LEVELS.findIndex(l => l.id === currentLevel.id) < CAMPAIGN_LEVELS.length - 1
          }
          onNextLevel={handleNextLevel}
          onReplay={handleReset}
          onLevelSelect={() => {
            setShowLevelSelect(true);
            setGameMode('LEVEL_SELECT');
          }}
        />
      )}

      {/* 4. Level Select Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          progress={progress}
          currentLevelId={currentLevel.id}
          onSelectLevel={lvl => loadLevel(lvl)}
          onClose={() => {
            setShowLevelSelect(false);
            if (gameMode !== 'PLAYING') setGameMode('PLAYING');
          }}
        />
      )}

      {/* 5. Codex & Guide Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* 6. Sanctuary Architect (Level Editor) */}
      {showEditor && (
        <LevelEditorModal
          onClose={() => setShowEditor(false)}
          onPlayCustomLevel={customLvl => {
            setShowEditor(false);
            loadLevel(customLvl);
          }}
        />
      )}
    </div>
  );
}
