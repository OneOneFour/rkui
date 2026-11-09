import {
  VIEWBOX,
  arcPath,
  nearestTurn,
  percentOfFace,
  polarToCartesian,
  radialLine,
  wrap,
} from './dial-geometry.js'

/** The day and night ring, where the hour hand's tag rides */
const RING_RADIUS = 86
const RING_WIDTH = 28
const TICK_INNER_RADIUS = 58
const QUARTER_TICK_INNER_RADIUS = 54
const TICK_OUTER_RADIUS = 66
const MINUTE_HAND_RADIUS = 40

/** The hour hand goes round once a day, with noon at the top and midnight at the bottom. */
const DEGREES_PER_HOUR = 360 / 24
const DEGREES_PER_MINUTE = 360 / 60
const NOON_ANGLE = 12 * DEGREES_PER_HOUR

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

/** Inline CSS for the face element: where the day and night icons sit on the ring. */
export const FACE_STYLE = `${iconPlacement('day', 0)}; ${iconPlacement('night', 180)}`

const SIX_AM = 6 * DEGREES_PER_HOUR - NOON_ANGLE
const SIX_PM = 18 * DEGREES_PER_HOUR - NOON_ANGLE
const RING_INNER_EDGE = RING_RADIUS - RING_WIDTH / 2
const RING_OUTER_EDGE = RING_RADIUS + RING_WIDTH / 2

/**
 * The day and night ring: the day half over the top and the night half under it, as SVG paths
 * `width` wide, and its edges: a circle of radius `innerEdge` and a line at each end.
 */
export const RING = {
  width: RING_WIDTH,
  day: arcPath(RING_RADIUS, SIX_AM, SIX_AM + 180),
  night: arcPath(RING_RADIUS, SIX_PM, SIX_PM + 180),
  innerEdge: RING_INNER_EDGE,
  edges: [
    radialLine(RING_INNER_EDGE, RING_OUTER_EDGE, SIX_AM),
    radialLine(RING_INNER_EDGE, RING_OUTER_EDGE, SIX_PM),
  ],
}

/** A tick for every five minutes, as the ends of SVG lines; the ones at the quarters are longer. */
export const TICKS = Array.from({ length: 12 }, (_, index) => {
  const quarter = index % 3 === 0
  const inner = quarter ? QUARTER_TICK_INNER_RADIUS : TICK_INNER_RADIUS
  return { quarter, line: radialLine(inner, TICK_OUTER_RADIUS, index * 5 * DEGREES_PER_MINUTE) }
})

/** How far each hand reaches from the centre, in SVG units; its tag sits at the tip. */
const HAND_RADII = { hour: RING_RADIUS, minute: MINUTE_HAND_RADIUS }

/**
 * @param {'hour' | 'minute'} hand
 * @returns {string} the hand's length as a percentage of the face, for `--rkui-hand-length`
 */
export function handLength(hand) {
  return `${(HAND_RADII[hand] / VIEWBOX) * 100}%`
}

/**
 * @param {string} value a time input's value, "HH:MM"
 * @returns {{ hours: number, minutes: number }} the time; an empty value is midnight
 */
export function parseTime(value) {
  const [hours = 0, minutes = 0] = value.split(':').map(Number)
  return { hours, minutes }
}

/**
 * @param {number} hours any whole number; it wraps round the day
 * @param {number} minutes from 0 to 59
 * @returns {string} the time as a time input's value, "HH:MM"
 */
export function formatTime(hours, minutes) {
  return `${twoDigits(wrap(hours, 24))}:${twoDigits(minutes)}`
}

/**
 * @param {{ x: number, y: number }} point a point on the face, in SVG units
 * @param {{ hour: number, minute: number }} angles where the hands point
 * @returns {'hour' | 'minute'} the hand whose tag is nearer the point
 */
export function nearestHand(point, angles) {
  /** @param {'hour' | 'minute'} hand */
  const distance = (hand) => {
    const tag = polarToCartesian(HAND_RADII[hand], angles[hand])
    return Math.hypot(point.x - tag.x, point.y - tag.y)
  }
  return distance('hour') < distance('minute') ? 'hour' : 'minute'
}

/**
 * The time a dragged hand sets. The hour hand keeps the minutes; the minute hand snaps to `step`
 * and, passing 12, moves the hour on or back, as on a real clock.
 * @param {'hour' | 'minute'} hand
 * @param {number} angle where the pointer is, clockwise from 12, 0 to 360
 * @param {{ hours: number, minutes: number }} time the time before this move
 * @param {number} step the minutes the minute hand snaps to
 * @returns {{ hours: number, minutes: number }} the new time; `hours` may be outside 0 to 23
 */
export function draggedTime(hand, angle, { hours, minutes }, step) {
  if (hand === 'hour') {
    return { hours: Math.round((angle + NOON_ANGLE) / DEGREES_PER_HOUR - minutes / 60), minutes }
  }
  const minute = wrap(Math.round(angle / DEGREES_PER_MINUTE / step) * step, 60)
  let hour = hours
  if (minutes >= 45 && minute < 15) hour += 1
  if (minutes < 15 && minute >= 45) hour -= 1
  return { hours: hour, minutes: minute }
}
