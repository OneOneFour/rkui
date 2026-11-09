<script setup>
import { ref, watch } from 'vue'
import Equation from '@oneonefour/rkui/components/maths/Equation.vue'
import Textarea from '@oneonefour/rkui/components/input/Textarea.vue'
import { renderMaths } from '@oneonefour/rkui/components/maths/render-maths.ts'

const tex = ref('\\frac{\\partial u}{\\partial t} = \\alpha \\nabla^2 u')
// The last TeX that rendered, so a half-typed command leaves the equation as it was.
const shown = ref(tex.value)
const error = ref('')

watch(tex, (value) => {
  try {
    renderMaths(value, true)
    shown.value = value
    error.value = ''
  } catch (failure) {
    error.value = failure.message
  }
})
</script>

<template>
  <Textarea v-model="tex" label="TeX" :error="error" rows="3" spellcheck="false" />
  <Equation :tex="shown" variant="panel" />
</template>
