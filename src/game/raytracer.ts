/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BeamSegment,
  Direction,
  GridPos,
  LightColor,
  RayHit,
  TileState,
} from '../types/game';

// Vector offsets for directions
export const DIR_OFFSETS: Record<Direction, GridPos> = {
  UP: { x: 0, y: -1 },
  RIGHT: { x: 1, y: 0 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
};

// Opposite direction helper
export function getOppositeDir(dir: Direction): Direction {
  switch (dir) {
    case 'UP': return 'DOWN';
    case 'DOWN': return 'UP';
    case 'LEFT': return 'RIGHT';
    case 'RIGHT': return 'LEFT';
  }
}

// Color hex codes and glow styles for rendering
export const COLOR_CONFIG: Record<LightColor, {
  hex: string;
  glow: string;
  rgb: string;
  label: string;
  bgClass: string;
}> = {
  RED: {
    hex: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.7)',
    rgb: '239, 68, 68',
    label: 'Ruby Red',
    bgClass: 'bg-red-500',
  },
  GREEN: {
    hex: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.7)',
    rgb: '34, 197, 94',
    label: 'Emerald Green',
    bgClass: 'bg-emerald-500',
  },
  BLUE: {
    hex: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.7)',
    rgb: '59, 130, 246',
    label: 'Sapphire Blue',
    bgClass: 'bg-blue-500',
  },
  YELLOW: {
    hex: '#eab308',
    glow: 'rgba(234, 179, 8, 0.7)',
    rgb: '234, 179, 8',
    label: 'Solar Amber',
    bgClass: 'bg-amber-500',
  },
  CYAN: {
    hex: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.7)',
    rgb: '6, 182, 212',
    label: 'Aura Cyan',
    bgClass: 'bg-cyan-500',
  },
  MAGENTA: {
    hex: '#d946ef',
    glow: 'rgba(217, 70, 239, 0.7)',
    rgb: '217, 70, 239',
    label: 'Void Magenta',
    bgClass: 'bg-fuchsia-500',
  },
  WHITE: {
    hex: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.9)',
    rgb: '255, 255, 255',
    label: 'Pure Light',
    bgClass: 'bg-white',
  },
};

/**
 * Additive color mixing
 */
export function mixColors(c1: LightColor, c2: LightColor): LightColor {
  if (c1 === c2) return c1;
  if (c1 === 'WHITE' || c2 === 'WHITE') return 'WHITE';

  const pair = [c1, c2].sort().join('+');
  switch (pair) {
    case 'GREEN+RED':
      return 'YELLOW';
    case 'BLUE+RED':
      return 'MAGENTA';
    case 'BLUE+GREEN':
      return 'CYAN';
    case 'BLUE+YELLOW':
    case 'CYAN+RED':
    case 'GREEN+MAGENTA':
      return 'WHITE';
    case 'CYAN+YELLOW':
    case 'MAGENTA+YELLOW':
    case 'CYAN+MAGENTA':
      return 'WHITE';
    default:
      return 'WHITE';
  }
}

/**
 * Check if a color passes through a filter
 */
export function filterColor(beamColor: LightColor, filterTarget: LightColor): LightColor | null {
  if (beamColor === filterTarget) return beamColor;
  if (beamColor === 'WHITE') return filterTarget; // White breaks down into filter color

  // Secondary colors can pass their constituent primary colors
  if (beamColor === 'YELLOW' && (filterTarget === 'RED' || filterTarget === 'GREEN')) {
    return filterTarget;
  }
  if (beamColor === 'CYAN' && (filterTarget === 'BLUE' || filterTarget === 'GREEN')) {
    return filterTarget;
  }
  if (beamColor === 'MAGENTA' && (filterTarget === 'RED' || filterTarget === 'BLUE')) {
    return filterTarget;
  }

  return null; // Blocked
}

/**
 * Raytracer output result
 */
export interface TraceResult {
  segments: BeamSegment[];
  hits: RayHit[];
  poweredReceivers: { x: number; y: number; color: LightColor }[];
  isSolved: boolean;
  totalReceivers: number;
}

interface ActiveRay {
  x: number;
  y: number;
  dir: Direction;
  color: LightColor;
  startX: number;
  startY: number;
}

