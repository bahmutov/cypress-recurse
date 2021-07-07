// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'

// https://github.com/bahmutov/cypress-recurse/issues/26
// keeps clicking "Next" until the page has the element we are looking for
describe('find on page example', () => {
  it('clicks until finds text', () => {
    cy.visit('cypress/integration/find-on-page.html')
    cy.contains('#output', 'Ready?').should('be.visible')

    recurse(
      () => cy.get('#output').invoke('text'),
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
