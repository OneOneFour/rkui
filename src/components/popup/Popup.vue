<!--
  A small raised panel that a button opens with the browser's Popover API, for a toggletip or a few
  controls, with no JavaScript. The slot is the panel's content. Give the opening button
  `popovertarget` set to this `id`; a button inside can close it with
  `popovertargetaction="hide"`. `class`, `style` and other attributes go on the panel. Safari 18
  opens it in the middle of the window rather than under its button, and Safari and Firefox close
  it at once, without the fade.

  @example
  <Button popovertarget="filter-popup">Filter</Button>
  <Popup id="filter-popup"><p>Filter options.</p></Popup>
-->
<script setup lang="ts">
interface Props {
  /** The panel's id, which the button's `popovertarget` names. */
  id: string
}

const { id } = defineProps<Props>()
</script>

<template>
  <div :id class="rkui-popup" popover>
    <slot />
  </div>
</template>
