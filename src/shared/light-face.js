/**
 * The compass LightDirection draws: a ring the sun rides round, with ticks inside it. No DOM. It is
 * drawn in the same 200-unit square as the clock and dial faces.
 */

import { percentOfFace, radialLine } from './dial-geometry.js'

/** The radius of the ring the sun rides. */
export const RING_RADIUS = 84

/** Marks inside the ring, at the top, right, bottom and left and between them. */
export const TICKS = Array.from({ length: 8 }, (_, index) => radialLine(62, 70, index * 45))

/**
 * @param {number} angle where the sun sits on the ring
 * @returns {Record<string, string>} the face's custom properties: the point on the ring where the
 *   sun sits, as percentages of the face's width and height
 */
export function faceStyle(angle) {
  const { x, y } = percentOfFace(RING_RADIUS, angle)
  return { '--rkui-light-direction-x': `${x}%`, '--rkui-light-direction-y': `${y}%` }
}
