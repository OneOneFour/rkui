<!--
  An rkui stat: a big number in the display face, as a `<p>`. The value is a string, so it carries
  its own units and words ("3 to 9 in"). The slot goes under it in small muted text, such as a
  note or a link. It needs no JavaScript. `class`, `style` and other attributes go on the outer
  `<div>`.

  The colour is `--rkui-stat-color`, which `hue` sets and a plain page can set itself.

  With `animate`, the number counts up from zero the first time it is well in view
  (stat-enhance.js, which comes in rkui.js), over `--rkui-stat-count-duration` (1.2s), then lands
  with a small pop. Every number in the value counts, keeping its decimals and thousands commas,
  and the words around it stay: "1,204" counts 0 to 1,204, and "3 to 9 in" counts both numbers
  together. A sign or other symbol in front of a number stays as it is, so "−3 °C" counts 0 to 3
  behind its minus. An animated stat already in view as the page loads counts too when the page
  inlines `head-scripts/table-init.js`, which keeps it hidden until it starts; without it, that stat
  shows its final value. With JavaScript off, or with reduced motion, the final value shows at
  once. Screen readers read the final value only.

  @example
  <Stat value="62 %" hue="teal" trend="up" animate small>
    <a href="/skill/">How good is this?</a>
  </Stat>
-->
<script setup lang="ts">
import { computed } from 'vue'
import ArrowUpIcon from '@oneonefour/rkui/icons/arrow-up.vue'
import { hueVars } from '../../shared/hues'
import type { HueOrHex } from '../../shared/hues'

interface Props {
  /** The number, with any units or words around it. */
  value: string
  /**
   * The value's colour: a palette hue or a hex code, in the hue's text-safe shade; the page's text
   * colour when left out.
   */
  hue?: HueOrHex
  /**
   * A small arrow beside the value, in the text colour, with "up" or "down" for screen readers;
   * none when left out.
   */
  trend?: 'up' | 'down'
  /**
   * Counts the number up the first time it comes into view, then pops it; the final value just
   * shows when left out.
   */
  animate?: boolean
  /** Sets the value a step smaller (step 2); step 3 when left out. */
  small?: boolean
  /** The value's font size as a CSS length, over `small`; step 3 when left out. */
  size?: string
}

const { value, hue, trend, animate = false, small = false, size } = defineProps<Props>()

/** The custom properties for the size and the colour, when set. */
const vars = computed(() => ({
  ...(size ? { '--rkui-stat-size': size } : {}),
  ...hueVars(hue, { deep: '--rkui-stat-color' }),
}))
</script>

<template>
  <div
    :class="['rkui-stat', { 'rkui-stat--animate': animate, 'rkui-stat--small': small }]"
    :style="vars"
  >
    <p class="rkui-stat-value">
      <span class="rkui-stat-number"
        >{{ value
        }}<ArrowUpIcon
          v-if="trend"
          :class="['rkui-icon', 'rkui-stat-trend', { 'rkui-stat-trend--down': trend === 'down' }]"
        />
        <span v-if="trend" class="rkui-visually-hidden">{{ ' ' + trend }}</span></span
      >
    </p>
    <div v-if="$slots.default" class="rkui-stat-note"><slot /></div>
  </div>
</template>
