/// <reference types="cypress" />
import { sleep, retry } from '../../src/retry'

chai.config.truncateThreshold = 200

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

function getTo(n, delay = 100) {
  let k = 0
  return async () => {
    if (k > n) {
      throw new Error(`Limit ${n} exceeded`)
    }
    await sleep(delay)
    k += 1
    return k
  }
}

it('logs using my function', async () => {
  const logSpy = Cypress.sinon.spy(console, 'log')
  const log = ({ attempt, limit, value, successful }) => {
    console.log(
      'attempt %d of %d, value %o success: %o',
      attempt,
      limit,
      value,
      successful,
    )
  }

  const x = await retry(getTo(3), (n) => n === 3, { limit: 5, log })
  expect(x, 'final value').to.equal(3)
  expect(logSpy, 'console.log').to.be.calledThrice
})

it('log is called correctly', async () => {
  const log = Cypress.sinon.stub()
  const x = await retry(getTo(3, 500), (n) => n === 3, {
    limit: 5,
    log,
  })
  expect(x, 'final value').to.equal(3)
  expect(log, 'user log').to.be.calledThrice
  expect(log.firstCall.args).to.deep.equal([
    {
      attempt: 1,
      limit: 5,
      value: 1,
      successful: false,
    },
  ])
  expect(log.secondCall.args).to.deep.equal([
    {
      attempt: 2,
      limit: 5,
      value: 2,
      successful: false,
    },
  ])
  expect(log.thirdCall.args).to.deep.equal([
    {
      attempt: 3,
      limit: 5,
      value: 3,
      successful: true,
    },
  ])
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
