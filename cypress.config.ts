import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  projectId: 'tbtscx',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*spec.{js,ts}',
  },
})