export function traceOpticalGrid(
  grid: (TileState | null)[][],
  width: number,
  height: number
): TraceResult {
  const segments: BeamSegment[] = [];
  const hits: RayHit[] = [];
  const poweredReceivers: { x: number; y: number; color: LightColor }[] = [];
  let totalReceivers = 0;

  // 1. Gather all portals to map pairings
  const portals: Record<number, GridPos[]> = {};
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y]?.[x];
      if (tile?.type === 'PORTAL') {
        const id = tile.portalId ?? 1;
        if (!portals[id]) portals[id] = [];
        portals[id].push({ x, y });
      } else if (tile?.type === 'CRYSTAL_RECEIVER') {
        totalReceivers++;
      }
    }
  }

  // 2. Identify all laser emitters as ray starting points
  const activeRays: ActiveRay[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y]?.[x];
      if (tile?.type === 'LASER_EMITTER') {
        const dir = tile.direction || 'RIGHT';
        const color = tile.color || 'RED';
        activeRays.push({
          x: x + 0.5,
          y: y + 0.5,
          dir,
          color,
          startX: x + 0.5,
          startY: y + 0.5,
        });
      }
    }
  }

  // Loop guard to prevent infinite reflection cycles
  const visited = new Set<string>();
  const MAX_BOUNCES = 120;
  let bounceCount = 0;

  while (activeRays.length > 0 && bounceCount < MAX_BOUNCES) {
    bounceCount++;
    const ray = activeRays.shift()!;
    const { dir, color } = ray;
    let currX = ray.x;
    let currY = ray.y;
    const startX = ray.startX;
    const startY = ray.startY;

    const offset = DIR_OFFSETS[dir];

    // March ray forward tile by tile
    let stepped = 0;
    const MAX_STEPS = Math.max(width, height) * 2;
    let terminated = false;

    while (stepped < MAX_STEPS && !terminated) {
      stepped++;
      const nextX = currX + offset.x;
      const nextY = currY + offset.y;
      const tileX = Math.floor(nextX);
      const tileY = Math.floor(nextY);

      // Check boundary exit
      if (tileX < 0 || tileX >= width || tileY < 0 || tileY >= height) {
        // Ray left the playing board
        segments.push({
          startX,
          startY,
          endX: nextX,
          endY: nextY,
          color,
          direction: dir,
          sourceType: 'EDGE',
        });
        terminated = true;
        break;
      }

      const tile = grid[tileY]?.[tileX];

      if (!tile || tile.type === 'EMPTY' || tile.type === 'GLASS') {
        // Empty space or transparent glass: continue through
        currX = nextX;
        currY = nextY;
        continue;
      }

      // Ray hit a tile at (tileX, tileY)
      // Tile center coordinate
      const centerX = tileX + 0.5;
      const centerY = tileY + 0.5;

      // Add beam segment up to tile center
      segments.push({
        startX,
        startY,
        endX: centerX,
        endY: centerY,
        color,
        direction: dir,
        sourceType: tile.type,
      });

      // Avoid infinite loop on same tile + incoming direction + color
      const stateKey = `${tileX},${tileY},${dir},${color}`;
      if (visited.has(stateKey)) {
        terminated = true;
        break;
      }
      visited.add(stateKey);

      // Process interaction by tile type
      switch (tile.type) {
        case 'WALL': {
          hits.push({ x: centerX, y: centerY, type: 'BLOCK', color });
          terminated = true;
          break;
        }

        case 'CRYSTAL_RECEIVER': {
          const reqColor = tile.color || 'RED';
          const isCorrect = (color === reqColor || reqColor === 'WHITE');
          
          if (isCorrect) {
            hits.push({ x: centerX, y: centerY, type: 'TARGET', color });
            // Check if already powered
            if (!poweredReceivers.some(r => r.x === tileX && r.y === tileY)) {
              poweredReceivers.push({ x: tileX, y: tileY, color });
            }
          } else {
            hits.push({ x: centerX, y: centerY, type: 'BLOCK', color });
          }
          terminated = true;
          break;
        }

        case 'MIRROR': {
          // Standard diagonal deflection mirror
          // Normal is determined by rotation:
          // rot 0 or 180 = '/' (bottom-left to top-right)
          // rot 90 or 270 = '\' (top-left to bottom-right)
          const normRot = ((tile.rotation % 360) + 360) % 360;
          let newDir: Direction | null = null;

          if (normRot === 0 || normRot === 180) {
            // '/' diagonal
            if (dir === 'RIGHT') newDir = 'UP';
            else if (dir === 'UP') newDir = 'RIGHT';
            else if (dir === 'LEFT') newDir = 'DOWN';
            else if (dir === 'DOWN') newDir = 'LEFT';
          } else {
            // '\' diagonal (90 or 270 deg)
            if (dir === 'RIGHT') newDir = 'DOWN';
            else if (dir === 'DOWN') newDir = 'RIGHT';
            else if (dir === 'LEFT') newDir = 'UP';
            else if (dir === 'UP') newDir = 'LEFT';
          }

          if (newDir) {
            hits.push({ x: centerX, y: centerY, type: 'REFLECT', color });
            activeRays.push({
              x: centerX,
              y: centerY,
              dir: newDir,
              color,
              startX: centerX,
              startY: centerY,
            });
          }
          terminated = true;
          break;
        }

        case 'DOUBLE_MIRROR': {
          // Two-sided 45° double-deflector
          const normRot = ((tile.rotation % 360) + 360) % 360;
          let newDir: Direction | null = null;

          if (normRot === 0 || normRot === 180) {
            if (dir === 'RIGHT') newDir = 'UP';
            else if (dir === 'UP') newDir = 'RIGHT';
            else if (dir === 'LEFT') newDir = 'DOWN';
            else if (dir === 'DOWN') newDir = 'LEFT';
          } else {
            if (dir === 'RIGHT') newDir = 'DOWN';
            else if (dir === 'DOWN') newDir = 'RIGHT';
            else if (dir === 'LEFT') newDir = 'UP';
            else if (dir === 'UP') newDir = 'LEFT';
          }

          if (newDir) {
            hits.push({ x: centerX, y: centerY, type: 'REFLECT', color });
            activeRays.push({
              x: centerX,
              y: centerY,
              dir: newDir,
              color,
              startX: centerX,
              startY: centerY,
            });
          }
          terminated = true;
          break;
        }

        case 'PRISM': {
          // Beam splitter: transmits straight AND splits perpendicular
          // Rotation specifies primary deflection direction:
          // 0°: Splits into (dir) and 90° clockwise
          // 90°: Splits into 90° clockwise and 90° counter-clockwise
          hits.push({ x: centerX, y: centerY, type: 'SPLIT', color });
          
          let splitDir1: Direction = dir;
          let splitDir2: Direction;

          if (dir === 'RIGHT' || dir === 'LEFT') {
            splitDir2 = (tile.rotation === 90 || tile.rotation === 270) ? 'DOWN' : 'UP';
          } else {
            splitDir2 = (tile.rotation === 90 || tile.rotation === 270) ? 'RIGHT' : 'LEFT';
          }

          // Ray 1: continues forward
          activeRays.push({
            x: centerX,
            y: centerY,
            dir: splitDir1,
            color,
            startX: centerX,
            startY: centerY,
          });

          // Ray 2: splits perpendicular
          activeRays.push({
            x: centerX,
            y: centerY,
            dir: splitDir2,
            color,
            startX: centerX,
            startY: centerY,
          });

          terminated = true;
          break;
        }

        case 'PORTAL': {
          const id = tile.portalId ?? 1;
          const pair = portals[id] || [];
          const otherPortal = pair.find(p => p.x !== tileX || p.y !== tileY);

          if (otherPortal) {
            hits.push({ x: centerX, y: centerY, type: 'PORTAL', color });
            const exitCenterX = otherPortal.x + 0.5;
            const exitCenterY = otherPortal.y + 0.5;

            activeRays.push({
              x: exitCenterX,
              y: exitCenterY,
              dir, // maintains velocity direction
              color,
              startX: exitCenterX,
              startY: exitCenterY,
            });
          } else {
            // Portal without pair absorbs beam
            hits.push({ x: centerX, y: centerY, type: 'BLOCK', color });
          }
          terminated = true;
          break;
        }

        case 'FILTER': {
          const filterTarget = tile.color || 'RED';
          const emergentColor = filterColor(color, filterTarget);

          if (emergentColor) {
            hits.push({ x: centerX, y: centerY, type: 'PASS', color: emergentColor });
            // Continues straight through with altered wavelength!
            activeRays.push({
              x: centerX,
              y: centerY,
              dir,
              color: emergentColor,
              startX: centerX,
              startY: centerY,
            });
          } else {
            // Light does not pass
            hits.push({ x: centerX, y: centerY, type: 'BLOCK', color });
          }
          terminated = true;
          break;
        }

        case 'POLARIZER': {
          // 0 or 180 = HORIZONTAL, 90 or 270 = VERTICAL
          const normRot = ((tile.rotation % 360) + 360) % 360;
          const isHorizontal = (normRot === 0 || normRot === 180);
          const isAligned = isHorizontal
            ? (dir === 'LEFT' || dir === 'RIGHT')
            : (dir === 'UP' || dir === 'DOWN');

          if (isAligned) {
            hits.push({ x: centerX, y: centerY, type: 'PASS', color });
            activeRays.push({
              x: centerX,
              y: centerY,
              dir,
              color,
              startX: centerX,
              startY: centerY,
            });
          } else {
            hits.push({ x: centerX, y: centerY, type: 'BLOCK', color });
          }
          terminated = true;
          break;
        }

        case 'LASER_EMITTER': {
          // Laser emitter blocks beams hitting it from the front/side
          hits.push({ x: centerX, y: centerY, type: 'BLOCK', color });
          terminated = true;
          break;
        }

        default:
          currX = nextX;
          currY = nextY;
          break;
      }
    }
  }

  const isSolved = (totalReceivers > 0) && (poweredReceivers.length === totalReceivers);

  return {
    segments,
    hits,
    poweredReceivers,
    isSolved,
    totalReceivers,
  };
}
