<!--
  One option of a Ballot: a tile beside a bordered text box, in one label. Put the title in the
  slot, and optionally an icon for the tile (`slot="icon"` in Astro, `<template #icon>` in Vue).
  `class` and `style` go on the label; other attributes go on the input.

  @example
  <BallotOption value="a" mark="A" text="A longer line under the title.">First</BallotOption>
-->
<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import Tile from '../tiles/Tile.vue'
import { colorVars, type Color } from '../../shared/hues'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The value the form sends when this option is chosen. */
  value: string
  /** A longer line under the title; none when left out. */
  text?: string
  /** A letter or number for the tile; none when left out, and with no icon the tile is empty. */
  mark?: string
  /**
   * A hue or hex code: the tile is filled with it when it holds no mark or icon, and `tint` uses
   * it; none when left out.
   */
  color?: Color
  /** Fill the box with the colour's tint when checked; the usual tint when left out. */
  tint?: boolean
  /** The input's name; its group's name when left out. */
  name?: string
  /** Starts chosen; unchosen when left out. */
  checked?: boolean
  /** Can't be chosen; enabled when left out. */
  disabled?: boolean
}

const { value, text, mark, color, tint, name, checked, disabled } = defineProps<Props>()

const attrs = useAttrs()
const slots = useSlots()

/** Whether the tile is a plain colour: a colour with no mark or icon. */
function swatch() {
  return color !== undefined && !mark && !slots.icon
}

/** The colour's tint as a custom property, with `tint` and a colour. */
const vars = computed(() => (tint ? colorVars(color, { tint: '--rkui-selected-tint' }) : {}))

/**
 * The page's attributes: `class` and `style` for the label (`outer`), the rest for the Tile, which
 * puts them on its input.
 */
function pageAttrs() {
  return splitAttrs(attrs)
}
</script>

<template>
  <label class="rkui-ballot-option" :style="vars" v-bind="pageAttrs().outer">
    <!-- The Tile finds its Ballot by inject, for its input's name, type and checked state. -->
    <Tile
      tag="span"
      :value
      :name
      :checked
      :disabled
      :color="swatch() ? color : undefined"
      v-bind="pageAttrs().inner"
    >
      <template v-if="!swatch()" #default>
        <slot name="icon">{{ mark }}</slot>
      </template>
    </Tile>
    <span class="rkui-ballot-text">
      <strong><slot /></strong>
      <span v-if="text">{{ text }}</span>
    </span>
  </label>
</template>
