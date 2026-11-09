<!--
  A table lamp drawn from four LampParts on a grid, standing on a dashed ground. With `apart`
  its parts come apart, each rising and casting a longer shadow the nearer it is, with its name
  on a Badge above it. `class`, `style` and other attributes go on the outer `<div>`. It needs no
  JavaScript.

  @example
  <Lamp apart size="8rem" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import Badge from '@oneonefour/rkui/components/badge/Badge.vue'
import LampPart from './LampPart.vue'
import { GRID, GROUND, PARTS, type Part } from './lamp-drawing'

interface Props {
  /** Shows the lamp taken apart; together when left out. */
  apart?: boolean
  /** The lamp's width, a CSS length; 10rem when left out. */
  size?: string
}

const { apart = false, size } = defineProps<Props>()

/** The drawing's name for screen readers, which lists its parts. */
const NAME = `A table lamp: ${new Intl.ListFormat('en-GB').format(
  PARTS.map((part) => part.name.toLowerCase()),
)}`

/** How far a part moves and rises when the lamp comes apart (lamp.css). */
function partVars({ apart: [x, y], depth }: Part) {
  return { '--rkui-part-apart-x': x, '--rkui-part-apart-y': y, '--rkui-part-depth': depth }
}

/** A part's label sits over the middle of the part's top edge, and moves with it. */
function labelVars(part: Part) {
  const { x, y, width } = part.box
  return { ...partVars(part), '--rkui-part-x': x + width / 2, '--rkui-part-y': y }
}

const vars = computed(() => ({
  '--rkui-lamp-columns': GRID.columns,
  '--rkui-lamp-rows': GRID.rows,
  '--rkui-lamp-size': size,
}))
</script>

<template>
  <div
    :class="['rkui-lamp', { 'rkui-lamp--apart': apart }]"
    :style="vars"
    role="img"
    :aria-label="NAME"
  >
    <svg class="rkui-lamp-ground" :viewBox="`0 0 ${GRID.columns} ${GRID.rows}`" aria-hidden="true">
      <path :d="GROUND" />
    </svg>
    <LampPart
      v-for="part in PARTS"
      :key="part.name"
      :shape="part.shape"
      :box="part.box"
      :hue="part.hue"
      :style="partVars(part)"
    />
    <Badge
      v-for="part in PARTS"
      :key="part.name"
      class="rkui-lamp-label"
      :style="labelVars(part)"
      aria-hidden="true"
    >
      {{ part.name }}
    </Badge>
  </div>
</template>
