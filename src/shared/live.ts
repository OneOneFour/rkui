import { onMounted, ref } from 'vue'

/**
 * Whether the component has started in the browser: false on the server and in the first render,
 * true once it is mounted. Write it as `:data-rkui-live="live ? '' : undefined"` on the element
 * whose CSS hides its controls until then.
 */
export function useLive() {
  const live = ref(false)
  onMounted(() => (live.value = true))
  return live
}
