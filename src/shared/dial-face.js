import { VIEWBOX, arcPath, polarToCartesian, percentOfFace, radialLine } from './dial-geometry.js'

/** Degrees of travel, centred on 12 o'clock, leaving a gap at the bottom. */
export const SWEEP = 270
export const START_ANGLE = -SWEEP / 2
export const END_ANGLE = SWEEP / 2

const TICK_COUNT = 11
const TICK_INNER_RADIUS = 84
const TICK_OUTER_RADIUS = 94
export const TRACK_RADIUS = 84
const LIMIT_RADIUS = 86
const LIMIT_ANGLE = 158
export const RAMP_BLOCK_COUNT = 18
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

/**
 * @param {string} text
 * @param {number} angle
 * @returns {string} a min or max label, beside the gap at the bottom
 */
function limitLabel(text, angle) {
  const { x, y } = polarToCartesian(LIMIT_RADIUS, angle)
  return `<text class="rkui-dial-limit" x="${x}" y="${y}">${text}</text>`
}

/** @returns {string} evenly spaced tick marks around the dial's travel */
function ticks() {
  return Array.from({ length: TICK_COUNT }, (_, index) =>
    radialLine(
      'rkui-dial-tick',
      TICK_INNER_RADIUS,
      TICK_OUTER_RADIUS,
      START_ANGLE + (index * SWEEP) / (TICK_COUNT - 1),
    ),
  ).join('')
}

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
 * @param {number} fraction how far round the dial the value is, from 0 to 1
 * @returns {string} the ramp's blocks around the dial's travel, each filled with its step's
 *   colour, `--rkui-dial-ramp-1` to `--rkui-dial-ramp-<stepCount>`, in equal runs
 */
function rampBlocks(stepCount, fraction) {
  const width = SWEEP / RAMP_BLOCK_COUNT
  return Array.from({ length: RAMP_BLOCK_COUNT }, (_, index) => {
    const from = START_ANGLE + index * width + RAMP_BLOCK_GAP / 2
    const d = blockPath(from, from + width - RAMP_BLOCK_GAP)
    const step = Math.floor((index * stepCount) / RAMP_BLOCK_COUNT) + 1
    const lit = isBlockLit(index, fraction) ? ' data-lit=""' : ''
    const style = `--rkui-dial-block-fill: var(--rkui-dial-ramp-${step})`
    return `<path class="rkui-dial-block" d="${d}" style="${style}"${lit}/>`
  }).join('')
}

/**
 * @typedef {object} DialFaceOptions
 * @property {number} min
 * @property {number} max
 * @property {number} value
 * @property {boolean} arc a filled arc with a thumb, not a turning knob
 * @property {number} rampSteps how many colours the ring of blocks has; 0 for no ring
 */

/**
 * The dial face's markup, the same at build time as in the browser.
 * @param {DialFaceOptions} options
 * @returns {{ style: string, html: string }} inline CSS for the face element, and its contents
 */
export function dialFace({ min, max, value, arc, rampSteps }) {
  const angle = valueToAngle(value, min, max)
  const fraction = (value - min) / (max - min)
  const track = arcPath(TRACK_RADIUS, START_ANGLE, END_ANGLE)

  let marks = ticks()
  if (rampSteps > 0) {
    marks = rampBlocks(rampSteps, fraction)
  } else if (arc) {
    marks =
      `<path class="rkui-dial-track-outline" d="${track}"/>` +
      `<path class="rkui-dial-track" d="${track}"/>` +
      `<path class="rkui-dial-fill" d="${arcPath(TRACK_RADIUS, START_ANGLE, angle)}"/>`
  }

  const svg =
    `<svg viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">` +
    limitLabel(String(min), -LIMIT_ANGLE) +
    limitLabel(String(max), LIMIT_ANGLE) +
    marks +
    '</svg>'
  const control = arc
    ? '<span class="rkui-dial-thumb"></span>'
    : '<span class="rkui-dial-knob"><span class="rkui-dial-notch"></span></span>'

  return {
    style: faceStyle(angle),
    html: svg + control,
  }
}
