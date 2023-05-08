import { retry } from '../../src/retry'

function randomNumber() {
  const n = parseInt(Math.random().toString().slice(6, 7))
  return n
}

it('retries', () => {
  cy.wrap(
    retry(randomNumber, (n) => n === 7, 100),
    { timeout: 60_000 },
  ).should('equal', 7)
})
