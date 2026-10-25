/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, TileState } from '../types/game';

function createGrid(w: number, h: number): (TileState | null)[][] {
  const grid: (TileState | null)[][] = [];
  for (let y = 0; y < h; y++) {
    const row: (TileState | null)[] = [];
    for (let x = 0; x < w; x++) {
      row.push(null);
    }
    grid.push(row);
  }
  return grid;
}

export const CAMPAIGN_LEVELS: LevelData[] = [
  // ==========================================
  // SANCTUARY I: THE DAWN APERTURE (Basics & Reflection)
  // ==========================================
  {
    id: 'lvl_1',
    name: 'First Resonance',
    sanctuaryId: 1,
    sanctuaryName: 'Sanctuary I: The Dawn Aperture',
    parMoves: 1,
    width: 6,
    height: 6,
    description: 'Rotate the central crystal mirror to guide the Ruby beam into the slumbering core.',
    hint: 'Click or press Space on the mirror to deflect the beam 90 degrees upward.',
    grid: (() => {
      const g = createGrid(6, 6);
      // Emitter at (0, 3) pointing RIGHT, RED
      g[3][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      // Mirror at (3, 3), starts at 90 deg (deflects downward initially)
      g[3][3] = { type: 'MIRROR', rotation: 90, isFixed: false };
      // Target Crystal at (3, 1), requires RED
      g[1][3] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_2',
    name: 'Dual Reflections',
    sanctuaryId: 1,
    sanctuaryName: 'Sanctuary I: The Dawn Aperture',
    parMoves: 2,
    width: 6,
    height: 6,
    description: 'Use two mirrors to route the beam around ancient obsidian walls.',
    hint: 'Rotate the top mirror to deflect downward, and the bottom mirror to deflect toward the crystal.',
    grid: (() => {
      const g = createGrid(6, 6);
      // Emitter at (0, 1) pointing RIGHT
      g[1][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      // Top Mirror at (4, 1) - starts at 0° (deflecting UP). Rotate to 90° deflects DOWN
      g[1][4] = { type: 'MIRROR', rotation: 0, isFixed: false };
      // Central stone obstacles (NOT blocking column 4 or row 4)
      g[2][2] = { type: 'WALL', rotation: 0, isFixed: true };
      g[3][2] = { type: 'WALL', rotation: 0, isFixed: true };
      g[1][5] = { type: 'WALL', rotation: 0, isFixed: true };
      // Bottom Mirror at (4, 4) - starts at 90° (deflecting DOWN). Rotate to 0° deflects LEFT
      g[4][4] = { type: 'MIRROR', rotation: 90, isFixed: false };
      // Target Crystal at (1, 4)
      g[4][1] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_3',
    name: 'The Perilous S-Bend',
    sanctuaryId: 1,
    sanctuaryName: 'Sanctuary I: The Dawn Aperture',
    parMoves: 3,
    width: 7,
    height: 6,
    description: 'Weave through an obsidian maze using three precision mirrors.',
    hint: 'Form an S-shaped trajectory: down, left, then down to the emerald core.',
    grid: (() => {
      const g = createGrid(7, 6);
      // Emitter at (1, 1) pointing RIGHT
      g[1][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'GREEN', isFixed: true };
      // Mirror 1 at (5, 1) deflects DOWN to row 3
      g[1][5] = { type: 'MIRROR', rotation: 0, isFixed: false };
      // Wall barrier in center
      g[2][2] = { type: 'WALL', rotation: 0, isFixed: true };
      g[2][3] = { type: 'WALL', rotation: 0, isFixed: true };
      // Mirror 2 at (5, 3) deflects LEFT to col 2
      g[3][5] = { type: 'MIRROR', rotation: 90, isFixed: false };
      // Mirror 3 at (2, 3) deflects DOWN to row 5
      g[3][2] = { type: 'MIRROR', rotation: 0, isFixed: false };
      // Target at (2, 5)
      g[5][2] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_4',
    name: 'Prismatic Split',
    sanctuaryId: 1,
    sanctuaryName: 'Sanctuary I: The Dawn Aperture',
    parMoves: 2,
    width: 7,
    height: 7,
    description: 'Split a single beam using an optical prism to awaken twin crystal shrines.',
    hint: 'Rotate the Prism to split the beam upward and forward toward the second mirror.',
    grid: (() => {
      const g = createGrid(7, 7);
      // Emitter at (0, 3) pointing RIGHT
      g[3][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'BLUE', isFixed: true };
      // Prism splitter at (3, 3) - splits UP to (3, 1) and straight to (5, 3)
      g[3][3] = { type: 'PRISM', rotation: 90, isFixed: false };
      // Crystal 1 at (3, 1)
      g[1][3] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };
      // Mirror at (5, 3) deflects DOWN to (5, 5)
      g[3][5] = { type: 'MIRROR', rotation: 0, isFixed: false };
      // Crystal 2 at (5, 5)
      g[5][5] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_5',
    name: 'Glass Corridors',
    sanctuaryId: 1,
    sanctuaryName: 'Sanctuary I: The Dawn Aperture',
    parMoves: 3,
    width: 7,
    height: 7,
    description: 'Light penetrates glass barriers but cannot cross solid obsidian stone.',
    hint: 'Route the beam straight through the glass channel down to the lower corridor.',
    grid: (() => {
      const g = createGrid(7, 7);
      g[1][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      g[1][5] = { type: 'MIRROR', rotation: 0, isFixed: false };
      // Glass channel
      g[2][5] = { type: 'GLASS', rotation: 0, isFixed: true };
      g[3][5] = { type: 'GLASS', rotation: 0, isFixed: true };
      // Obsidian pillars blocking center
      g[2][3] = { type: 'WALL', rotation: 0, isFixed: true };
      g[3][3] = { type: 'WALL', rotation: 0, isFixed: true };
      g[4][5] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[4][2] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[6][2] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_6',
    name: 'The Crossroad Conundrum',
    sanctuaryId: 1,
    sanctuaryName: 'Sanctuary I: The Dawn Aperture',
    parMoves: 4,
    width: 7,
    height: 7,
    description: 'Two separate colored beams must cross paths without colliding into walls.',
    hint: 'Light beams pass straight through each other at intersections.',
    grid: (() => {
      const g = createGrid(7, 7);
      // Red beam
      g[2][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      g[2][2] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[5][2] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[5][6] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };

      // Green beam
      g[0][4] = { type: 'LASER_EMITTER', direction: 'DOWN', rotation: 0, color: 'GREEN', isFixed: true };
      g[4][4] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[4][1] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[6][1] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };
      return g;
    })(),
  },

  // ==========================================
  // SANCTUARY II: CHROMATIC SPECTRUM (Color Filters & Mixing)
  // ==========================================
  {
    id: 'lvl_7',
    name: 'The Ruby Filter',
    sanctuaryId: 2,
    sanctuaryName: 'Sanctuary II: Chromatic Spectrum',
    parMoves: 2,
    width: 7,
    height: 7,
    description: 'A pure White beam carries all spectrums. Direct it through an ancient Ruby Filter.',
    hint: 'A Red Filter converts White light into pure Ruby Red.',
    grid: (() => {
      const g = createGrid(7, 7);
      g[2][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[2][3] = { type: 'FILTER', rotation: 0, color: 'RED', isFixed: true };
      g[2][5] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[5][5] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[5][2] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_8',
    name: 'Chromatic Triad',
    sanctuaryId: 2,
    sanctuaryName: 'Sanctuary II: Chromatic Spectrum',
    parMoves: 3,
    width: 8,
    height: 7,
    description: 'Filter White light into Sapphire Blue and guide it through stone arches.',
    hint: 'Position mirrors around the central pillars to reach the core.',
    grid: (() => {
      const g = createGrid(8, 7);
      g[1][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[1][3] = { type: 'FILTER', rotation: 0, color: 'BLUE', isFixed: true };
      g[1][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      // Center wall obstacle
      g[2][4] = { type: 'WALL', rotation: 0, isFixed: true };
      g[3][4] = { type: 'WALL', rotation: 0, isFixed: true };
      g[4][6] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[4][2] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[6][2] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_9',
    name: 'Dual Wavelengths',
    sanctuaryId: 2,
    sanctuaryName: 'Sanctuary II: Chromatic Spectrum',
    parMoves: 3,
    width: 8,
    height: 7,
    description: 'Two separate emitters must be routed into their corresponding resonant crystals.',
    hint: 'Emerald light must reach the upper altar; Ruby light must reach the right altar.',
    grid: (() => {
      const g = createGrid(8, 7);
      g[1][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'GREEN', isFixed: true };
      g[1][4] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[0][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };

      g[5][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      g[5][5] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[3][5] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[3][7] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_10',
    name: 'Solar Alchemy (Yellow)',
    sanctuaryId: 2,
    sanctuaryName: 'Sanctuary II: Chromatic Spectrum',
    parMoves: 3,
    width: 8,
    height: 8,
    description: 'Filter White light into Yellow to energize the Solar Core.',
    hint: 'Pass White light through the Yellow filter, then deflect to the core.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[2][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[2][4] = { type: 'FILTER', rotation: 0, color: 'YELLOW', isFixed: true };
      g[2][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[5][6] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[5][3] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[7][3] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'YELLOW', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_11',
    name: 'Aura of Cyan',
    sanctuaryId: 2,
    sanctuaryName: 'Sanctuary II: Chromatic Spectrum',
    parMoves: 4,
    width: 8,
    height: 8,
    description: 'Cyan crystals resonate at Green + Blue wavelengths. Filter and guide with precision.',
    hint: 'Filter to Cyan, then route through the chamber perimeter.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[1][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[1][3] = { type: 'FILTER', rotation: 0, color: 'CYAN', isFixed: true };
      g[1][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[4][6] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[4][2] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[6][2] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[6][5] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'CYAN', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_12',
    name: 'Void Magenta Synthesis',
    sanctuaryId: 2,
    sanctuaryName: 'Sanctuary II: Chromatic Spectrum',
    parMoves: 4,
    width: 8,
    height: 8,
    description: 'Magenta is the rarest frequency. Activate both Magenta and Ruby receivers.',
    hint: 'Route the White light through Magenta, and the Red emitter to its shrine.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[2][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[2][3] = { type: 'FILTER', rotation: 0, color: 'MAGENTA', isFixed: true };
      g[2][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[5][6] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[5][2] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'MAGENTA', isFixed: true };

      // Secondary ruby receiver
      g[6][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      g[6][4] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[4][4] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[4][1] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      return g;
    })(),
  },

  // ==========================================
  // SANCTUARY III: REFRACTION GATES (Prisms, Splitters & Portals)
  // ==========================================
  {
    id: 'lvl_13',
    name: 'Prismatic Division',
    sanctuaryId: 3,
    sanctuaryName: 'Sanctuary III: Refraction Gates',
    parMoves: 2,
    width: 8,
    height: 8,
    description: 'A refractive Prism splits a single laser beam into two concurrent rays.',
    hint: 'Rotate the Prism so one beam continues forward and the other refracts upward.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[3][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'GREEN', isFixed: true };
      g[3][4] = { type: 'PRISM', rotation: 90, isFixed: false };
      // Target 1 straight ahead
      g[3][7] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };
      // Target 2 deflected
      g[1][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_14',
    name: 'Quantum Gateway',
    sanctuaryId: 3,
    sanctuaryName: 'Sanctuary III: Refraction Gates',
    parMoves: 2,
    width: 8,
    height: 8,
    description: 'Wormhole Portals teleport light instantly across disconnected chambers.',
    hint: 'Beams enter Portal 1 and emerge from the paired Portal with identical momentum.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[2][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'BLUE', isFixed: true };
      g[2][4] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      // Paired portal at lower left
      g[5][2] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[5][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[2][6] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_15',
    name: 'Split & Warp',
    sanctuaryId: 3,
    sanctuaryName: 'Sanctuary III: Refraction Gates',
    parMoves: 3,
    width: 8,
    height: 8,
    description: 'Split a beam with a prism, sending one half into a portal and the other to a core.',
    hint: 'One branch powers the straight crystal, the other travels through the wormhole.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[4][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      g[4][3] = { type: 'PRISM', rotation: 90, isFixed: false };
      g[1][3] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[6][6] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[4][7] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      g[2][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[2][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_16',
    name: 'The Polarized Seal',
    sanctuaryId: 3,
    sanctuaryName: 'Sanctuary III: Refraction Gates',
    parMoves: 3,
    width: 8,
    height: 8,
    description: 'Polarizers permit only horizontal or vertical light waves to pass through.',
    hint: 'Ensure the beam enters the polarizer in parallel horizontal alignment.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[2][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'CYAN', isFixed: true };
      g[2][3] = { type: 'POLARIZER', rotation: 90, isFixed: false }; // Rotate to 0 for horizontal
      g[2][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[5][6] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[5][1] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'CYAN', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_17',
    name: 'Twin Gateways',
    sanctuaryId: 3,
    sanctuaryName: 'Sanctuary III: Refraction Gates',
    parMoves: 4,
    width: 8,
    height: 8,
    description: 'Two separate portal channels criss-cross through an ancient chamber.',
    hint: 'Track portal pair IDs (Portal 1 and Portal 2).',
    grid: (() => {
      const g = createGrid(8, 8);
      // Pair 1
      g[1][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'YELLOW', isFixed: true };
      g[1][3] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[6][1] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[6][4] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[4][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'YELLOW', isFixed: true };

      // Pair 2
      g[3][7] = { type: 'LASER_EMITTER', direction: 'LEFT', rotation: 0, color: 'GREEN', isFixed: true };
      g[3][5] = { type: 'PORTAL', rotation: 0, portalId: 2, isFixed: true };
      g[0][5] = { type: 'PORTAL', rotation: 0, portalId: 2, isFixed: true };
      g[0][2] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[2][2] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_18',
    name: 'Cascade of Prisms',
    sanctuaryId: 3,
    sanctuaryName: 'Sanctuary III: Refraction Gates',
    parMoves: 4,
    width: 8,
    height: 8,
    description: 'A single White emitter must power three distinct crystal nodes via cascading splitters.',
    hint: 'Split once, then split one of the secondary branches again.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[4][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[4][3] = { type: 'PRISM', rotation: 90, isFixed: false };
      g[4][7] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'WHITE', isFixed: true };
      g[2][3] = { type: 'PRISM', rotation: 0, isFixed: false };
      g[0][3] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'WHITE', isFixed: true };
      g[2][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[1][6] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'WHITE', isFixed: true };
      return g;
    })(),
  },

  // ==========================================
  // SANCTUARY IV: THE CELESTIAL CORE (Grand Synthesis)
  // ==========================================
  {
    id: 'lvl_19',
    name: 'The Celestial Trinity',
    sanctuaryId: 4,
    sanctuaryName: 'Sanctuary IV: The Celestial Core',
    parMoves: 3,
    width: 8,
    height: 8,
    description: 'Three elemental crystals: Ruby, Sapphire, and Emerald await synchronized illumination.',
    hint: 'Use the mirrors to route each colored beam to its matching shrine.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[1][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      g[4][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'GREEN', isFixed: true };
      g[7][4] = { type: 'LASER_EMITTER', direction: 'UP', rotation: 0, color: 'BLUE', isFixed: true };

      g[1][5] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[0][5] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };

      g[4][3] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[6][3] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };

      g[3][4] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[3][7] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_20',
    name: 'Warp Synthesis',
    sanctuaryId: 4,
    sanctuaryName: 'Sanctuary IV: The Celestial Core',
    parMoves: 4,
    width: 8,
    height: 8,
    description: 'Combine portals with color filtration to solve the labyrinth of the elders.',
    hint: 'Route the white light into the portal before filtering to avoid obstacles.',
    grid: (() => {
      const g = createGrid(8, 8);
      g[2][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[2][3] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[5][1] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[5][4] = { type: 'FILTER', rotation: 0, color: 'CYAN', isFixed: true };
      g[5][6] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[7][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[7][3] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'CYAN', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_21',
    name: 'The Diamond Core',
    sanctuaryId: 4,
    sanctuaryName: 'Sanctuary IV: The Celestial Core',
    parMoves: 5,
    width: 9,
    height: 9,
    description: 'A diamond formation of mirrors guides four light paths simultaneously.',
    hint: 'Symmetry is the key to balancing the four cardinal alignments.',
    grid: (() => {
      const g = createGrid(9, 9);
      g[4][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'YELLOW', isFixed: true };
      g[4][2] = { type: 'PRISM', rotation: 90, isFixed: false };
      g[2][2] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[2][6] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[6][2] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[6][6] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[0][6] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'YELLOW', isFixed: true };
      g[8][6] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'YELLOW', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_22',
    name: 'The Prismatic Ring',
    sanctuaryId: 4,
    sanctuaryName: 'Sanctuary IV: The Celestial Core',
    parMoves: 5,
    width: 9,
    height: 9,
    description: 'A complex ring circuit requiring multiple mirror deflections and prism splits.',
    hint: 'Split the beam first, then direct each half along the outer ring corridors.',
    grid: (() => {
      const g = createGrid(9, 9);
      g[1][1] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'BLUE', isFixed: true };
      g[1][4] = { type: 'PRISM', rotation: 90, isFixed: false };
      g[1][7] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[5][7] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[5][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };

      g[4][4] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[7][4] = { type: 'MIRROR', rotation: 90, isFixed: false };
      g[7][1] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_23',
    name: 'Singularity Aperture',
    sanctuaryId: 4,
    sanctuaryName: 'Sanctuary IV: The Celestial Core',
    parMoves: 5,
    width: 9,
    height: 9,
    description: 'Coordinate dual portals, two color filters, and dual receivers in harmony.',
    hint: 'White light must be split before reaching the respective color filters.',
    grid: (() => {
      const g = createGrid(9, 9);
      g[4][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'WHITE', isFixed: true };
      g[4][3] = { type: 'PRISM', rotation: 90, isFixed: false };
      g[2][3] = { type: 'FILTER', rotation: 0, color: 'RED', isFixed: true };
      g[1][3] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };

      g[4][5] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[7][2] = { type: 'PORTAL', rotation: 0, portalId: 1, isFixed: true };
      g[7][5] = { type: 'FILTER', rotation: 0, color: 'BLUE', isFixed: true };
      g[7][7] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[5][7] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'BLUE', isFixed: true };
      return g;
    })(),
  },
  {
    id: 'lvl_24',
    name: 'The Omega Monolith',
    sanctuaryId: 4,
    sanctuaryName: 'Sanctuary IV: The Celestial Core',
    parMoves: 4,
    width: 9,
    height: 9,
    description: 'The pinnacle of Lumina. Master every optical artifact to awaken the Celestial Core.',
    hint: 'Align both mirrors to direct the Red and Green beams into their sacred altars.',
    grid: (() => {
      const g = createGrid(9, 9);
      // Emitters
      g[2][0] = { type: 'LASER_EMITTER', direction: 'RIGHT', rotation: 0, color: 'RED', isFixed: true };
      g[6][8] = { type: 'LASER_EMITTER', direction: 'LEFT', rotation: 0, color: 'GREEN', isFixed: true };

      // Mirror for Red
      g[2][4] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[8][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'RED', isFixed: true };

      // Mirror for Green
      g[6][4] = { type: 'MIRROR', rotation: 0, isFixed: false };
      g[0][4] = { type: 'CRYSTAL_RECEIVER', rotation: 0, color: 'GREEN', isFixed: true };
      return g;
    })(),
  },
];

/**
 * Generate a deterministic Daily Puzzle based on the date string
 */
export function getDailyEnigma(dateStr: string): LevelData {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) & 0xffffff;
  }

  const width = 8;
  const height = 8;
  const grid = createGrid(width, height);

  const colors: ('RED' | 'GREEN' | 'BLUE' | 'YELLOW' | 'CYAN' | 'MAGENTA')[] = [
    'RED', 'GREEN', 'BLUE', 'YELLOW', 'CYAN', 'MAGENTA'
  ];
  const color = colors[hash % colors.length];

  const emitterY = 2 + (hash % 4);
  grid[emitterY][0] = {
    type: 'LASER_EMITTER',
    direction: 'RIGHT',
    rotation: 0,
    color,
    isFixed: true,
  };

  const m1X = 3 + ((hash >> 2) % 3);
  const m1Y = emitterY;
  grid[m1Y][m1X] = {
    type: 'MIRROR',
    rotation: ((hash >> 3) % 2) * 90,
    isFixed: false,
  };

  const m2X = m1X;
  const m2Y = 1 + ((hash >> 4) % 2);
  grid[m2Y][m2X] = {
    type: 'MIRROR',
    rotation: ((hash >> 5) % 2) * 90,
    isFixed: false,
  };

  const m3X = 6;
  const m3Y = m2Y;
  grid[m3Y][m3X] = {
    type: 'MIRROR',
    rotation: ((hash >> 6) % 2) * 90,
    isFixed: false,
  };

  const targetX = m3X;
  const targetY = 6;
  grid[targetY][targetX] = {
    type: 'CRYSTAL_RECEIVER',
    rotation: 0,
    color,
    isFixed: true,
  };

  return {
    id: `daily_${dateStr}`,
    name: `Daily Enigma · ${dateStr}`,
    sanctuaryId: 0,
    sanctuaryName: 'Daily Celestial Trial',
    parMoves: 3,
    width,
    height,
    description: `A unique daily optical challenge for ${dateStr}. Guide the ${color.toLowerCase()} beam to the target core.`,
    hint: 'Trace the light path backwards from the crystal receiver to determine each mirror angle.',
    grid,
  };
}
