<script setup>
import Logo from '@oneonefour/rkui/components/logo/Logo.vue'

const home = import.meta.env.BASE_URL
</script>

<template>
  <Logo :href="home" label="rkui home" variant="motifs" size="3rem" />
  <Logo :href="home" label="rkui home" variant="motifs" />
</template>
