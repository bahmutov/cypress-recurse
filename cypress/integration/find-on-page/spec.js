// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../../src'

// https://github.com/bahmutov/cypress-recurse/issues/26
// keeps clicking "Next" until the page has the element we are looking for
describe('find on page example', () => {
  // because the test is random and can fail
  // retry it a couple of times on CI
  it('clicks until finds text', { retries: { runMode: 5 } }, () => {
    cy.visit('cypress/integration/find-on-page/index.html')
    cy.contains('#output', 'Ready?').should('be.visible')

    function getText() {
      return cy.get('#output').invoke('text')
    }

    recurse(getText, (text) => text === 'Surprise!', {
      delay: 500,
      timeout: 60000,
      log: false,
      post: () => cy.get('[data-cy=next]').click(),
    })
  })

  it('clicks until finds text (shorthand)', { retries: { runMode: 5 } }, () => {
    cy.visit('cypress/integration/find-on-page/index.html')
    cy.contains('#output', 'Ready?').should('be.visible')

    recurse(
      () => cy.get('#output').invoke('text'),
      // https://github.com/bahmutov/cypress-recurse/issues/76
      // @ts-ignore
      (text) => text === 'Surprise!',
      {
        delay: 500,
        timeout: 60000,
        log: false,
        post: () => cy.get('[data-cy=next]').click(),
      },
    )
  })
})
