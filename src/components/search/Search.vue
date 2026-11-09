<!--
  A search field, in two variants, inside a Field. `class` and `style` go on the Field's div when
  there is a label, hint or error, otherwise on the outer element (the div, or the form); other
  attributes (name, placeholder, disabled, ...) go on the input. Without a label the input gets
  `aria-label="Search"`; pass your own `aria-label` to change it. In a `.vue` file, `v-model` is
  the input's text. With `v-model`, the parent's value is the starting value; `value` applies
  only without one.

  @example
  <Search variant="button" name="q" placeholder="Search" action="/search" />
  <Search v-model="query" placeholder="Search" />
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import SearchIcon from '@oneonefour/rkui/icons/magnifying-glass.vue'
import Button from '../button/Button.vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { controlAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /**
   * 'icon' (A: a magnifying glass inside the field) or 'button' (B: a filled Search button joined
   * to the field, in a `<form role="search">`); icon when left out. Open, see DECISIONS ("Special
   * inputs").
   */
  variant?: 'icon' | 'button'
  /** The button's text, for the 'button' variant; "Search" when left out. */
  buttonLabel?: string
  /** The form's action, for the 'button' variant; the current page when left out. */
  action?: string
  /** The form's method, for the 'button' variant; get when left out. */
  method?: 'get' | 'post'
  /** The visible label; none when left out. */
  label?: string
  /** A quiet line under the field; none when left out. */
  hint?: string
  /** An error line under the field; it also marks the input invalid. */
  error?: string
}

const {
  variant = 'icon',
  buttonLabel = 'Search',
  action,
  method,
  label,
  hint,
  error,
} = defineProps<Props>()

const attrs = useAttrs()
/** The input's text (`v-model`); the page's `value` attribute when left out. */
const model = defineModel<string>()
if (model.value === undefined) model.value = attrs.value as string | undefined
// In the browser, what was typed before the search woke up wins.
const vLiveValue = useLiveValue(model)
const id = (attrs.id as string | undefined) ?? useComponentId('search')

/**
 * The page's attributes: `class` and `style` for the Field's div when it draws a frame, otherwise
 * for the form or div (`wrapper`); the rest for the input (`wrappedControl`). `value` is left out:
 * the model holds it.
 */
function pageAttrs() {
  const { value, ...rest } = attrs
  return controlAttrs(rest, id, { label, hint, error })
}

/** Whether the page disabled the input, which disables the button too. */
function disabled() {
  return attrs.disabled !== undefined && attrs.disabled !== false
}
</script>

<template>
  <Field :label :for="id" :hint :error v-bind="pageAttrs().field">
    <form
      v-if="variant === 'button'"
      class="rkui-search-bar"
      role="search"
      :action
      :method
      v-bind="pageAttrs().wrapper"
    >
      <input
        v-live-value
        v-model="model"
        class="rkui-input"
        type="search"
        :aria-label="label ? undefined : 'Search'"
        v-bind="pageAttrs().wrappedControl"
      />
      <Button type="submit" :disabled="disabled()">
        <SearchIcon class="rkui-icon rkui-icon--small" />
        {{ buttonLabel }}
      </Button>
    </form>
    <div v-else class="rkui-search" v-bind="pageAttrs().wrapper">
      <input
        v-live-value
        v-model="model"
        class="rkui-input"
        type="search"
        :aria-label="label ? undefined : 'Search'"
        v-bind="pageAttrs().wrappedControl"
      />
    </div>
  </Field>
</template>
