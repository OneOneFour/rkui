<!--
  The water flask: a spinner whose water fills and drains, for a wait of unknown length, or sits at
  `level`, rising or falling to a new one. A busy indicator with `role="status"`; the label is read
  out, not shown. `class`, `style` and other attributes go on the `<span>`.

  @example
  <Flask label="Uploading…" size="3rem" hue="teal" />
  <Flask label="Uploading…" :level="progress" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /** What is happening, for screen readers; "Loading…" when left out. */
  label?: string
  /** The flask's size as a CSS length; 2rem when left out. */
  size?: string
  /** The water's colour, a hue or a hex code; sky when left out. */
  hue?: HueOrHex
  /** A fixed water level from 0 to 1; rising and falling when left out. */
  level?: number
}

const { label = 'Loading…', size, hue, level } = defineProps<Props>()

/** The custom properties for the props that are set. */
const vars = computed(() => {
  const style: Record<string, string | number> = hueVars(hue, { fill: '--rkui-spinner-fill' })
  if (size) style['--rkui-spinner-size'] = size
  if (level !== undefined) style['--rkui-water-level'] = level
  return style
})
</script>

<template>
  <span class="rkui-spinner rkui-spinner--water" role="status" :style="vars">
    <span
      :class="level === undefined ? 'rkui-water rkui-water--rise' : 'rkui-water'"
      aria-hidden="true"
    ></span>
    <span class="rkui-visually-hidden">{{ label }}</span>
  </span>
</template>
