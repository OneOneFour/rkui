<!--
  A segmented control: a pill group of native radios, built from SegmentedOptions, which can each
  have an icon before the label. The slot holds the SegmentedOptions. With `deck` it is a row of
  raised keys, like a tape deck's. `class`, `style` and other attributes go on the fieldset. In
  Safari before 26 the checked fill doesn't slide between options; each option fills on its own.
  In a `.vue` file, `v-model` is the chosen option's value. With `v-model`, the parent's value is
  the starting value unless it is undefined; then `checked` applies (the first option marked wins)
  and is handed to the parent.

  @example
  <Segmented legend="View">
    <SegmentedOption value="list" checked>List</SegmentedOption>
    <SegmentedOption value="grid">Grid</SegmentedOption>
  </Segmented>
  <Segmented v-model="view" legend="View">…</Segmented>
-->
<script setup lang="ts">
import { computed, provide, useSlots } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { modelWithStart } from '../../shared/model-start'
import { checkedValue, fillSlot, OPTION_GROUP } from '../../shared/option-slot'

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

/** The chosen value (`v-model`); the `checked` option's when left out. */
const model = defineModel<string>()
const slots = useSlots()
const selection = modelWithStart(model, () => checkedValue(slots.default?.() ?? [], false))
const generatedName = useComponentId('segmented')
const group = computed(() => ({ name: name ?? generatedName, multiple: false, model: selection }))
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
