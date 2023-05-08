import { defineConfig } from 'cypress'

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function randomNumber() {
  await sleep(1000)
  const n = parseInt(Math.random().toString().slice(6, 7))
  console.log('returning %d', n)
  return n
}

export default defineConfig({
  fixturesFolder: false,
  projectId: 'tbtscx',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        randomNumber,
      })
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*spec.{js,ts}',
  },
})
