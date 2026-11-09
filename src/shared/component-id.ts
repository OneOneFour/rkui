import { getCurrentInstance, useId } from 'vue'

/** How many ids have been made for apps with no `idPrefix`. */
let unprefixed = 0

/**
 * A unique id for a component's element, e.g. 'rkui-stepper-s1-0'. Call it in `<script setup>`,
 * as for `useId()`. It is Vue's `useId()` behind the library's prefix when the app has an
 * `idPrefix` (Astro sets one for each island that renders on the server, and `defineElement` one
 * for each element). Without one, `useId()` would count from 0 in every app on the page, so a
 * counter shared by the whole page is used instead: those apps (`client:only` islands) never
 * hydrate, so the server never needs the same id.
 */
export function useComponentId(component: string): string {
  const hasPrefix = Boolean(getCurrentInstance()?.appContext.config.idPrefix)
  return `rkui-${component}-${hasPrefix ? useId() : `u${unprefixed++}`}`
}
