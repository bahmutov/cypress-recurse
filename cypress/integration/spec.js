// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'

describe('recurse', () => {
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
