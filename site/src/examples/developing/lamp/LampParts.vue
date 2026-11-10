<script setup>
import LampPart from './LampPart.vue'
</script>

<template>
  <div style="display: flex; align-items: end; gap: var(--rkui-space-4)">
    <LampPart
      shape="M5 12L11 12L13.5 19L2.5 19z"
      :box="{ x: 2.5, y: 12, width: 11, height: 7 }"
      hue="coral"
    />
    <LampPart
      shape="M5.5 20.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0z"
      :box="{ x: 5.5, y: 18, width: 5, height: 5 }"
      hue="yellow"
    />
    <LampPart
      shape="M7.2 21h1.6v8.5h-1.6z"
      :box="{ x: 7.2, y: 21, width: 1.6, height: 8.5 }"
      hue="sky"
    />
    <LampPart
      shape="M4.9 29h6.2a1.4 1.4 0 0 1 0 2.8h-6.2a1.4 1.4 0 0 1 0 -2.8z"
      :box="{ x: 3.5, y: 29, width: 9, height: 2.8 }"
      hue="navy"
    />
  </div>
</template>
