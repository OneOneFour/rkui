import { defineCustomElement, h, useHost, type Component } from 'vue'

/** The attributes each element had when it started, kept for when it is moved and restarts. */
const startingAttributes = new WeakMap<HTMLElement, Record<string, string>>()
/** How many element apps have started, for each one's id prefix. */
let apps = 0

/** Reads `host`'s attributes and takes them off it, the first time only. */
function takeAttributes(host: HTMLElement): Record<string, string> {
  let attrs = startingAttributes.get(host)
  if (!attrs) {
    attrs = {}
    for (const { name, value } of [...host.attributes]) attrs[name] = value
    for (const name of Object.keys(attrs)) host.removeAttribute(name)
    startingAttributes.set(host, attrs)
  }
  return attrs
}

/**
 * Registers `component` as the custom element `tag`, for plain HTML pages, which have no other way
 * to say "put a Stepper here". The element renders the component in place, in the light DOM, so
 * the page's CSS styles it. The element's attributes become the component's props and attributes,
 * and move off the element, which takes no space of its own: `<rkui-stepper value="3">` renders
 * just the Stepper. They are read once, when the element first starts: changing one later does
 * nothing, and a moved element keeps the ones it started with.
 */
export function defineElement(tag: string, component: Component) {
  const element = defineCustomElement(
    {
      // Vue would also hand the element's attributes on; they are read once, here, instead.
      inheritAttrs: false,
      setup() {
        // Always set here: this setup only ever runs inside the element.
        const host = useHost()!
        const attrs = takeAttributes(host)
        host.style.setProperty('display', 'contents')
        return () => h(component, attrs)
      },
    },
    {
      shadowRoot: false,
      // Each element is its own Vue app; without a prefix of its own, every app's ids would
      // start from the same number (component-id.ts).
      configureApp(app) {
        app.config.idPrefix = `e${++apps}`
      },
    },
  )
  customElements.define(tag, element)
}
