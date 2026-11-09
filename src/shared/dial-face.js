import { arcPath, polarToCartesian, percentOfFace, radialLine } from './dial-geometry.js'

/** Degrees of travel, centred on 12 o'clock, leaving a gap at the bottom. */
const SWEEP = 270
export const START_ANGLE = -SWEEP / 2
export const END_ANGLE = SWEEP / 2

const TICK_COUNT = 11
const TICK_INNER_RADIUS = 84
const TICK_OUTER_RADIUS = 94
export const TRACK_RADIUS = 84
const LIMIT_RADIUS = 86
const LIMIT_ANGLE = 158
const RAMP_BLOCK_COUNT = 18
/** Degrees left empty between neighbouring ramp blocks */
const RAMP_BLOCK_GAP = 3
const RAMP_INNER_RADIUS = 74
const RAMP_OUTER_RADIUS = 94

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number} the angle that shows `value` on the dial
 */
export function valueToAngle(value, min, max) {
  return START_ANGLE + ((value - min) / (max - min)) * SWEEP
}

/**
 * @param {number} angle an angle within the dial's travel
 * @param {number} min
 * @param {number} max
 * @returns {number} the value at `angle`, not yet snapped to a step
 */
export function angleToValue(angle, min, max) {
  return min + ((angle - START_ANGLE) / SWEEP) * (max - min)
}

/**
 * @param {number} index which ramp block, from 0
 * @param {number} fraction how far round the dial the value is, from 0 to 1
 * @returns {boolean} whether the block is lit: once the value reaches its middle
 */
export function isBlockLit(index, fraction) {
  return (index + 0.5) / RAMP_BLOCK_COUNT <= fraction
}

/**
 * @param {number} angle where the dial points
 * @returns {string} inline CSS for the face element: the knob's angle, and the point of the track
 *   where the arc's thumb sits
 */
export function faceStyle(angle) {
  const { x, y } = percentOfFace(TRACK_RADIUS, angle)
  return `--rkui-dial-angle: ${angle}deg; --rkui-dial-thumb-x: ${x}%; --rkui-dial-thumb-y: ${y}%`
}

/** Where the min label sits, in SVG units, left of the gap at the bottom. */
export const MIN_LABEL = polarToCartesian(LIMIT_RADIUS, -LIMIT_ANGLE)
/** Where the max label sits, in SVG units, right of the gap at the bottom. */
export const MAX_LABEL = polarToCartesian(LIMIT_RADIUS, LIMIT_ANGLE)

/** Evenly spaced tick marks around the dial's travel, as the ends of SVG lines. */
export const TICKS = Array.from({ length: TICK_COUNT }, (_, index) =>
  radialLine(
    TICK_INNER_RADIUS,
    TICK_OUTER_RADIUS,
    START_ANGLE + (index * SWEEP) / (TICK_COUNT - 1),
  ),
)

/** SVG path data for the arc's track, round the whole of the dial's travel. */
export const TRACK = arcPath(TRACK_RADIUS, START_ANGLE, END_ANGLE)

/**
 * @param {number} fromAngle
 * @param {number} toAngle
 * @returns {string} SVG path data for a block of the ramp's ring, between the two angles
 */
function blockPath(fromAngle, toAngle) {
  const outerStart = polarToCartesian(RAMP_OUTER_RADIUS, fromAngle)
  const outerEnd = polarToCartesian(RAMP_OUTER_RADIUS, toAngle)
  const innerEnd = polarToCartesian(RAMP_INNER_RADIUS, toAngle)
  const innerStart = polarToCartesian(RAMP_INNER_RADIUS, fromAngle)
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${RAMP_OUTER_RADIUS} ${RAMP_OUTER_RADIUS} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${RAMP_INNER_RADIUS} ${RAMP_INNER_RADIUS} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

/**
 * @param {number} stepCount how many colours the ramp has
 * @returns {{ d: string, fill: string }[]} the ramp's blocks around the dial's travel: each one's
 *   SVG path data, and its colour, `--rkui-dial-ramp-1` to `--rkui-dial-ramp-<stepCount>` in
 *   equal runs
 */
export function rampBlocks(stepCount) {
  const width = SWEEP / RAMP_BLOCK_COUNT
  return Array.from({ length: RAMP_BLOCK_COUNT }, (_, index) => {
    const from = START_ANGLE + index * width + RAMP_BLOCK_GAP / 2
    const step = Math.floor((index * stepCount) / RAMP_BLOCK_COUNT) + 1
    return {
      d: blockPath(from, from + width - RAMP_BLOCK_GAP),
      fill: `var(--rkui-dial-ramp-${step})`,
    }
  })
}
