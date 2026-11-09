/**
 * The maths behind LightDirection. No DOM. Angles are in degrees, clockwise from 12 o'clock, and
 * name where the light comes from.
 */

/** Where the light comes from by default: the top left. */
export const DEFAULT_ANGLE = 315

/** At the default angle this gives --rkui-shadow-dx and --rkui-shadow-dy of exactly 1. */
const SHADOW_LENGTH = Math.SQRT2

const SUNRISE_HOUR = 6
const SUNSET_HOUR = 18
/** The sun rises on the left, at 9 o'clock. */
const SUNRISE_ANGLE = 270

/**
 * @param {number} value
 * @returns {string} `value` rounded to three decimals, so the default angle gives exactly 1
 */
function toToken(value) {
  return String(Math.round(value * 1000) / 1000)
}

/**
 * The shadow direction that points away from a light at `angle`.
 * @param {number} angle where the light comes from
 * @returns {{ dx: string, dy: string }} the values for --rkui-shadow-dx and --rkui-shadow-dy
 */
export function shadowOffsets(angle) {
  const radians = (angle * Math.PI) / 180
  return {
    dx: toToken(-SHADOW_LENGTH * Math.sin(radians)),
    dy: toToken(SHADOW_LENGTH * Math.cos(radians)),
  }
}

/**
 * The sun rises on the left at 6:00, is overhead at noon and sets on the right at 18:00, so 9:00
 * gives the default angle. At night the light goes back to the default.
 * @param {Date} time
 * @returns {number} the light angle at `time`
 */
export function sunAngle(time) {
  const hour = time.getHours() + time.getMinutes() / 60
  const dayFraction = (hour - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR)
  if (dayFraction < 0 || dayFraction > 1) return DEFAULT_ANGLE
  return (SUNRISE_ANGLE + 180 * dayFraction) % 360
}
