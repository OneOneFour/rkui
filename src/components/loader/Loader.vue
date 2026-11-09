<!--
  The hop loader: a ball hops back and forth along a line, squashing as it lands. Each hop covers
  about the same distance (`--rkui-loader-hop-length`), so a wider loader takes more hops. Give it a
  `hue`, or an icon to ride in a bigger ball (the slot: an icon with class "rkui-icon"). A busy
  indicator with `role="status"`; the label is read out, not shown. `class`, `style` and other
  attributes go on the `<div>`.

  @example
  <Loader hue="coral" label="Fetching…"><StarIcon class="rkui-icon" aria-hidden="true" /></Loader>
-->
<script setup lang="ts">
import { useSlots } from 'vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /** What is happening, for screen readers; "Loading…" when left out. */
  label?: string
  /** The ball's colour, a hue or a hex code; teal when left out. */
  hue?: HueOrHex
}

const { label = 'Loading…', hue } = defineProps<Props>()
const slots = useSlots()

/** The custom properties for what is set: the fill, and the text colour only with an icon. */
function vars() {
  return hueVars(hue, {
    fill: '--rkui-loader-fill',
    text: slots.default ? '--rkui-loader-on-fill' : undefined,
  })
}
</script>

<template>
  <div class="rkui-loader rkui-loader--hop" role="status" :style="vars()">
    <span class="rkui-loader-ball"><slot /></span>
    <span class="rkui-visually-hidden">{{ label }}</span>
  </div>
</template>
