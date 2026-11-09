<!--
  A display equation: the TeX in `tex`, rendered by KaTeX on the server when the page is built, so
  it needs no JavaScript in the page. `\tag{n}` numbers it, once for the whole display or once per
  row of an `align`. The wrapper is a scroll region for an equation too wide for the column, which
  the keyboard can scroll too, and is named after the equation's numbers ("Equation 2"). `id`,
  `class`, `style` and other attributes go on the wrapper; give it an `id` for an
  `EquationReference` to link to.

  The site installs `katex` and loads its stylesheet before rkui's:
  import 'katex/dist/katex.min.css'. A TeX error stops the build.

  @example
  <Equation id="eq-flow" tex="\frac{\mathrm{d}\mathbf{x}}{\mathrm{d}t} = \mathbf{f}(\mathbf{x}) \tag{1}" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import { renderMaths } from './render-maths'

interface Props {
  /**
   * The TeX source. In MDX write it as a quoted attribute, which keeps backslashes, braces and
   * underscores as they are.
   */
  tex: string
  /**
   * The frame: 'panel' (a panel), 'rule' (a rule down the left) or 'key' (a raised dashed
   * panel, for a key result); none when left out.
   */
  variant?: 'panel' | 'rule' | 'key'
  /**
   * The look of the dots at the edges of an equation too wide for the column, written as
   * `data-rkui-dots` on the wrapper: 'plain', or 'pill' for dots in a raised pill; the page's
   * setting when left out. The 'rule' and 'key' frames show a scrollbar in place of the dots.
   */
  dots?: 'plain' | 'pill'
}

const { tex, variant, dots } = defineProps<Props>()

const html = computed(() => renderMaths(tex, true))

/** The region's name: "Equation 1", "Equations 2, 3, 4", or "Equation" when it has no number. */
const label = computed(() => {
  const numbers = [...tex.matchAll(/\\tag\{([^}]*)\}/g)].map((match) => match[1])
  return `${numbers.length > 1 ? 'Equations' : 'Equation'} ${numbers.join(', ')}`.trim()
})
</script>

<template>
  <div
    :class="[
      'rkui-equation',
      'rkui-scroll',
      variant && `rkui-equation--${variant}`,
      // A frame with side borders of its own shows a scrollbar in place of the scroll dots.
      { 'rkui-scroll--bar': variant === 'rule' || variant === 'key' },
    ]"
    tabindex="0"
    role="region"
    :aria-label="label"
    :data-rkui-dots="dots"
    v-html="html"
  />
</template>
