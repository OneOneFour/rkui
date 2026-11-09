<!--
  A highlighted code block: rkui's code-block markup around Shiki's highlighting, with the syntax
  colours taken from the --rkui-code-* tokens. The code is highlighted when the page is built, on
  the server. `class`, `style` and other attributes go on the `<figure>`, and `preClass` on the
  scrolling `<pre>`. With no `label` there is no title area: the copy button sits in the code's
  top-right corner, and `:copy="false"` leaves it out. The copy button needs `client:visible` in
  an Astro page; without it the button stays hidden.

  The caption starts with a mark for the language, the first of these that exists:
    1. the site's logo, in the "logo" slot (an inline SVG with class="rkui-icon rkui-icon--small"
       and aria-hidden="true"), e.g. <CodeBlock …><PythonLogo slot="logo" class="…" /></CodeBlock> in Astro, or
       <template #logo><PythonLogo class="…" /></template> in Vue
    2. the library's Phosphor file-type icon for the language (FILE_ICONS below)
    3. the file extension as grey text, e.g. "JS" (FILE_EXTENSIONS below), unless it would
       repeat the label, as for JSON

  @example
  <CodeBlock client:visible code="print('hi')" lang="python" label="Python" />
  <CodeBlock code="print('hi')" lang="python" copy={false} />
-->
<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch,
  ref,
  useSlots,
  type Component,
} from 'vue'
import CopyIcon from '@oneonefour/rkui/icons/copy.vue'
import FileCIcon from '@oneonefour/rkui/icons/file-c.vue'
import FileCppIcon from '@oneonefour/rkui/icons/file-cpp.vue'
import FileCSharpIcon from '@oneonefour/rkui/icons/file-c-sharp.vue'
import FileCssIcon from '@oneonefour/rkui/icons/file-css.vue'
import FileHtmlIcon from '@oneonefour/rkui/icons/file-html.vue'
import FileJsIcon from '@oneonefour/rkui/icons/file-js.vue'
import FileJsxIcon from '@oneonefour/rkui/icons/file-jsx.vue'
import FileMdIcon from '@oneonefour/rkui/icons/file-md.vue'
import FilePyIcon from '@oneonefour/rkui/icons/file-py.vue'
import FileRsIcon from '@oneonefour/rkui/icons/file-rs.vue'
import FileSqlIcon from '@oneonefour/rkui/icons/file-sql.vue'
import FileTsIcon from '@oneonefour/rkui/icons/file-ts.vue'
import FileTsxIcon from '@oneonefour/rkui/icons/file-tsx.vue'
import FileVueIcon from '@oneonefour/rkui/icons/file-vue.vue'

interface Props {
  /** The source to show. */
  code: string
  /** A Shiki language id, e.g. "python". */
  lang: string
  /** The language name shown in the caption; no caption (no title area) when left out. */
  label?: string
  /**
   * Whether to show the copy button, which needs JavaScript (`client:visible`); true when left
   * out.
   */
  copy?: boolean
  /** Extra classes for the scrolling `<pre>`; `rkui-scroll--bar` keeps its scrollbar visible. */
  preClass?: string
}

const { code, lang, label, copy = true, preClass } = defineProps<Props>()

/** Phosphor file-type icons by Shiki language id or common alias. */
const FILE_ICONS: Record<string, Component> = {
  c: FileCIcon,
  cpp: FileCppIcon,
  'c++': FileCppIcon,
  csharp: FileCSharpIcon,
  'c#': FileCSharpIcon,
  css: FileCssIcon,
  html: FileHtmlIcon,
  javascript: FileJsIcon,
  js: FileJsIcon,
  jsx: FileJsxIcon,
  markdown: FileMdIcon,
  md: FileMdIcon,
  python: FilePyIcon,
  py: FilePyIcon,
  rust: FileRsIcon,
  rs: FileRsIcon,
  sql: FileSqlIcon,
  typescript: FileTsIcon,
  ts: FileTsIcon,
  tsx: FileTsxIcon,
  vue: FileVueIcon,
}

/** File extensions for Shiki language ids whose id is not the extension. */
const FILE_EXTENSIONS: Record<string, string> = {
  'fortran-fixed-form': 'f',
  'fortran-free-form': 'f90',
  julia: 'jl',
  latex: 'tex',
}

const COPIED = 'Copied'
const FAILED = "Couldn't copy"
const RESET_DELAY_MS = 2000

const FileIcon = computed<Component | undefined>(() => FILE_ICONS[lang])
const extension = computed(() => FILE_EXTENSIONS[lang] ?? lang)

const slots = useSlots()
/**
 * The mark before the label, the first that applies: the site's logo, the library's file-type
 * icon, the extension as text, or nothing when the extension would just repeat the label (JSON).
 * A function, not a `computed`, because it reads the slots, which aren't reactive.
 */
function mark(): 'logo' | 'icon' | 'extension' | 'none' {
  if (slots.logo) return 'logo'
  if (FileIcon.value) return 'icon'
  if (extension.value.toLowerCase() !== label?.toLowerCase()) return 'extension'
  return 'none'
}

// The highlighted lines are made on the server. In the browser the block renders the code as
// plain text: a block first rendered there shows it unhighlighted, and one that hydrates keeps the
// server's lines, because Vue leaves an element whose text matches as it is.
const lines = ref('')
const plainCode = computed(() => code.replace(/(?:\r\n|\r|\n)$/, ''))
if (import.meta.env.SSR) {
  onServerPrefetch(async () => {
    const { highlight } = await import('./highlight.js')
    lines.value = await highlight(code, lang)
  })
}

// Set once the block runs in the browser; until then code.css hides the copy button.
const live = ref(false)
/** What the button and the screen-reader announcement say after a copy; nothing at rest. */
const message = ref('')
let resetTimer: number | undefined
onMounted(() => (live.value = true))
onBeforeUnmount(() => clearTimeout(resetTimer))

/** Copies the code, and says whether that worked for a moment. */
async function copyCode() {
  try {
    await navigator.clipboard.writeText(code)
    message.value = COPIED
  } catch {
    // No clipboard (an insecure page or an old browser) or permission denied.
    message.value = FAILED
  }
  clearTimeout(resetTimer)
  resetTimer = window.setTimeout(() => (message.value = ''), RESET_DELAY_MS)
}
</script>

<template>
  <figure class="rkui-code" :data-rkui-live="live ? '' : undefined">
    <figcaption v-if="label" class="rkui-code-header">
      <span class="rkui-code-lang">
        <slot v-if="mark() === 'logo'" name="logo" />
        <component
          :is="FileIcon"
          v-if="mark() === 'icon'"
          class="rkui-icon rkui-icon--small"
          aria-hidden="true"
        />
        <span v-if="mark() === 'extension'" aria-hidden="true">{{ extension }}</span>
        {{ label }}
      </span>
    </figcaption>
    <pre
      :class="['rkui-scroll', preClass]"
      tabindex="0"
    ><code v-if="lines" v-html="lines" /><code v-else>{{ plainCode }}</code></pre>
    <button
      v-if="copy"
      type="button"
      class="rkui-button rkui-button--small rkui-code-copy"
      @click="copyCode"
    >
      <CopyIcon class="rkui-icon rkui-icon--small" />
      <span class="rkui-code-copy-label">{{ message || 'Copy' }}</span>
    </button>
    <span class="rkui-visually-hidden" aria-live="polite">{{ message }}</span>
  </figure>
</template>
