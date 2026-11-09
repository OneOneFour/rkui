<!--
  A number input with step buttons in place of the browser's spinners, inside a Field. The buttons
  step by `step` within `min` and `max`, and fire `input` and `change` as typing would. In an
  Astro page they need `client:visible`; without it the buttons stay hidden and the input still
  takes typing. `class` and `style` go on the Field's div when there is a label, hint or error,
  otherwise on the `.rkui-stepper` div; other attributes (name, min, max, step, disabled,
  aria-label, ...) go on the input. Without a label, give it an `aria-label`. In a `.vue` file,
  `v-model` is the input's value: a number once typed or stepped, or '' while the input is empty.
  Without one, `value` is the starting value.

  @example
  <Stepper client:visible label="Quantity" name="quantity" min="0" max="10" value="3" />
  <Stepper v-model="quantity" label="Quantity" min="0" max="10" />
-->
<script setup lang="ts">
import { onMounted, ref, useAttrs, useTemplateRef } from 'vue'
import CaretUpIcon from '@oneonefour/rkui/icons/caret-up.vue'
import CaretDownIcon from '@oneonefour/rkui/icons/caret-down.vue'
import Button from '../button/Button.vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { controlAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /**
   * 'split' (a - and a + button either side of the field) or 'stacked' (up and down arrows inside
   * the field's end); split when left out. Open, see DECISIONS ("Number stepper").
   */
  variant?: 'split' | 'stacked'
  /** The visible label; none when left out. */
  label?: string
  /** A quiet line under the stepper; none when left out. */
  hint?: string
  /** An error line under the stepper; it also marks the input invalid. */
  error?: string
}

const { variant = 'split', label, hint, error } = defineProps<Props>()

const attrs = useAttrs()
/** The input's value (`v-model`); the page's `value` attribute when left out. */
const model = defineModel<number | string>()
if (model.value === undefined) model.value = attrs.value as string | undefined
// In the browser, what was typed before the stepper woke up wins.
const vLiveValue = useLiveValue(model)
const id = (attrs.id as string | undefined) ?? useComponentId('stepper')
const input = useTemplateRef<HTMLInputElement>('input')
// Set once the stepper runs in the browser; until then number.css hides the buttons.
const live = ref(false)
onMounted(() => (live.value = true))

/**
 * The page's attributes: `class` and `style` for the Field's div when it draws a frame, otherwise
 * for the stepper's div (`wrapper`); the rest for the input (`wrappedControl`). `value` is left
 * out: the model holds it.
 */
function pageAttrs() {
  const { value, ...rest } = attrs
  return controlAttrs(rest, id, { label, hint, error })
}

/** Whether the page disabled the input, which disables the buttons too. */
function disabled() {
  return attrs.disabled !== undefined && attrs.disabled !== false
}

/** Steps the input up or down, and fires `input` and `change` when its value changed. */
function step(direction: 'up' | 'down') {
  const field = input.value
  if (!field || field.disabled || field.readOnly) return
  const before = field.value
  if (direction === 'up') field.stepUp()
  else field.stepDown()
  if (field.value === before) return
  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new Event('change', { bubbles: true }))
}
</script>

<template>
  <Field :label :for="id" :hint :error v-bind="pageAttrs().field">
    <div
      :class="['rkui-stepper', `rkui-stepper--${variant}`]"
      :data-rkui-live="live ? '' : undefined"
      v-bind="pageAttrs().wrapper"
    >
      <template v-if="variant === 'split'">
        <Button data-step="down" aria-label="Decrease" :disabled="disabled()" @click="step('down')">
          −
        </Button>
        <input
          ref="input"
          v-live-value
          v-model="model"
          class="rkui-input"
          type="number"
          v-bind="pageAttrs().wrappedControl"
        />
        <Button data-step="up" aria-label="Increase" :disabled="disabled()" @click="step('up')">
          +
        </Button>
      </template>
      <template v-else>
        <input
          ref="input"
          v-live-value
          v-model="model"
          class="rkui-input"
          type="number"
          v-bind="pageAttrs().wrappedControl"
        />
        <button
          type="button"
          tabindex="-1"
          data-step="up"
          aria-label="Increase"
          :disabled="disabled()"
          @click="step('up')"
        >
          <CaretUpIcon />
        </button>
        <button
          type="button"
          tabindex="-1"
          data-step="down"
          aria-label="Decrease"
          :disabled="disabled()"
          @click="step('down')"
        >
          <CaretDownIcon />
        </button>
      </template>
    </div>
  </Field>
</template>
