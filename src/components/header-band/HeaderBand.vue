<!--
  A header band: a full-width block of colour at the top of a page or a section, with a small
  kicker line over the page's heading, and a hard rule along its foot. Its colour is the page's
  section hue unless `hue` picks one, so it tells the reader which part of the site they are in.
  The slot holds the heading, at whatever level fits the page, and an optional line under it.
  `kicker` is a string, or a list of strings joined with " · ": `:kicker="['Section', 'kicker']"`
  in Vue, `kicker={['Section', 'kicker']}` in Astro and MDX. Needs no JavaScript. `class`, `style` and other attributes go on the `<header>`.

  @example
  <HeaderBand :kicker="['Section', 'kicker']">
    <h1>The page's title</h1>
  </HeaderBand>
-->
<script setup lang="ts">
import { computed } from 'vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /**
   * The small line over the heading, such as the section's name; none when left out. A list is
   * joined with " · ".
   */
  kicker?: string | string[]
  /**
   * The band's fill, a hue or a hex code. When left out, the page's section hue (`--rkui-section`);
   * with none, ink in light mode, and the page's colour with a line under it in dark mode.
   */
  hue?: HueOrHex
}

const { kicker, hue } = defineProps<Props>()

/** The kicker as one line. */
const kickerText = computed(() => (Array.isArray(kicker) ? kicker.join(' · ') : kicker))

/** The band's fill and text as custom properties, when `hue` is set. */
const vars = computed(() =>
  hueVars(hue, {
    fill: '--rkui-header-band-hue',
    text: '--rkui-header-band-on-hue',
    solid: true,
  }),
)
</script>

<template>
  <header class="rkui-header-band" :style="vars">
    <p v-if="kickerText" class="rkui-header-band-kicker">{{ kickerText }}</p>
    <slot />
  </header>
</template>
