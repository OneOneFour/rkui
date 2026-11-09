<!--
  A link in prose to a numbered `Equation`, drawn as a pill like the equation's number. Its
  brackets are hidden spans, so it still reads "(2)" without CSS. With `long` it leads with the
  function icon and the word "Equation", for a reference that starts or carries a sentence.
  `class`, `style` and other attributes go on the `<a>`. Inside larger maths, link with KaTeX's own
  `\href{#eq-…}{(2)}` instead.

  @example
  <p><EquationReference to="eq-lorenz" number="2" long /> is chaotic, unlike <EquationReference to="eq-flow" number="1" />.</p>
-->
<script setup lang="ts">
import FunctionIcon from '@oneonefour/rkui/icons/function.vue'

interface Props {
  /** The `id` of the `Equation` it links to, e.g. "eq-lorenz". */
  to: string
  /** The equation's number, as its `\tag` gives it. */
  number: number | string
  /** Leads with the function icon and "Equation", for the start of a sentence; "(2)" when left out. */
  long?: boolean
}

const { to, number, long } = defineProps<Props>()
</script>

<template>
  <a class="rkui-eqref" :href="`#${to}`">
    <template v-if="long"><FunctionIcon class="rkui-icon" aria-hidden="true" />Equation </template>
    <span>(</span>{{ number }}<span>)</span>
  </a>
</template>
