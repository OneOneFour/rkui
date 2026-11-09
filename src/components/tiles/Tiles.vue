<!--
  A tile picker: a group of equal round tiles (Tile), radios for one choice or checkboxes for
  several, each holding a number, a letter or an icon. `class`, `style` and other attributes go on
  the fieldset (`disabled` disables the whole group).

  For colour tiles, see ColorPicker.

  @example
  <Tiles legend="Rating">
    <Tile value="1">1</Tile>
    <Tile value="2" checked>2</Tile>
  </Tiles>
-->
<script setup lang="ts">
import { computed, provide } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { fillSlot, OPTION_GROUP } from '../../shared/option-slot'

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
const generatedName = useComponentId('tiles')
const group = computed(() => ({ name: name ?? generatedName, multiple }))
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
