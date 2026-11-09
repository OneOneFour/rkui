<!--
  A scroll region: content that scrolls sideways when it is too wide, with three dots at each edge
  showing there is more to see and a toon scrollbar on hover and focus. It is keyboard focusable
  and named. The slot is the content. `class`, `style` and other attributes go on the `<div>`.
  Every component that scrolls takes the same `dots`, and passes the scrollbar settings
  (`--rkui-scroll-thumb` and the rest, overflow.css) set on it or around it down to its scrollbar.

  @example
  <Scroll label="Results" dots="pill"><table>…</table></Scroll>
-->
<script setup lang="ts">
interface Props {
  /** The region's accessible name; give it or `labelledby`; none when left out. */
  label?: string
  /** The id of the element that names the region, in place of `label`; none when left out. */
  labelledby?: string
  /**
   * Keeps the scrollbar visible with no dots, for an element with side borders of its own; dots and
   * a hover scrollbar when left out.
   */
  bar?: boolean
  /**
   * The dots' look, written as `data-rkui-dots` on the `<div>`: 'plain', or 'pill' for dots in a
   * raised pill that slides in from the edge; the page's setting when left out.
   */
  dots?: 'plain' | 'pill'
}

const { label, labelledby, bar, dots } = defineProps<Props>()
</script>

<template>
  <div
    :class="['rkui-scroll', { 'rkui-scroll--bar': bar }]"
    tabindex="0"
    role="region"
    :aria-label="label"
    :aria-labelledby="labelledby"
    :data-rkui-dots="dots"
  >
    <slot />
  </div>
</template>
