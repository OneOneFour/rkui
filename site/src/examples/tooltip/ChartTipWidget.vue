<script setup lang="ts">
import { computed, ref } from 'vue'
import Tooltip from '@oneonefour/rkui/components/tooltip/Tooltip.vue'

const SNOW = [
  { day: 'Mon', cm: 12 },
  { day: 'Tue', cm: 30 },
  { day: 'Wed', cm: 8 },
  { day: 'Thu', cm: 22 },
  { day: 'Fri', cm: 36 },
]
const MOST = 40

/** The bar under the pointer, and the last one, which the tip keeps while it fades out. */
const hovered = ref<number | null>(null)
const last = ref(0)

function point(index: number) {
  hovered.value = index
  last.value = index
}

const tip = computed(() => {
  const { day, cm } = SNOW[last.value]
  return {
    text: `${day}: ${cm} cm`,
    style: {
      position: 'absolute',
      insetInlineStart: `${((last.value + 0.5) / SNOW.length) * 100}%`,
      insetBlockStart: `${100 - (cm / MOST) * 100}%`,
    },
  }
})

const NAME = `Snow by day: ${SNOW.map(({ day, cm }) => `${day} ${cm} cm`).join(', ')}`
</script>

<template>
  <div class="chart-tip" role="img" :aria-label="NAME" @pointerleave="hovered = null">
    <div
      v-for="({ day, cm }, index) in SNOW"
      :key="day"
      class="chart-tip-column"
      @pointerenter="point(index)"
    >
      <div class="chart-tip-bar" :style="{ blockSize: `${(cm / MOST) * 100}%` }" />
    </div>
    <Tooltip :shown="hovered !== null" :text="tip.text" :style="tip.style" aria-hidden="true" />
  </div>
</template>

<style>
.chart-tip {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  inline-size: min(20rem, 100%);
  block-size: 8rem;
  margin-block-start: var(--rkui-space-7);
  border-block-end: var(--rkui-outline-width) dashed var(--rkui-line-unfilled);
}

.chart-tip-column {
  display: flex;
  align-items: end;
  padding-inline: var(--rkui-space-2);
}

.chart-tip-bar {
  flex: 1;
  border: var(--rkui-outline-width) solid var(--rkui-line);
  border-block-end: 0;
  border-radius: var(--rkui-radius) var(--rkui-radius) 0 0;
  background: var(--rkui-sky);
}
</style>
