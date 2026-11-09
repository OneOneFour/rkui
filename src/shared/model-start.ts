import { computed, onMounted, type Ref, type WritableComputedRef } from 'vue'

/**
 * A component's `v-model` that, while the model is unset, follows `start()`, a value read from its
 * slot. On mount the starting value is handed to the parent's `v-model`. The slot is read when the
 * template reads the model, in render. Read in setup, Vue warns that the slot is invoked outside
 * the render function.
 */
export function modelWithStart<T>(
  model: Ref<T | undefined>,
  start: () => T,
): WritableComputedRef<T> {
  const selection = computed({
    get: () => model.value ?? start(),
    set: (value) => {
      model.value = value
    },
  })
  onMounted(() => {
    if (model.value === undefined) model.value = selection.value
  })
  return selection
}
