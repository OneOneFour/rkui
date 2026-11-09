<script setup>
import { ref } from 'vue'
import Button from '@oneonefour/rkui/components/button/Button.vue'

const busy = ref(false)
</script>

<template>
  <Button water color="teal" :aria-busy="busy" :aria-disabled="busy" @click="busy = !busy">
    Save
  </Button>
</template>
