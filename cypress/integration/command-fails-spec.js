// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'

describe('command fails', () => {
  const aCommandFails = () => {
    // notice how this command always fails
    return cy.wrap(2, { timeout: 1000 }).should('be.equal', 10)
  }

  // this test fails inside onFail, does not recurse
  // and simply passes since we ignore a failure
  it('works', () => {
    const onFail = (e) => {
      console.log('test failed', e)
    }
    cy.on('fail', onFail)

    recurse(aCommandFails, (x) => x === 2).should('be.equal', 2)
  })
})
