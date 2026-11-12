<!--
  A table lamp with a switch that takes it apart and puts it back together. In a `.vue` file,
  `v-model` is whether it is apart; with `v-model`, the parent's value is where it starts. `class`,
  `style` and other attributes go on the outer `<div>`. It runs in the browser, so an Astro page
  gives it `client:visible`; until then the lamp stands together and the switch is hidden.

  @example
  <ExplodedLamp v-model="apart" label="Take the lamp apart" />
-->
<script setup lang="ts">
import Switch from '@oneonefour/rkui/components/switch/Switch.vue'
import { useLive } from '@oneonefour/rkui/shared/live.ts'
import Lamp from './Lamp.vue'

interface Props {
  /** The switch's label; 'Take it apart' when left out. */
  label?: string
  /** The lamp's width, a CSS length; 10rem when left out. */
  size?: string
}

const { label = 'Take it apart', size } = defineProps<Props>()

/** Whether the lamp is apart. */
const apart = defineModel<boolean>({ default: false })

/** Set once the component runs in the browser, which shows the switch (exploded-lamp.css). */
const live = useLive()
</script>

<template>
  <div class="rkui-exploded-lamp" :data-rkui-live="live ? '' : undefined">
    <Lamp :apart="apart" :size="size" />
    <Switch v-model="apart">{{ label }}</Switch>
  </div>
</template>
