/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

export type LightColor = 
  | 'RED'
  | 'GREEN'
  | 'BLUE'
  | 'YELLOW'  // Red + Green
  | 'CYAN'    // Green + Blue
  | 'MAGENTA' // Red + Blue
  | 'WHITE';  // Red + Green + Blue

export type TileType = 
  | 'EMPTY'
  | 'WALL'
  | 'GLASS'
  | 'MIRROR'             // Flat single-sided or angled mirror (deflects 90°)
  | 'DOUBLE_MIRROR'      // Two-sided 45° mirror
  | 'PRISM'              // Splits or refracts beam into 2 directions
  | 'LASER_EMITTER'      // Emits continuous laser of specified color & dir
  | 'CRYSTAL_RECEIVER'   // Must be energized by required color
  | 'PORTAL'             // Enters portal A, exits portal B
  | 'FILTER'             // Isolates or filters to specific color
  | 'POLARIZER';         // Only lets HORIZONTAL or VERTICAL beams pass

export interface TileState {
  type: TileType;
  direction?: Direction; // Emitter dir, receiver expected dir (optional), polarizer orientation
  rotation: number;      // 0, 90, 180, 270 degrees
  color?: LightColor;    // Emitter color, filter color, receiver required color
  portalId?: number;     // 1, 2 (pairs)
  isFixed?: boolean;     // If true, player cannot rotate or move
  powered?: boolean;     // Receivers: is currently receiving correct light?
}

export interface GridPos {
  x: number;
  y: number;
}

export interface BeamSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: LightColor;
  direction: Direction;
  sourceType: string;
}

export interface RayHit {
  x: number;
  y: number;
  type: 'REFLECT' | 'SPLIT' | 'PASS' | 'BLOCK' | 'TARGET' | 'PORTAL';
  color: LightColor;
}

export interface LevelData {
  id: string;
  name: string;
  sanctuaryId: number;
  sanctuaryName: string;
  parMoves: number;
  width: number;
  height: number;
  description: string;
  grid: (TileState | null)[][];
  hint?: string;
}

export interface LevelProgress {
  completed: boolean;
  stars: number;
  bestMoves: number;
  bestTimeSec?: number;
}

export interface GameProgressState {
  unlockedLevelId: string;
  levels: Record<string, LevelProgress>;
  audioMuted: boolean;
  ambientMuted: boolean;
}

export type GameMode = 
  | 'TITLE_MENU'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'EDITOR';
