<!--
  A group of filter chips: a fieldset with a visually hidden legend, holding Chips. Radios for one
  choice, checkboxes with `multiple`. `class`, `style` and other attributes go on the fieldset. In
  a `.vue` file, `v-model` is the chosen chip's value (a list of values with `multiple`). With
  `v-model`, the parent's value is the starting value unless it is undefined; then `checked`
  applies and is handed to the parent (for one choice, the first chip marked wins).

  @example
  <ChipGroup legend="Topics" multiple>
    <Chip value="fruit" checked>Fruit</Chip>
    <Chip value="veg">Veg</Chip>
  </ChipGroup>
  <ChipGroup v-model="topics" legend="Topics" multiple>…</ChipGroup>
-->
<script setup lang="ts">
import { computed, provide, useSlots } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { modelWithStart } from '../../shared/model-start'
import { checkedValue, fillSlot, OPTION_GROUP } from '../../shared/option-slot'

interface Props {
  /** The group's name for screen readers. */
  legend: string
  /** The inputs' name, filled into every chip; a unique one is made when left out. */
  name?: string
  /** Checkboxes instead of radios; radios when left out. */
  multiple?: boolean
}

const { legend, name, multiple } = defineProps<Props>()

/**
 * The chosen value, or values with `multiple` (`v-model`); the `checked` chips' when left out.
 */
const model = defineModel<string | string[]>()
const slots = useSlots()
const selection = modelWithStart(model, () => checkedValue(slots.default?.() ?? [], multiple))
const generatedName = useComponentId('chips')
const group = computed(() => ({ name: name ?? generatedName, multiple, model: selection }))
provide(OPTION_GROUP, group)
</script>

<template>
  <fieldset class="rkui-chip-group">
    <legend class="rkui-visually-hidden">{{ legend }}</legend>
    <component :is="chip" v-for="(chip, i) in fillSlot($slots.default?.() ?? [], group)" :key="i" />
  </fieldset>
</template>
