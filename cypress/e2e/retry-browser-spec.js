import { sleep, retry } from '../../src/retry'

async function randomNumber() {
  await sleep(100)
  const n = parseInt(Math.random().toString().slice(6, 7))
  return n
}

it('retries', () => {
  cy.wrap(
    retry(randomNumber, (n) => n === 7, { limit: 100, log: true }),
    { timeout: 60_000 },
  ).should('equal', 7)
})

async function randomList() {
  await sleep(100)
  // most often return an empty list
  if (Math.random() > 0.2) {
    return []
  }
  // sometimes return a list with an item
  return [
    {
      n: 42,
    },
  ]
}

it('extracts value after the predicate passes', () => {
  cy.wrap(
    retry(randomList, (list) => list.length > 0, {
      limit: 100,
      log: true,
      extract: (list) => list[0].n,
    }),
    { timeout: 60_000 },
  ).should('equal', 42)
})
