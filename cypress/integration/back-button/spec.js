// @ts-check
/// <reference path="../../../src/index.d.ts" />
import { recurse } from '../../..'

describe('Back button', { viewportHeight: 200, viewportWidth: 300 }, () => {
  it('goes from the last page to the first', () => {
    cy.visit('cypress/integration/back-button/index.html')
    // click on the "Back" button until the we get to the first page
    // and the button is gone from the DOM
    recurse(
      () => cy.get('#back').should(Cypress._.noop),
      ($button) => $button.length === 0,
      {
        post() {
          cy.get('#back').click()
        },
        delay: 1000,
        timeout: 10000,
        limit: 10,
      },
    )
  })
})
