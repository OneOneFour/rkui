<!--
  The rkui logo as a home link: four outlined tiles, r k u i, raised on the hard shadow, that pop
  like a button. `class`, `style` and other attributes go on the `<a>`.

  @example
  <Logo href="/" label="rkui home" variant="motifs" size="3rem" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useComponentId } from '../../shared/component-id'

interface Props {
  /** Where the link goes: the site's home page. */
  href: string
  /** The link's accessible name; "Home" when left out. */
  label?: string
  /**
   * 'motifs': on hover and focus the corner lifts, the wave rolls, the stripes march and the dot
   * hops; 'lift' (the pop only) when left out. Open, see DECISIONS ("Logo").
   */
  variant?: 'lift' | 'motifs'
  /** The logo's width as a CSS length; 6rem when left out. */
  size?: string
}

const { href, label = 'Home', variant = 'lift', size } = defineProps<Props>()
const id = useComponentId('logo')

/** The size as a custom property, when it is set. */
const vars = computed(() => (size ? { '--rkui-logo-size': size } : {}))
</script>

<template>
  <a
    :href="href"
    :class="['rkui-logo', { 'rkui-logo--motifs': variant === 'motifs' }]"
    :style="vars"
  >
    <svg viewBox="-11.5 -11.5 1175 1175" aria-hidden="true">
      <defs>
        <path class="rkui-logo-shape" :id="`${id}-r`" d="M150 0h426v576H0V150z" />
        <path
          class="rkui-logo-shape"
          :id="`${id}-k`"
          d="M576 0h462a114 114 0 0 1 114 114v462H576z"
        />
        <path
          class="rkui-logo-shape"
          :id="`${id}-u`"
          d="M0 576h576v576H114A114 114 0 0 1 0 1038z"
        />
        <path
          class="rkui-logo-shape"
          :id="`${id}-i`"
          d="M576 576h576v462a114 114 0 0 1-114 114H576z"
        />
        <clipPath :id="`${id}-k-clip`">
          <use :href="`#${id}-k`" />
        </clipPath>
        <clipPath :id="`${id}-u-clip`">
          <use :href="`#${id}-u`" />
        </clipPath>
      </defs>

      <g class="rkui-logo-r">
        <use class="rkui-logo-tile" :href="`#${id}-r`" />
        <path
          class="rkui-logo-letter"
          d="M192.7 450.4V410l32.8-7.1V247l-36.1-7.1v-40.4h99.3l2.8 36.6q9.3-20.8 22.8-31c9-7 20.4-10.4 32.8-10.4q6.3.1 13.3 1 7 .7 12.8 2.8l-7.1 62.3-33.7-2c-9.5-.4-17.6 1.5-23.3 4.8q-9.3 5.6-15.7 16.2v123l32.3 7.1v40.4z"
        />
        <use class="rkui-logo-edge" :href="`#${id}-r`" />
        <g class="rkui-logo-flap">
          <path class="rkui-logo-flap-fill" d="M0 150h150V0z" />
          <path class="rkui-logo-edge" d="M0 150h150V0z" />
        </g>
      </g>

      <g class="rkui-logo-k">
        <use class="rkui-logo-tile" :href="`#${id}-k`" />
        <g :clip-path="`url(#${id}-k-clip)`">
          <path
            class="rkui-logo-wave"
            d="M576 381.2c0 0 42.7 47.5 96 47.5s96-47.5 96-47.5c0 0 42.7-47.5 96-47.5s96 47.5 96 47.5c0 0 42.7 47.5 96 47.5s96-47.5 96-47.5c0 0 42.7-47.5 96-47.5s96 47.5 96 47.5c0 0 42.7 47.5 96 47.5s96-47.5 96-47.5V640H576z"
          />
        </g>
        <path
          class="rkui-logo-letter"
          d="M705 487v-40.3l32.7-7.1V173l-36-7.1V125h103.5v314.5l29 7v40.5zm159.5 0v-38.4l19.5-4.3-1-1-49.3-67.9 43.2-44.1L959 439l31.3 7.6V487zM798 418.8l-32.7-38 109.2-99.8.5-1-25.7-3.3v-40.3h130.2v40.3l-32.3 8.6z"
        />
        <use class="rkui-logo-edge" :href="`#${id}-k`" />
      </g>

      <g class="rkui-logo-u">
        <use class="rkui-logo-tile" :href="`#${id}-u`" />
        <g :clip-path="`url(#${id}-u-clip)`">
          <path
            class="rkui-logo-stripes"
            d="M-632 576h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5zm110.9 0h55.5l576 576h-55.5z"
          />
        </g>
        <path
          class="rkui-logo-letter"
          d="M283 1026.4q-36.3.1-63.2-11.9-27.8-12-42.8-34.1C166.6 966 161.8 949 161.8 930V770.4H234v146.8q-.1 22.7 13.3 36c9 9.6 21 13.8 35.7 13.8 14.2 0 25.1-4.2 33.2-13.7 8.6-9 12.4-21 12.4-36.1V770.4h72.6V930c0 19-5.2 36.1-15.2 50.4-9.5 14.7-23.7 26-41.3 34.1q-26.3 12-61.7 12z"
        />
        <use class="rkui-logo-edge" :href="`#${id}-u`" />
      </g>

      <g class="rkui-logo-i">
        <use class="rkui-logo-tile" :href="`#${id}-i`" />
        <g class="rkui-logo-letter">
          <path d="M809.7 1026.6V777.3H882v249.3z" />
          <path class="rkui-logo-dot" d="M808.3 743.5v-69.3h75v69.3z" />
        </g>
        <use class="rkui-logo-edge" :href="`#${id}-i`" />
      </g>
    </svg>
    <span class="rkui-visually-hidden">{{ label }}</span>
  </a>
</template>
