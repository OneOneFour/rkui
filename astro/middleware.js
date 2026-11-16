/**
 * The `rkui()` integration's middleware: it writes the site's fixed settings (the `settings`
 * option) onto every page's `<html>`, so they show with no JavaScript, and before first paint.
 * It runs for prerendered pages as they build, for server-rendered ones and in `astro dev`. The
 * page still streams: only the text up to the end of the `<html>` tag is held back.
 */
import settings from 'virtual:rkui/settings'
import { bakeStream } from './bake-settings.js'

/** @type {import('astro').MiddlewareHandler} */
export async function onRequest(_context, next) {
  const response = await next()
  if (!response.body || !response.headers.get('content-type')?.includes('text/html')) {
    return response
  }
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  return new Response(bakeStream(response.body, settings), {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
