import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  projectId: 'tbtscx',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        randomNumber() {
          return new Promise((resolve) => {
            setTimeout(() => {
              const n = parseInt(Math.random().toString().slice(6, 7))
              console.log('returning %d', n)
              resolve(n)
            }, 1000)
          })
        },
      })
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*spec.{js,ts}',
  },
})
