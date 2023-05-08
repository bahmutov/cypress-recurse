import { defineConfig } from 'cypress'
import { sleep, retry } from './src/retry'

async function randomNumber() {
  await sleep(1000)
  const n = parseInt(Math.random().toString().slice(6, 7))
  console.log('returning %d', n)
  return n
}

async function retryRandomNumber(answer) {
  return retry(randomNumber, (n) => n === answer, { log: true })
}

export default defineConfig({
  fixturesFolder: false,
  projectId: 'tbtscx',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        randomNumber,
        retryRandomNumber,
      })
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*spec.{js,ts}',
  },
})
