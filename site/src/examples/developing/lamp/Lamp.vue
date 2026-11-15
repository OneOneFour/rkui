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

/** How far a part moves and rises when the lamp comes apart (the styles below). */
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

<style>
/* Lamp: a drawing on a grid of --rkui-lamp-columns × --rkui-lamp-rows units. The lamp is the
   container, so a unit (--rkui-lamp-unit) is a share of its width, and each part sits at its box
   (LampPart). Each part stands one layer up, and its shadow is half the resting shadow's
   length for each layer. With .rkui-lamp--apart each part moves by its --rkui-part-apart-x and
   -y, in units, and rises 1 + --rkui-part-depth layers more, so nearer parts cast longer
   shadows. A part's label moves with it. */

.rkui-lamp {
  --rkui-lamp-unit: calc(100cqi / var(--rkui-lamp-columns));
  --rkui-lamp-apart: 0;
  --rkui-lamp-duration: var(--rkui-duration-spring);
  --rkui-lamp-ease: var(--rkui-ease-snap);

  position: relative;
  container-type: inline-size;
  inline-size: var(--rkui-lamp-size, 10rem);
  aspect-ratio: var(--rkui-lamp-columns) / var(--rkui-lamp-rows);
}

/* Parts come apart on the spring and snap home. */
.rkui-lamp--apart {
  --rkui-lamp-apart: 1;
  --rkui-lamp-duration: var(--rkui-duration-slide);
  --rkui-lamp-ease: var(--rkui-ease-spring);
}

.rkui-lamp-ground {
  position: absolute;
  inset: 0;
  stroke: var(--rkui-line-unfilled);
  stroke-width: calc(2 * var(--rkui-outline-width));
  stroke-linecap: round;
}

.rkui-lamp-ground path {
  vector-effect: non-scaling-stroke;
}

.rkui-lamp > :is(.rkui-lamp-part, .rkui-lamp-label) {
  --rkui-part-lift: calc(1 + var(--rkui-lamp-apart) * (1 + var(--rkui-part-depth)));

  position: absolute;
  inset-inline-start: calc(var(--rkui-part-x) * var(--rkui-lamp-unit));
  inset-block-start: calc(var(--rkui-part-y) * var(--rkui-lamp-unit));
  translate: calc(var(--rkui-lamp-apart) * var(--rkui-part-apart-x) * var(--rkui-lamp-unit))
    calc(var(--rkui-lamp-apart) * var(--rkui-part-apart-y) * var(--rkui-lamp-unit));
  transition:
    translate var(--rkui-lamp-duration) var(--rkui-lamp-ease),
    filter var(--rkui-lamp-duration) var(--rkui-lamp-ease),
    opacity var(--rkui-lamp-duration) var(--rkui-lamp-ease);
}

/* The shadow, then its light edge in dark mode, as on the tooltip. */
.rkui-lamp > .rkui-lamp-part {
  --rkui-part-shadow: calc(var(--rkui-part-lift) * var(--rkui-shadow-offset) / 2);

  filter: drop-shadow(
      calc(var(--rkui-shadow-dx) * var(--rkui-part-shadow))
        calc(var(--rkui-shadow-dy) * var(--rkui-part-shadow)) 0 var(--rkui-shadow-color)
    )
    drop-shadow(
      calc(var(--rkui-shadow-dx) * var(--rkui-outline-width))
        calc(var(--rkui-shadow-dy) * var(--rkui-outline-width)) 0 var(--rkui-shadow-edge)
    );
}

/* A label sits centred over its part's top edge, and shows only while the lamp is apart. */
.rkui-lamp > .rkui-lamp-label {
  margin-block-start: calc(-1 * var(--rkui-space-1));
  transform: translate(-50%, -100%);
  opacity: var(--rkui-lamp-apart);
  white-space: nowrap;
}
</style>
