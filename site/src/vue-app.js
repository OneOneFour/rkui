/**
 * The docs site's setup for every Vue app Astro makes (astro.config.js, `appEntrypoint`). An error
 * a component throws, such as a Folder with no Tab, stops the build. Vue's production build would
 * otherwise only log it and leave the component out of the page.
 *
 * @param {import('vue').App} app
 */
export default function setup(app) {
  app.config.throwUnhandledErrorInProduction = true
}
