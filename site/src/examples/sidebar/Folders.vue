<script setup>
import Sidebar from '@oneonefour/rkui/components/sidebar/Sidebar.vue'
import Links from './Links.vue'
</script>

<template>
  <Sidebar
    label="Folders sidebar"
    variant="folders"
    style="block-size: 24rem; max-inline-size: 16rem"
  >
    <Links />
  </Sidebar>
</template>
