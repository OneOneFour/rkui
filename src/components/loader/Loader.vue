<!--
  The hop loader: a ball hops back and forth along a line, squashing as it lands. Give it a `color`, or
  an icon to ride in a bigger ball (the slot: an icon with class "rkui-icon"). A busy indicator with
  `role="status"`; the label is read out, not shown. `class`, `style` and other attributes go on the
  `<div>`.

  @example
  <Loader color="coral" label="Fetching…"><StarIcon class="rkui-icon" aria-hidden="true" /></Loader>
-->
<script setup lang="ts">
import { useSlots } from 'vue'
import { colorVars, type Color } from '../../shared/hues'

interface Props {
  /** What is happening, for screen readers; "Loading…" when left out. */
  label?: string
  /** The ball's colour, a hue or a hex code; teal when left out. */
  color?: Color
}

const { label = 'Loading…', color } = defineProps<Props>()
const slots = useSlots()

/** The custom properties for what is set: the fill, and the text colour only with an icon. */
function vars() {
  return colorVars(color, {
    fill: '--rkui-loader-fill',
    text: slots.default ? '--rkui-loader-on-fill' : undefined,
  })
}
</script>

<template>
  <div class="rkui-loader rkui-loader--hop" role="status" :style="vars()">
    <span v-if="$slots.default" class="rkui-loader-ball"><slot /></span>
    <span class="rkui-visually-hidden">{{ label }}</span>
  </div>
</template>
