import type { AstroIntegration } from 'astro'

// The unions below are written out plainly; build/check-settings.js checks they match SETTINGS
// in src/shared/settings.js.

/** A setting a reader can switch, stored under `rkui-<setting>`. */
export type SettingName = 'theme' | 'palette' | 'shadow' | 'highlight' | 'dots' | 'light'

/**
 * The site's global settings: fixed ones, written on every page's `<html>` as it renders (an
 * attribute the layout already wrote there wins), and the ones readers may switch.
 */
export interface RkuiSettings {
  /** 'system' follows the OS, as no setting does. */
  theme?: 'system' | 'light' | 'dark'
  palette?: 'cream' | 'slate' | 'greige'
  /** The dark-mode shadow. */
  shadow?: 'outline' | 'block' | 'color'
  /** The dark-mode highlight. */
  highlight?: 'cream' | 'dark'
  dots?: 'plain' | 'pill'
  /** Where the light comes from, in degrees clockwise from the top. */
  light?: number
  /**
   * The settings whose stored choice a head script puts back on each page before first paint, for
   * the controls the site offers (ThemeToggle, LightDirection or its own); a fixed one listed here
   * is only the default. `['theme']` when left out; `[]` injects no script.
   */
  switchable?: SettingName[]
}

export interface RkuiOptions {
  /**
   * Fenced code in MDX as CodeBlock: true, false, or the attributes every fence's CodeBlock gets,
   * such as `{ copy: 'hover', editor: true }`; true when left out.
   */
  code?: boolean | Record<string, string | boolean>
  /** `$…$` in MDX as Maths and `$$…$$` as Equation; true when left out. */
  maths?: boolean
  /**
   * Vite settings the library needs: one Vue copy (`dedupeVue`), the dev server allowed to read
   * the package's fonts when it is linked (`allowPackage`), and woff2 kept as files (`fontFiles`).
   * True, false, or which to turn off; true when left out.
   */
  vite?: boolean | { dedupeVue?: boolean; allowPackage?: boolean; fontFiles?: boolean }
  /**
   * Writes the fonts', icons' and rkui's licence texts into the build output. True writes
   * `rkui-licences.txt`; a string picks the file name; false writes nothing; true when left out.
   */
  licences?: boolean | string
  /**
   * What goes in every page's head: the table mark before first paint, which tables and animated
   * stats wait under (`tables`), the stylesheet (`styles`) and the enhance scripts once
   * (`enhance`).
   * True, false, or which to turn off; true when left out. The site still writes charset and
   * viewport.
   */
  head?: boolean | { tables?: boolean; styles?: boolean; enhance?: boolean }
  /**
   * The site's global settings: true, false, or the fixed settings and the switchable list, such
   * as `{ palette: 'slate', switchable: ['theme', 'shadow'] }`. Fixed settings are written on
   * `<html>` as each page renders, so they need no JavaScript. True when left out, which only puts
   * back the theme; false bakes nothing and injects no script.
   */
  settings?: boolean | RkuiSettings
}

/** rkui's Astro integration: page setup, and fenced code and dollar maths in MDX. */
export default function rkui(options?: RkuiOptions): AstroIntegration
