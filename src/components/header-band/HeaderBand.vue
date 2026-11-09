<!--
  A header band: a full-width block of colour at the top of a page or a section, with a small
  kicker line over the page's heading, and a hard rule along its foot. Its colour is the page's
  section hue unless `color` picks one, so it tells the reader which part of the site they are in.
  The slot holds the heading, at whatever level fits the page, and an optional line under it.
  Needs no JavaScript. `class`, `style` and other attributes go on the `<header>`.

  @example
  <HeaderBand kicker="Section · kicker">
    <h1>The page's title</h1>
  </HeaderBand>
-->
<script setup lang="ts">
import { computed } from 'vue'
import { colorVars, type Color } from '../../shared/hues'

interface Props {
  /** The small line over the heading, such as the section's name; none when left out. */
  kicker?: string
  /**
   * The band's fill, a hue or a hex code. When left out, the page's section hue (`--rkui-section`);
   * with none, ink in light mode, and the page's colour with a line under it in dark mode.
   */
  color?: Color
}

const { kicker, color } = defineProps<Props>()

/** The band's fill and text as custom properties, when `color` is set. */
const vars = computed(() =>
  colorVars(color, {
    fill: '--rkui-header-band-hue',
    text: '--rkui-header-band-on-hue',
    solid: true,
  }),
)
</script>

<template>
  <header class="rkui-header-band" :style="vars">
    <p v-if="kicker" class="rkui-header-band-kicker">{{ kicker }}</p>
    <slot />
  </header>
</template>
