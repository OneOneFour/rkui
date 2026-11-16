<script setup>
import { ref } from 'vue'
import Button from '@oneonefour/rkui/components/button/Button.vue'

const grid = ref(true)
const labels = ref(false)
</script>

<template>
  <Button small :aria-pressed="String(grid)" @click="grid = !grid">Grid lines</Button>
  <Button small hue="teal" :aria-pressed="String(labels)" @click="labels = !labels">
    Labels
  </Button>
</template>
