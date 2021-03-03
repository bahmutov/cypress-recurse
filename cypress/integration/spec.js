// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'

describe('recurse', () => {
  // since the default timeout is short
  // allow retries to "fix" it
  it('gets 7', { retries: 10 }, () => {
    recurse(
      () => cy.wrap(7),
      (n) => n === 7,
    ).should('equal', 7)
  })

  // there is a chance that this function fails, so allow retrying it
  it('gets 7 after 50 iterations or 30 seconds', { retries: 2 }, () => {
    recurse(
      () => cy.task('randomNumber'),
      (n) => n === 7,
      {
        limit: 50, // max number of iterations
        timeout: 30000, // time limit in ms
      },
    )
  })

  it('yields the subject from the last command', () => {
    recurse(
      () => cy.wrap(7),
      (n) => n === 7,
    ).should('equal', 7)
  })

  // confirming we throw a good error if we forget to return
  // a chainable object
  // it.skip('detects non-chain', () => {
  //   // if we forget to return the Cypress command chain
  //   recurse(
  //     () => {
  //       cy.wrap(100)
  //       // notice we forget the return value
  //     },
  //     (x) => x === 100,
  //   )
  // })
})
