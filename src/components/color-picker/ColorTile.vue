<!--
  One colour tile of a ColorPicker: a Tile filled with a hue and named by it, with a radio under
  it. Put tiles in a ColorPicker, which fills in their `name` and holds their `v-model`. `class`
  and `style` go on the label; other attributes go on the input.

  @example
  <ColorTile value="teal" checked />
-->
<script setup lang="ts">
import Tile from '../tiles/Tile.vue'
import type { Hue } from '../../shared/hues'

interface Props {
  /** The hue the tile shows, and the value the form sends when it is chosen. */
  value: Hue
  /** Starts chosen; unchosen when left out. */
  checked?: boolean
  /** Can't be chosen; enabled when left out. */
  disabled?: boolean
}

const { value, checked, disabled } = defineProps<Props>()
</script>

<template>
  <!-- The Tile finds its ColorPicker by inject, for its input's name and checked state. -->
  <Tile :value :hue="value" :checked :disabled>{{ value }}</Tile>
</template>
