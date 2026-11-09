<script setup>
import SidebarGroup from '@oneonefour/rkui/components/sidebar/SidebarGroup.vue'
import SidebarLink from '@oneonefour/rkui/components/sidebar/SidebarLink.vue'
import Camera from '@oneonefour/rkui/icons/camera.vue'
import Flask from '@oneonefour/rkui/icons/flask.vue'
import House from '@oneonefour/rkui/icons/house.vue'
import PenNib from '@oneonefour/rkui/icons/pen-nib.vue'
import Rocket from '@oneonefour/rkui/icons/rocket.vue'
</script>

<template>
  <SidebarGroup heading="Site">
    <SidebarLink href="#" hue="sky">
      <template #icon><House /></template>
      Home
    </SidebarLink>
    <SidebarLink href="#" hue="coral" current>
      <template #icon><PenNib /></template>
      Notes
    </SidebarLink>
    <SidebarLink href="#" hue="navy">
      <template #icon><Flask /></template>
      Papers
    </SidebarLink>
    <SidebarLink href="#" hue="teal">
      <template #icon><Rocket /></template>
      Projects
    </SidebarLink>
    <SidebarLink href="#" hue="yellow">
      <template #icon><Camera /></template>
      Photos
    </SidebarLink>
  </SidebarGroup>
</template>
