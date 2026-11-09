<!--
  A folder's strip of tabs, for WidgetTabs to build on. The strip hides its own scrollbar,
  which would come between the tabs and the sheet; once this runs in the browser, a scrollbar
  above the strip takes its place while the tabs don't fit, kept scrolled to the same place.
  Before that, and without JavaScript, the strip still scrolls by touch, trackpad, wheel and
  keyboard. The slot is the tabs; attributes go on the strip.

  @example
  <FolderStrip role="tablist" aria-label="Topics"><button class="rkui-folder-tab">…</button></FolderStrip>
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from 'vue'

defineOptions({ inheritAttrs: false })

const strip = useTemplateRef<HTMLElement>('strip')
const bar = useTemplateRef<HTMLElement>('bar')
// The bar is drawn only in the browser, where it can scroll the strip.
const live = ref(false)
/** How much wider the tabs are than the strip, in pixels; the bar shows while it is above 0. */
const overflow = ref(0)
let resizes: ResizeObserver | undefined

/** Measures the overflow again. */
function fit() {
  if (strip.value) overflow.value = strip.value.scrollWidth - strip.value.clientWidth
}

/** Watches the strip and each tab in it, as they are now, for a change of size. */
function observe() {
  const element = strip.value
  if (!element || !resizes) return
  resizes.disconnect()
  for (const observed of [element, ...element.children]) resizes.observe(observed)
}

onMounted(() => {
  live.value = true
  resizes = new ResizeObserver(fit)
  observe()
})
// The tabs may have changed (a `v-for` list grew or shrank).
onUpdated(() => {
  observe()
  fit()
})
onBeforeUnmount(() => resizes?.disconnect())

/** Where each scroller was last moved to by the other. */
const movedTo = new Map<HTMLElement, number>()

/**
 * Scrolls `target` to where `source` is. The scroll event that move causes on `target` is ignored,
 * so a scroll still in progress there (a fling) isn't pulled back.
 */
function follow(source: HTMLElement | null, target: HTMLElement | null) {
  if (!source || !target) return
  const expected = movedTo.get(source)
  if (expected !== undefined && Math.abs(source.scrollLeft - expected) < 1) return
  movedTo.set(target, source.scrollLeft)
  target.scrollLeft = source.scrollLeft
}
</script>

<template>
  <div
    v-if="live"
    ref="bar"
    class="rkui-scroll rkui-scroll--bar rkui-folder-scrollbar"
    aria-hidden="true"
    tabindex="-1"
    :hidden="overflow <= 0"
    @scroll.passive="follow(bar, strip)"
  >
    <div :style="{ inlineSize: `calc(100% + ${overflow}px)` }" />
  </div>
  <div
    ref="strip"
    class="rkui-folder-tabs rkui-scroll"
    v-bind="$attrs"
    @scroll.passive="follow(strip, bar)"
  >
    <slot />
  </div>
</template>
