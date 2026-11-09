<script setup>
import { ref } from 'vue'
import Flask from '@oneonefour/rkui/components/water/Flask.vue'
import Range from '@oneonefour/rkui/components/range/Range.vue'

const level = ref(0.4)
</script>

<template>
  <Range v-model="level" label="Level" readout min="0" max="1" step="0.05" />
  <Flask size="3rem" hue="teal" label="Filling" :level="level" />
</template>
