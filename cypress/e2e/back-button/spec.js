// @ts-check
/// <reference path="../../../src/index.d.ts" />
import { recurse } from '../../..'

describe(
  'Back button',
  { viewportHeight: 200, viewportWidth: 300 },
  () => {
    it('cannot use cy.wrap with an empty jQuery object', () => {
      // by default, cy.wrap expected jQuery object to exist
      // cy.wrap(Cypress.$())
      // we can disable the built-in element existence check
      // by attaching our own no-op should callback
      cy.wrap(Cypress.$()).should(Cypress._.noop)
    })

    it('goes from the last page to the first', () => {
      cy.visit('cypress/e2e/back-button/index.html')
      // click on the "Back" button until the we get to the first page
      // and the button is gone from the DOM
      recurse(
        () => cy.get('#back').should(Cypress._.noop),
        // our predicate can check if the jQuery element is empty
        // using its "length" property or the Lodash _.isEmpty function
        // ($button) => $button.length === 0,
        Cypress._.isEmpty,
        {
          post() {
            cy.get('#back').click()
          },
          delay: 1000,
          timeout: 10000,
          limit: 10,
        },
      )
        // check if the "Back" button is gone from the DOM
        .should('not.exist')
    })
  },
)
