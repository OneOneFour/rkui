<!--
  A tile picker: a group of equal round tiles (Tile), radios for one choice or checkboxes for
  several, each holding a number, a letter or an icon. The slot holds the Tiles. `class`, `style`
  and other attributes go on the fieldset (`disabled` disables the whole group). In a `.vue` file,
  `v-model` is the chosen tile's value (a list of values with `multiple`). With `v-model`, the
  parent's value is the starting value unless it is undefined; then `checked` applies and is handed
  to the parent (for one choice, the first tile marked wins).

  For colour tiles, see ColorPicker.

  @example
  <Tiles legend="Rating">
    <Tile value="1">1</Tile>
    <Tile value="2" checked>2</Tile>
  </Tiles>
  <Tiles v-model="rating" legend="Rating">…</Tiles>
-->
<script setup lang="ts">
import { computed, provide, useSlots } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { modelWithStart } from '../../shared/model-start'
import { checkedValue, fillSlot, OPTION_GROUP } from '../../shared/option-slot'

interface Props {
  /** The group's name, visually hidden. */
  legend: string
  /** The inputs' name, filled into every tile; a unique one is made when left out. */
  name?: string
  /** Checkboxes instead of radios; radios when left out. */
  multiple?: boolean
  /** Smaller tiles; full size when left out. */
  compact?: boolean
  /** Stack the tiles in a column; a row when left out. */
  vertical?: boolean
}

const { legend, name, multiple = false, compact, vertical } = defineProps<Props>()

/**
 * The chosen value, or values with `multiple` (`v-model`); the `checked` tiles' when left out.
 */
const model = defineModel<string | string[]>()
const slots = useSlots()
const selection = modelWithStart(model, () => checkedValue(slots.default?.() ?? [], multiple))
const generatedName = useComponentId('tiles')
const group = computed(() => ({ name: name ?? generatedName, multiple, model: selection }))
provide(OPTION_GROUP, group)
</script>

<template>
  <fieldset
    :class="['rkui-tiles', { 'rkui-tiles--compact': compact, 'rkui-tiles--vertical': vertical }]"
  >
    <legend class="rkui-visually-hidden">{{ legend }}</legend>
    <component :is="tile" v-for="(tile, i) in fillSlot($slots.default?.() ?? [], group)" :key="i" />
  </fieldset>
</template>
