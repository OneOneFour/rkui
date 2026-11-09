/**
 * The palette's hues, for every component's `hue` prop: the core hues, then the auxiliary ones.
 * Each has a `--rkui-<hue>` fill token and `-deep` and `-tint` steps in src/tokens/colors.css. A
 * component that supports fewer hues picks from this list.
 */
export const HUES = [
  'navy',
  'teal',
  'coral',
  'yellow',
  'green',
  'sky',
  'grape',
  'tangerine',
  'lilac',
  'apricot',
] as const

/** One of the palette's hues, e.g. 'teal'. (Read from the list above, so the two can't drift.) */
export type Hue = (typeof HUES)[number]

/** The hues whose fill carries its own text colour (`--rkui-on-<hue>`); the rest take ink. */
const HUES_WITH_OWN_TEXT: Hue[] = ['navy', 'coral', 'grape']

/** The text token for text on a `hue` fill, e.g. `--rkui-on-navy`, or `--rkui-on-fill` (ink). */
export function onHue(hue: Hue): string {
  return HUES_WITH_OWN_TEXT.includes(hue) ? `--rkui-on-${hue}` : '--rkui-on-fill'
}
