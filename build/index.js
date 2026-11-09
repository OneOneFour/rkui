// Builds everything the package ships that can't ship as source, into dist/. Run with
// `node build/index.js`; `npm run dev`, `npm run build` and `npm pack` all run it first.
import { rm } from 'node:fs/promises'
import './check-boundary.js'
import { buildColors } from './colors.js'
import { buildCss } from './css.js'
import { buildIcons } from './icons.js'
import { buildJs } from './js.js'
import { buildTypes } from './types.js'

await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true })

await buildColors()
await buildIcons()
await buildCss()
await buildJs()
await buildTypes()
