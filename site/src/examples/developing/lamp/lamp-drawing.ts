import type { HueOrHex } from '@oneonefour/rkui/shared/hues.ts'

/** Where a shape sits on the drawing's grid, in grid units from the top left. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** One part of the lamp, and how it comes apart. */
export interface Part {
  name: string
  /** SVG path data, in grid units */
  shape: string
  box: Box
  hue: HueOrHex
  /** How far it moves when the lamp comes apart, across and down, in grid units */
  apart: [number, number]
  /** How many layers it rises as it comes apart; each one lengthens its shadow */
  depth: number
}

/** The lamp's grid: 16 units wide and 38 tall, with the ground 32.4 units down. */
export const GRID = { columns: 16, rows: 38 }

/** The ground under the lamp, as three dashes. */
export const GROUND = 'M1 32.4H2.5M3.5 32.4H12.5M13.5 32.4H15'

/** The lamp's parts, back to front: a part in front is drawn over the ones behind it. */
export const PARTS: Part[] = [
  {
    name: 'Stem',
    shape: 'M7.2 21h1.6v8.5h-1.6z',
    box: { x: 7.2, y: 21, width: 1.6, height: 8.5 },
    hue: 'sky',
    apart: [0, 1],
    depth: 0,
  },
  {
    name: 'Base',
    shape: 'M4.9 29h6.2a1.4 1.4 0 0 1 0 2.8h-6.2a1.4 1.4 0 0 1 0 -2.8z',
    box: { x: 3.5, y: 29, width: 9, height: 2.8 },
    hue: 'navy',
    apart: [0, 6],
    depth: 1,
  },
  {
    name: 'Bulb',
    shape: 'M5.5 20.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0z',
    box: { x: 5.5, y: 18, width: 5, height: 5 },
    hue: 'yellow',
    apart: [0, -4],
    depth: 1,
  },
  {
    name: 'Shade',
    shape: 'M5 12L11 12L13.5 19L2.5 19z',
    box: { x: 2.5, y: 12, width: 11, height: 7 },
    hue: 'coral',
    apart: [0, -9],
    depth: 2,
  },
]
