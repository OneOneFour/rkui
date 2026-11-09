/**
 * The colour summary's rows: which tokens it shows and which text pair goes with each. Only
 * names are listed here; the hex and ratio of each are read from the browser (show-colors.js).
 */
import { paletteNames, tokenNames } from './color-tokens'

/** A colour token as the summary paints it. */
export interface SummaryColor {
  /** The token, e.g. `--rkui-teal`, or `--rkui-shade` with `inputs` */
  name: string
  /** What the row or shade is labelled, e.g. `-deep`; the token by default */
  label: string
  /**
   * Per-element tokens a recipe reads, each set to a token, e.g. `{ '--rkui-shade-of':
   * '--rkui-teal' }`
   */
  inputs?: Record<string, string>
  /** The page palette it is painted under, if not the default */
  palette?: string
}

/** A text pair: the `fg` token on the `bg` token, under a palette if not the default. */
export interface SummaryText {
  fg: string
  bg: string
  palette?: string
}

/** One summary row: a colour, its permitted shades, and its text pair. */
export interface SummaryRow {
  color: SummaryColor
  shades: SummaryColor[]
  text?: SummaryText
}

interface SummaryGroup {
  title: string
  caption: string
  rows: SummaryRow[]
}

interface ColorOptions {
  label?: string
  inputs?: Record<string, string>
  palette?: string
}

const HUES = [
  'yellow',
  'teal',
  'navy',
  'green',
  'sky',
  'coral',
  'grape',
  'tangerine',
  'lilac',
  'apricot',
]
const HUE_SHADES = ['-deep', '-tint', '-solid']

/** A token to paint, labelled with its name unless `label` says otherwise. */
function color(name: string, { label = name, inputs, palette }: ColorOptions = {}): SummaryColor {
  return { name, label, inputs, palette }
}

/** A color that is read as text or as an edge on the page. */
function onPage(name: string): SummaryRow {
  return { color: color(name), shades: [], text: { fg: name, bg: '--rkui-surface' } }
}

/** The label color a hue's fill carries: its own --rkui-on-* token, or --rkui-on-fill. */
function labelFor(hue: string): string {
  return tokenNames.has(`--rkui-on-${hue}`) ? `--rkui-on-${hue}` : '--rkui-on-fill'
}

function hueRow(hue: string): SummaryRow {
  const name = `--rkui-${hue}`
  const variants = HUE_SHADES.filter((suffix) => tokenNames.has(`${name}${suffix}`)).map((suffix) =>
    color(`${name}${suffix}`, { label: suffix }),
  )
  // Navy casts --rkui-shadow-lit with the colour shadow, so it has no shade.
  const shade =
    hue === 'navy' ? [] : [color('--rkui-shade', { inputs: { '--rkui-shade-of': name } })]
  return {
    color: color(name),
    shades: [...variants, ...shade],
    text: { fg: labelFor(hue), bg: name },
  }
}

/** The shades shown beside a page colour: the folder back by the page, the tab by the panel. */
const PAGE_SHADES: Record<string, string[]> = {
  '--rkui-surface': ['--rkui-folder-back'],
  '--rkui-raised': [],
  '--rkui-panel': ['--rkui-panel-tab'],
}

function pageRows(palette: string): SummaryRow[] {
  return Object.entries(PAGE_SHADES).map(([name, shades]) => ({
    color: color(name, { label: `${palette} ${name}`, palette }),
    shades: shades.map((shade) => color(shade, { palette })),
    text: { fg: '--rkui-fg', bg: name, palette },
  }))
}

/** The summary's groups. */
export const SUMMARY: SummaryGroup[] = [
  {
    title: 'Page palettes',
    caption:
      'Cream is the default; set data-palette for slate or greige. Each palette has its own panel, for code blocks, quotes and shaded cards.',
    rows: paletteNames.flatMap(pageRows),
  },
  {
    title: 'Neutrals',
    caption: 'Text, outlines, ink and the glint. The dark outline is a known gap (DESIGN §10).',
    rows: [
      onPage('--rkui-fg'),
      onPage('--rkui-muted'),
      onPage('--rkui-line'),
      onPage('--rkui-line-unfilled'),
      { color: color('--rkui-ink'), shades: [], text: { fg: '--rkui-on-ink', bg: '--rkui-ink' } },
      {
        color: color('--rkui-on-ink'),
        shades: [],
        text: { fg: '--rkui-on-ink', bg: '--rkui-ink' },
      },
      { color: color('--rkui-glint'), shades: [] },
    ],
  },
  {
    title: 'Hues',
    caption:
      '-deep is for text on the page, -tint for panels, and --rkui-shade (75% fill, 25% --rkui-line) for the colour shadow and the sticky-note fold.',
    rows: HUES.map(hueRow),
  },
  {
    title: 'Focus',
    caption: 'The highlighter band, measured against the outline it hugs.',
    rows: ['--rkui-focus', '--rkui-focus-alt'].map((name) => ({
      color: color(name),
      shades: [],
      text: { fg: name, bg: '--rkui-line' },
    })),
  },
  {
    title: 'Shading',
    caption:
      "Hard shadows: the outline shadow's colour and rim, and the colour shadow's shadow for things without a colour of their own. The inset's grey step, on the panel and on the folder back. Hatching stripes and tape are translucent.",
    rows: [
      { color: color('--rkui-shadow-color'), shades: [] },
      { color: color('--rkui-shadow-edge'), shades: [] },
      onPage('--rkui-shadow-lit'),
      ...['--rkui-panel', '--rkui-folder-back'].map((floor) => ({
        color: color('--rkui-recess-shade', {
          label: `--rkui-recess-shade on ${floor}`,
          inputs: { '--rkui-recess-floor': floor },
        }),
        shades: [],
      })),
      { color: color('--rkui-stripe'), shades: [] },
      { color: color('--rkui-note-tape'), shades: [] },
    ],
  },
]

/**
 * Every token the summary shows, text colors included, so the full reference can leave them out.
 */
export const SUMMARY_NAMES: Set<string> = new Set(
  SUMMARY.flatMap((group) => group.rows).flatMap((row) => [
    ...[row.color, ...row.shades].filter((shown) => !shown.inputs).map((shown) => shown.name),
    ...(row.text ? [row.text.fg] : []),
  ]),
)
