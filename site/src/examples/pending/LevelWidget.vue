<script setup>
import { ref } from 'vue'
import Pending from '@oneonefour/rkui/components/water/Pending.vue'
import Range from '@oneonefour/rkui/components/range/Range.vue'

const level = ref(0.4)
</script>

<template>
  <Range v-model="level" label="Level" readout min="0" max="1" step="0.05" />
  <Pending :level="level">Loading the comments…</Pending>
</template>
