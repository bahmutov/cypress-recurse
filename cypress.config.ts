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

async function retryRandomNumber(answer, limit = 100) {
  const n = await randomNumber()
  if (n === answer) {
    console.log('found the right answer')
    return n
  }

  if (limit === 1) {
    throw new Error('Max number of allowed iterations reached')
  }

  await sleep(1000)

  return retryRandomNumber(answer, limit - 1)
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
