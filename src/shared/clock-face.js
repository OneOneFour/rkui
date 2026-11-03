import {
  CENTRE,
  VIEWBOX,
  arcPath,
  nearestTurn,
  percentOfFace,
  radialLine,
  wrap,
} from './dial-geometry.js'

/** The day and night ring, where the hour hand's tag rides */
export const RING_RADIUS = 86
const RING_WIDTH = 28
const TICK_INNER_RADIUS = 58
const QUARTER_TICK_INNER_RADIUS = 54
const TICK_OUTER_RADIUS = 66
const MINUTE_HAND_RADIUS = 40

/** The hour hand goes round once a day, with noon at the top and midnight at the bottom. */
export const DEGREES_PER_HOUR = 360 / 24
export const DEGREES_PER_MINUTE = 360 / 60
export const NOON_ANGLE = 12 * DEGREES_PER_HOUR

/**
 * @param {number} value
 * @returns {string} the value as two digits
 */
export function twoDigits(value) {
  return String(value).padStart(2, '0')
}

/**
 * @param {number} hours
 * @param {number} minutes
 * @param {{ hour: number, minute: number }} [previous] where the hands point now; both start at 0
 * @returns {{ hour: number, minute: number }} the angles for the hands, each the nearest turn to
 *   where it points now
 */
export function clockHandAngles(hours, minutes, previous = { hour: 0, minute: 0 }) {
  const hourAngle = wrap((hours + minutes / 60) * DEGREES_PER_HOUR - NOON_ANGLE, 360)
  return {
    hour: nearestTurn(previous.hour, hourAngle),
    minute: nearestTurn(previous.minute, minutes * DEGREES_PER_MINUTE),
  }
}

/**
 * @param {string} name
 * @param {number} angle
 * @returns {string} the properties that tell CSS where to centre the day or night icon, on the ring
 */
function iconPlacement(name, angle) {
  const { x, y } = percentOfFace(RING_RADIUS, angle)
  return `--rkui-clock-${name}-x: ${x}%; --rkui-clock-${name}-y: ${y}%`
}

/**
 * @param {string} className
 * @param {number} fromAngle
 * @returns {string} half of the day and night ring, clockwise from `fromAngle`
 */
function ringHalf(className, fromAngle) {
  const d = arcPath(RING_RADIUS, fromAngle, fromAngle + 180)
  return `<path class="${className}" d="${d}" stroke-width="${RING_WIDTH}"/>`
}

/** @returns {string} the day half of the ring over the top, the night half under it, and edges */
function dayAndNightRing() {
  const sixAm = 6 * DEGREES_PER_HOUR - NOON_ANGLE
  const sixPm = 18 * DEGREES_PER_HOUR - NOON_ANGLE
  const innerEdge = RING_RADIUS - RING_WIDTH / 2
  const outerEdge = RING_RADIUS + RING_WIDTH / 2
  return [
    ringHalf('rkui-clock-day', sixAm),
    ringHalf('rkui-clock-night', sixPm),
    `<circle class="rkui-clock-ring-edge" cx="${CENTRE}" cy="${CENTRE}" r="${innerEdge}"/>`,
    radialLine('rkui-clock-ring-edge', innerEdge, outerEdge, sixAm),
    radialLine('rkui-clock-ring-edge', innerEdge, outerEdge, sixPm),
  ].join('')
}

/** @returns {string} a tick for every five minutes, longer at the quarters */
function minuteTicks() {
  return Array.from({ length: 12 }, (_, index) => {
    const angle = index * 5 * DEGREES_PER_MINUTE
    return index % 3 === 0
      ? radialLine(
          'rkui-clock-tick rkui-clock-tick--quarter',
          QUARTER_TICK_INNER_RADIUS,
          TICK_OUTER_RADIUS,
          angle,
        )
      : radialLine('rkui-clock-tick', TICK_INNER_RADIUS, TICK_OUTER_RADIUS, angle)
  }).join('')
}

/**
 * @param {'hour' | 'minute'} name
 * @param {number} length in SVG units
 * @param {number} angle where the hand points
 * @param {number} value the number on the hand's tag
 * @returns {string} a hand of that length, with its tag at the tip
 */
function clockHand(name, length, angle, value) {
  const style = `--rkui-hand-length: ${(length / VIEWBOX) * 100}%; --rkui-hand-angle: ${angle}deg`
  return (
    `<span class="rkui-clock-hand rkui-clock-hand--${name}" style="${style}">` +
    `<span class="rkui-clock-tip"><span class="rkui-clock-tag">${twoDigits(value)}</span></span>` +
    '</span>'
  )
}

/**
 * The clock face's markup, in parts because the day and night icons go between the SVG and hands.
 * @param {number} hours
 * @param {number} minutes
 * @returns {{ style: string, svg: string, hands: string }} inline CSS for the face element, its
 *   `<svg>`, and the hands and hub over it
 */
export function clockFace(hours, minutes) {
  const angles = clockHandAngles(hours, minutes)
  return {
    style: `${iconPlacement('day', 0)}; ${iconPlacement('night', 180)}`,
    svg: `<svg viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">${dayAndNightRing()}${minuteTicks()}</svg>`,
    hands:
      clockHand('hour', RING_RADIUS, angles.hour, hours) +
      clockHand('minute', MINUTE_HAND_RADIUS, angles.minute, minutes) +
      '<span class="rkui-clock-hub"></span>',
  }
}
