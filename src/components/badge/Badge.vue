<!--
  A small pill for a status or a count. Inline it needs no wrapper. On a corner, put the badge
  inside a `BadgeHost` (or a `Button` with `class="rkui-badge-host"`) beside the picture or button
  it marks. The slot is the visible text, and may start with an icon. `class`, `style` and other
  attributes go on the `<span>`.

  @example
  <Badge hue="grape">New</Badge>
  <BadgeHost><img src="avatar.png" alt="Ada" /><Badge hue="coral" corner>3</Badge></BadgeHost>
-->
<script setup lang="ts">
import type { Hue } from '../../shared/hues'

interface Props {
  /** The colour; yellow when left out. */
  hue?: Hue
  /** The quiet version, a tint panel with ordinary text; solid when left out. */
  tint?: boolean
  /** Pins the badge to its host's top corner; inline when left out. */
  corner?: boolean
  /** With `corner`, pins it to the bottom corner; the top when left out. */
  bottom?: boolean
  /** With `corner`, a status dot with no visible text; a pill when left out. */
  dot?: boolean
  /**
   * A corner badge's edge: 'ring' or 'sticker'; 'outline' when left out. Open, see DECISIONS
   * ("Badges").
   */
  edge?: 'outline' | 'ring' | 'sticker'
  /** Text for screen readers only, after the visible text; the whole accessible name for a dot. */
  hiddenLabel?: string
}

const { hue, tint, corner, bottom, dot, edge = 'outline', hiddenLabel } = defineProps<Props>()
</script>

<template>
  <span
    :class="[
      'rkui-badge',
      hue && `rkui-badge--${hue}`,
      {
        'rkui-badge--tint': tint,
        'rkui-badge--corner': corner,
        'rkui-badge--bottom': bottom,
        'rkui-badge--dot': dot,
        'rkui-badge--ring': edge === 'ring',
        'rkui-badge--sticker': edge === 'sticker',
      },
    ]"
  >
    <slot />
    <span v-if="hiddenLabel" class="rkui-visually-hidden">
      {{ $slots.default ? ' ' : '' }}{{ hiddenLabel }}
    </span>
  </span>
</template>
