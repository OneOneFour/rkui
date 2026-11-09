<!--
  The ring spinner: an outlined ring with a wedge rolling round inside it as if it had weight. A
  busy indicator with `role="status"`; the label is read out, not shown. `class`, `style` and other
  attributes go on the `<span>`.

  @example
  <Spinner label="Loading results…" size="3rem" hue="teal" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /** What is happening, for screen readers; "Loading…" when left out. */
  label?: string
  /** The spinner's size as a CSS length; 2rem when left out. */
  size?: string
  /** The wedge's colour, a hue or a hex code; the selected colour when left out. */
  hue?: HueOrHex
}

const { label = 'Loading…', size, hue } = defineProps<Props>()

/** The custom properties for the props that are set. */
const vars = computed(() => {
  const style: Record<string, string | number> = hueVars(hue, { fill: '--rkui-spinner-fill' })
  if (size) style['--rkui-spinner-size'] = size
  return style
})
</script>

<template>
  <span class="rkui-spinner rkui-spinner--ring" role="status" :style="vars">
    <span class="rkui-visually-hidden">{{ label }}</span>
  </span>
</template>
