<!--
  A data table on a toon sheet: the page's own `<thead>`, `<tbody>`, rows and cells, so a cell can
  hold anything, with a caption above them. The table scrolls sideways inside the sheet when it is
  too wide, with the Scroll region's edge dots. Needs no JavaScript. `class` and `style` go on the
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
import { onHue, type Hue } from '../../shared/hues'
import { unwrappedSlot } from '../../shared/slot-html'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The table's caption, which also names its scroll region. */
  caption: string
  /**
   * The header band's fill in the sheet. When left out, the page's section hue (`--rkui-section`);
   * with none, ink in light mode, and the sheet's colour with a line under it in dark mode.
   */
  hue?: Hue
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
}

const { caption, hue, variant = 'sheet', small, messy, still, lift } = defineProps<Props>()

const attrs = useAttrs()
const slots = useSlots()
/** The caption's id, which names the scroll region. */
const captionId = `${useComponentId('table')}-caption`

/** The header band's colours. Coral's band takes `--rkui-coral-solid`, which carries small text. */
const vars = computed(() => {
  if (!hue) return {}
  const fill = hue === 'coral' ? 'coral-solid' : hue
  return {
    '--rkui-table-hue': `var(--rkui-${fill})`,
    '--rkui-table-on-hue': `var(${onHue(hue)})`,
  }
})

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
    v-bind="splitAttrs(attrs).outer"
  >
    <Scroll :labelledby="captionId">
      <table v-bind="splitAttrs(attrs).inner">
        <caption :id="captionId">
          <span>{{ caption }}</span>
        </caption>
        <Rows />
      </table>
    </Scroll>
  </div>
</template>
