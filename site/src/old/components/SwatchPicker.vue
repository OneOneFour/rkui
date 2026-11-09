<!--
  A colour picker for the styleguide: the palette as colour tiles, optionally ending with the
  custom colour tile, with static state classes on chosen tiles. Rendered with client:visible, so
  the custom tile works.
-->
<script setup lang="ts">
import ColorPicker from '@oneonefour/rkui/components/color-picker/ColorPicker.vue'
import ColorTile from '@oneonefour/rkui/components/color-picker/ColorTile.vue'
import { HUES } from '@oneonefour/rkui/shared/hues.ts'

interface Props {
  /** The radios' name, unique on the page. */
  name: string
  /** The flair for the checked tile, if any. */
  flair?: 'brush' | 'drops' | 'stroke'
  /** End with the custom colour tile. */
  custom?: boolean
  /** The checked tile's value: a hue, or 'custom'; teal when left out. */
  checked?: string
  /**
   * Static state classes by value, e.g. { navy: 'is-hover' }; `custom: 'is-focus'` shows the
   * custom tile focused.
   */
  states?: Partial<Record<string, string>>
  /** Disable the whole group. */
  disabled?: boolean
}

const { name, flair, custom, checked = 'teal', states = {}, disabled } = defineProps<Props>()
</script>

<template>
  <ColorPicker
    legend="Colour"
    :name
    :flair
    :custom
    :value="checked"
    :disabled
    :class="{ 'is-custom-focus': states.custom === 'is-focus' }"
  >
    <ColorTile v-for="hue in HUES" :key="hue" :value="hue" :class="states[hue]" />
  </ColorPicker>
</template>
