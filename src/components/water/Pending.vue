<!--
  The pending panel: a dashed panel that fills with water while content loads, with the slot as its
  text. The water rises and falls, or sits at `level`, rising or falling to a new one. A busy
  indicator with `role="status"`. `class` and other attributes go on the `<div>`.

  @example
  <Pending>Loading the comments…</Pending>
  <Pending :level="progress">Loading the comments…</Pending>
-->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** A fixed water level from 0 to 1; rising and falling when left out. */
  level?: number
}

const { level } = defineProps<Props>()

/** The water level as a custom property, when it is set. */
const vars = computed(() => (level === undefined ? {} : { '--rkui-water-level': level }))
</script>

<template>
  <div class="rkui-pending" role="status" :style="vars">
    <span
      :class="level === undefined ? 'rkui-water rkui-water--rise' : 'rkui-water'"
      aria-hidden="true"
    ></span>
    <p><slot /></p>
  </div>
</template>
