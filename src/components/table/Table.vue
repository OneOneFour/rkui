<!--
  A data table on a toon sheet: the page's own `<thead>`, `<tbody>`, rows and cells, so a cell can
  hold anything, with a caption above them. The table scrolls sideways inside the sheet when it is
  too wide, with the Scroll region's edge dots, or with `bar` a scrollbar that stays in view. Needs
  no JavaScript. `class` and `style` go on the
  outer `<div>`, the sheet; other attributes go on the `<table>`.

  The header row and the first column stay in view while the table scrolls inside the sheet: the
  first column whenever the table is wider than the sheet, and the header row once the sheet has a
  height, e.g. `style="max-block-size: 24rem"`. Give each header cell `scope="col"` or
  `scope="row"`. A `Badge` in a cell sits on it like a sticker.

  The first time the sheet is seen, it plays a short entrance: the band fills, the rules draw
  across, the values are written in and the stickers stamp down. How much of it a page gets
  depends on what it loads:
  - full entrance: `head-scripts/table-init.js` inlined in `<head>` beside `theme-init.js`, plus
    `table-enhance.js` (in `rkui.js`). A table in view on load plays it too.
  - scroll-in only: `table-enhance.js` alone. A table scrolled to plays it; one already in view
    on load only draws its rules, since it may have shown its values already.
  - no motion: neither script, or `still` on a table. Under reduced motion there is none either,
    and a printed page shows every table in full.
  A table added after the page loads plays it when it is scrolled to; one in view when it is
  added only draws its rules, unless table-init.js's mark is still on, as in a Vue app's first
  render.

  A plain HTML page writes the HTML tab's markup. `<table class="rkui-table">` alone is the same
  sheet without the scrolling.

  @example
  <Table caption="Runs" hue="teal">
    <thead><tr><th scope="col">Run</th><th scope="col">σ</th></tr></thead>
    <tbody><tr><th scope="row">a</th><td>10</td></tr></tbody>
  </Table>
-->
<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import Scroll from '../overflow/Scroll.vue'
import { useComponentId } from '../../shared/component-id'
import { hueVars, type HueOrHex } from '../../shared/hues'
import { unwrappedSlot } from '../../shared/slot-html'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The table's caption, which also names its scroll region. */
  caption: string
  /**
   * The header band's fill in the sheet, a hue or a hex code. When left out, the page's section
   * hue (`--rkui-section`); with none, ink in light mode, and the sheet's colour with a line under
   * it in dark mode.
   */
  hue?: HueOrHex
  /**
   * The look: 'ledger', a ruled notebook page; 'sheet' when left out, a raised panel with a header
   * band. Open, see DECISIONS ("Table").
   */
  variant?: 'sheet' | 'ledger'
  /** The compact density; the normal one when left out. */
  small?: boolean
  /**
   * Tilts the stickers (badges in cells) slightly, every other one the other way; straight when
   * left out.
   */
  messy?: boolean
  /** No entrance: the table just shows, with or without JavaScript; it plays one when left out. */
  still?: boolean
  /** A row pops up out of the sheet while hovered; rows stay flat when left out. */
  lift?: boolean
  /**
   * Keeps the scrollbar of a table too wide for the sheet visible, with no dots, as Scroll's `bar`
   * does; dots and a hover scrollbar when left out.
   */
  bar?: boolean
  /**
   * The look of the dots at the edges of a table too wide for the sheet, written as
   * `data-rkui-dots` on the outer `<div>`: 'plain', or 'pill' for dots in a raised pill; the page's
   * setting when left out.
   */
  dots?: 'plain' | 'pill'
}

const {
  caption,
  hue,
  variant = 'sheet',
  small,
  messy,
  still,
  lift,
  bar,
  dots,
} = defineProps<Props>()

const attrs = useAttrs()
const slots = useSlots()
/** The caption's id, which names the scroll region. */
const captionId = `${useComponentId('table')}-caption`

/** The header band's colours. The band carries small text, so coral takes `--rkui-coral-solid`. */
const vars = computed(() =>
  hueVars(hue, { fill: '--rkui-table-hue', text: '--rkui-table-on-hue', solid: true }),
)

/** The page's attributes: `class` and `style` for the outer div (`outer`), the rest for the `<table>`. */
function pageAttrs() {
  return splitAttrs(attrs)
}

/** The page's rows and cells, written straight into the `<table>`, which allows no wrapper. */
const Rows = () => unwrappedSlot(slots.default?.() ?? [])
</script>

<template>
  <div
    :class="[
      'rkui-table',
      {
        'rkui-table--ledger': variant === 'ledger',
        'rkui-table--small': small,
        'rkui-table--messy': messy,
        'rkui-table--still': still,
        'rkui-table--lift': lift,
      },
    ]"
    :style="vars"
    :data-rkui-dots="dots"
    v-bind="pageAttrs().outer"
  >
    <Scroll :labelledby="captionId" :bar="bar">
      <table v-bind="pageAttrs().inner">
        <caption :id="captionId">
          <span>{{ caption }}</span>
        </caption>
        <Rows />
      </table>
    </Scroll>
  </div>
</template>
