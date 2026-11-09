<!--
  The wrapper a corner `Badge` sits on: put the picture and the badge in the slot. (A `Button` can
  be its own host with `class="rkui-badge-host"`.) `class`, `style` and other attributes go on the
  `<span>`.

  @example
  <BadgeHost round>
    <img src="avatar.png" alt="Ada" /><Badge corner dot hiddenLabel="Online" />
  </BadgeHost>
-->
<script setup lang="ts">
interface Props {
  /** The host is a circle, so the badge sits on its edge; a rectangle when left out. */
  round?: boolean
}

const { round } = defineProps<Props>()
</script>

<template>
  <span :class="['rkui-badge-host', { 'rkui-badge-host--round': round }]">
    <slot />
  </span>
</template>
