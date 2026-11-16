<script setup>
import { computed, ref } from 'vue'
import Range from '@oneonefour/rkui/components/range/Range.vue'
import Stat from '@oneonefour/rkui/components/stat/Stat.vue'

const depth = ref(1200)
const value = computed(() => `${depth.value.toLocaleString('en-US')} ft`)
</script>

<template>
  <Range v-model="depth" label="Depth" style="inline-size: 20rem" min="0" max="18000" step="100" />
  <Stat :value="value" animate />
</template>
