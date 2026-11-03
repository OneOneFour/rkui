# How a custom element is written here

Every element script in `src/components/<name>/` follows the same shape. This walks through the
smallest useful one, `src/components/code/code-block.js`, a copy button for a `<pre><code>`.

## The markup works first

The page writes ordinary HTML:

```html
<rkui-code-block>
  <pre><code>npm run build</code></pre>
  <button class="rkui-code-copy" hidden>
    <span class="rkui-code-copy-label">Copy</span>
  </button>
</rkui-code-block>
```

Without JavaScript the code is still readable and selectable, and the button stays `hidden`
because it could not work. The element only enhances markup that is already usable. When the
script runs, `connectedCallback` un-hides the button and wires it up. An unknown tag like
`<rkui-code-block>` is just an inline box until `customElements.define` teaches the browser what
it is.

## The class and `customElements.define`

```js
export class RkuiCodeBlock extends HTMLElement { … }

customElements.define('rkui-code-block', RkuiCodeBlock)
```

`extends HTMLElement` makes the class a real element. `define` registers it: from then on the
browser creates a `RkuiCodeBlock` for every `<rkui-code-block>`, those already on the page and any
added later. The tag name must contain a dash, and we prefix it `rkui-`.

## Adopt or draw

An element that draws extra markup (the clock and dial faces) makes it with a function in
`src/shared/` that returns a string and uses no DOM. The Astro component calls the same function in
its frontmatter and writes the result into the page at build time. In `connectedCallback` the
element adopts a face already in its markup (`this.querySelector(':scope > .rkui-dial-face')`) and
draws one itself, with the same function, when there is none, so plain-HTML sites that write only
the documented markup still get a face. CSS hides a pre-drawn face until `:defined`, so without
JavaScript the native inputs show as they would with no face.

## Field declarations

```js
/** Unhooks all of this element's event listeners at once. @type {AbortController | undefined} */
listeners
/** The hidden span that screen readers read out, e.g. "Copied". @type {HTMLElement | undefined} */
announcer
```

These list what the element remembers, at the top, so you see its state before its behaviour.
The words say what the field holds. The `@type` tells the editor and `astro check` what it may
be: `| undefined` means "not set until `connectedCallback` runs".

## `connectedCallback` and `disconnectedCallback`

The browser calls `connectedCallback` each time the element is put into the page, and
`disconnectedCallback` each time it is taken out. Both can happen many times (an element that is
moved is disconnected and connected again), so setup goes in the first and undoing it in the
second.

```js
connectedCallback() {
  const button = this.querySelector('.rkui-code-copy')
  if (!(button instanceof HTMLButtonElement)) return   // no button, nothing to enhance
  …
  button.hidden = false
}
```

Start by checking the markup is what you expect and return quietly if it is not.

## The `AbortController` cleanup

```js
this.listeners = new AbortController()
button.addEventListener('click', this.copy, { signal: this.listeners.signal })
…
this.listeners?.abort()   // in disconnectedCallback
```

Passing the same `signal` to every `addEventListener` lets one `abort()` remove all of them. No
list of listeners to keep, and nothing left behind when the element leaves the page. Timers
(`clearTimeout`) and observers (`disconnect()`) are stopped in `disconnectedCallback` too, and
anything the element added to the page (here the announcer) is removed.

## Why handlers are arrow functions

```js
// An arrow function, so "this" stays the element when it runs as a click handler.
copy = async () => { … }
```

The browser calls a handler with `this` set to the element it is attached to (here the button).
A method would lose the custom element; an arrow function field keeps `this` as the element, so
`this.querySelector` and friends work. It is also the same function every time, so
`removeEventListener` can find it.
Ordinary helpers called as `this.showMessage(…)` are normal methods.

## Public and internal

The class has two halves, split by a comment:

```js
connectedCallback() { … }      // public: the browser calls these
disconnectedCallback() { … }

// Internal: not for pages to use.

copy = async () => { … }       // internal: only this file calls these
showMessage(message) { … }
```

Public is the lifecycle callbacks, `observedAttributes` and any method a page or the Astro
wrappers call. Everything else is internal. JavaScript does not enforce this, so internal names
are plain; the comment is the rule.

## Choosing names

A plain name lives on the same object as every built-in property of an element, so it can
silently replace one. `this.focus`, `this.hidden`, `this.title`, `this.remove` and `this.click`
are all real, and `onclick`, `onchange` and `oninput` are properties too. That is why handlers
are `handleClick`, not `onClick`, and why a field holding an input is `timeInput`, not `input`.
Check a new name against `HTMLElement` in `node_modules/typescript/lib/lib.dom.d.ts`, or ask the
editor: if hovering `this.name` shows a built-in, pick another.
