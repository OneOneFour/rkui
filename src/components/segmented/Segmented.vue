<!--
  A segmented control: a pill group of native radios, built from SegmentedOptions, which can each
  have an icon before the label. The slot holds the SegmentedOptions. With `deck` it is a row of
  raised keys, like a tape deck's. `class`, `style` and other attributes go on the fieldset. In
  Safari before 26 the checked fill doesn't slide between options; each option fills on its own.

  @example
  <Segmented legend="View">
    <SegmentedOption value="list" checked>List</SegmentedOption>
    <SegmentedOption value="grid">Grid</SegmentedOption>
  </Segmented>
-->
<script setup lang="ts">
import { computed, provide } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { fillSlot, OPTION_GROUP } from '../../shared/option-slot'

interface Props {
  /** The group's name, visually hidden. */
  legend: string
  /** The radios' name, filled into every option; a unique one is made when left out. */
  name?: string
  /** Raised keys; a pill when left out. */
  deck?: boolean
  /** For a deck: its frame as a flat outlined plate; raised when left out. */
  plate?: boolean
}

const { legend, name, deck, plate } = defineProps<Props>()
const generatedName = useComponentId('segmented')
const group = computed(() => ({ name: name ?? generatedName, multiple: false }))
provide(OPTION_GROUP, group)
</script>

<template>
  <fieldset
    :class="['rkui-segmented', { 'rkui-segmented--deck': deck, 'rkui-segmented--plate': plate }]"
  >
    <legend class="rkui-visually-hidden">{{ legend }}</legend>
    <component
      :is="option"
      v-for="(option, i) in fillSlot($slots.default?.() ?? [], group)"
      :key="i"
    />
  </fieldset>
</template>
