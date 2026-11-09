<!--
  A scroll region: content that scrolls sideways when it is too wide, with three dots at each edge
  showing there is more to see and a toon scrollbar on hover and focus. It is keyboard focusable
  and named. The slot is the content. `class`, `style` and other attributes go on the `<div>`.

  @example
  <Scroll label="Results"><table>…</table></Scroll>
-->
<script setup lang="ts">
interface Props {
  /** The region's accessible name; or `labelledby`. */
  label?: string
  /** The id of the element that names the region, in place of `label`. */
  labelledby?: string
  /**
   * Keeps the scrollbar visible with no dots, for an element with side borders of its own; dots and
   * a hover scrollbar when left out.
   */
  bar?: boolean
}

const { label, labelledby, bar } = defineProps<Props>()
</script>

<template>
  <div
    :class="['rkui-scroll', { 'rkui-scroll--bar': bar }]"
    tabindex="0"
    role="region"
    :aria-label="label"
    :aria-labelledby="labelledby"
  >
    <slot />
  </div>
</template>
