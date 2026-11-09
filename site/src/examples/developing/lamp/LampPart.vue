<!--
  One part of a drawing: an outlined shape in a palette hue, drawn on a grid. The part is its own
  small `<svg>`, as large as the box its shape sits in, so a Lamp can place it and move it.
  `class`, `style` and other attributes go on the `<svg>`. It needs no JavaScript.

  @example
  <LampPart shape="M7.2 21h1.6v8.5h-1.6z" :box="{ x: 7.2, y: 21, width: 1.6, height: 8.5 }" hue="sky" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import { hueVars, type HueOrHex } from '@oneonefour/rkui/shared/hues.ts'

/** Where a shape sits on the drawing's grid, in grid units from the top left. */
interface Box {
  x: number
  y: number
  width: number
  height: number
}

interface Props {
  /** The part's outline, as SVG path data in grid units. */
  shape: string
  /** The box the shape sits in. */
  box: Box
  /** The part's fill: a palette hue or a hex code. */
  hue: HueOrHex
}

const { shape, box, hue } = defineProps<Props>()

/** The part's box, and its fill from `hue`. */
const vars = computed(() => ({
  '--rkui-part-x': box.x,
  '--rkui-part-y': box.y,
  '--rkui-part-width': box.width,
  '--rkui-part-height': box.height,
  ...hueVars(hue, { fill: '--rkui-part-fill' }),
}))

/** The svg shows just the part's box of the grid. */
const viewBox = computed(() => `${box.x} ${box.y} ${box.width} ${box.height}`)
</script>

<template>
  <svg class="rkui-lamp-part" :viewBox="viewBox" :style="vars" aria-hidden="true">
    <path :d="shape" />
  </svg>
</template>
