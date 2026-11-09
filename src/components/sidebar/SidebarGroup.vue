<!--
  One group of a Sidebar: a heading over a list of SidebarLinks, or just the list when it has no
  heading, as in a site's one list of sections. The slot holds its SidebarLinks. `class`, `style`
  and other attributes go on the `<section>`.

  @example
  <SidebarGroup heading="Form controls">
    <SidebarLink href="/button/">Button</SidebarLink>
  </SidebarGroup>
-->
<script setup lang="ts">
interface Props {
  /** The group's heading; none when left out. */
  heading?: string
}

const { heading } = defineProps<Props>()
</script>

<template>
  <section class="rkui-sidebar-group">
    <h2 v-if="heading" class="rkui-sidebar-heading">
      <span>{{ heading }}</span>
    </h2>
    <ul class="rkui-sidebar-list">
      <slot />
    </ul>
  </section>
</template>
