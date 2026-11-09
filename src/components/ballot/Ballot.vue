<!--
  A ballot: a column of options, each a tile beside a bordered text box. The slot holds the
  BallotOptions. Each row is one label, so clicking anywhere on it votes. Radios for one choice,
  checkboxes with `multiple`. `class`, `style` and other attributes go on the fieldset. In a `.vue`
  file, `v-model` is the chosen option's value (a list of values with `multiple`). With `v-model`,
  the parent's value is the starting value unless it is undefined; then `checked` applies and is
  handed to the parent (for one choice, the first option marked wins).

  @example
  <Ballot legend="Vote">
    <BallotOption value="a" mark="A" checked>First</BallotOption>
    <BallotOption value="b" mark="B">Second</BallotOption>
  </Ballot>
  <Ballot v-model="vote" legend="Vote">…</Ballot>
-->
<script setup lang="ts">
import { computed, provide, useSlots } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { modelWithStart } from '../../shared/model-start'
import { checkedValue, fillSlot, OPTION_GROUP } from '../../shared/option-slot'

interface Props {
  /** The group's name, visually hidden. */
  legend: string
  /** The inputs' name, filled into every option; a unique one is made when left out. */
  name?: string
  /** Checkboxes instead of radios; radios when left out. */
  multiple?: boolean
  /** The tiles on the right; on the left when left out. */
  markEnd?: boolean
  /** Each tile straddles its text box's edge; beside it when left out. */
  overlap?: boolean
  /** Each tile sits inside its text box; beside it when left out. */
  inside?: boolean
  /** No gap between rows; a gap when left out. */
  tight?: boolean
}

const { legend, name, multiple, markEnd, overlap, inside, tight } = defineProps<Props>()

/**
 * The chosen value, or values with `multiple` (`v-model`); the `checked` options' when left out.
 */
const model = defineModel<string | string[]>()
const slots = useSlots()
const selection = modelWithStart(model, () => checkedValue(slots.default?.() ?? [], multiple))
const generatedName = useComponentId('ballot')
const group = computed(() => ({ name: name ?? generatedName, multiple, model: selection }))
provide(OPTION_GROUP, group)
</script>

<template>
  <fieldset
    :class="[
      'rkui-ballot',
      {
        'rkui-ballot--mark-end': markEnd,
        'rkui-ballot--overlap': overlap,
        'rkui-ballot--inside': inside,
        'rkui-ballot--tight': tight,
      },
    ]"
  >
    <legend class="rkui-visually-hidden">{{ legend }}</legend>
    <component
      :is="option"
      v-for="(option, i) in fillSlot($slots.default?.() ?? [], group)"
      :key="i"
    />
  </fieldset>
</template>
