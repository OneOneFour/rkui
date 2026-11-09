<!--
  An rkui widget frame: a dashed `<figure>` with a title, a stage and a controls row. The default
  slot is the stage (a canvas or SVG); the `controls` slot (`slot="controls"` in Astro,
  `<template #controls>` in Vue) holds buttons and sliders. `class`, `style` and other attributes
  go on the `<figure>`.

  @example
  <WidgetFrame title="Pendulum">
    <canvas></canvas><template #controls><Button>Reset</Button></template>
  </WidgetFrame>
-->
<script setup lang="ts">
interface Props {
  /** The widget's title, shown as the figure caption. */
  title: string
}

defineProps<Props>()
</script>

<template>
  <figure class="rkui-widget-frame">
    <figcaption class="rkui-widget-frame-title">{{ title }}</figcaption>
    <div class="rkui-widget-frame-stage">
      <slot />
    </div>
    <div v-if="$slots.controls" class="rkui-widget-frame-controls">
      <slot name="controls" />
    </div>
  </figure>
</template>
