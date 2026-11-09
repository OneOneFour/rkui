<script setup>
import { ref } from 'vue'
import ExplodedLamp from './ExplodedLamp.vue'

const apart = ref(false)
</script>

<template>
  <ExplodedLamp v-model="apart" />
  <p>The lamp is {{ apart ? 'apart' : 'together' }}.</p>
</template>
