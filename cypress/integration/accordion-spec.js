/// <reference path="../../src/index.d.ts" />

import { recurse } from '../..'

it('opens each accordion panel to find the button', () => {
  cy.visit('cypress/integration/accordion/index.html')

  // first, check that we have accordion panels
  cy.get('.accordion')
  // prepare for clicking on the button
  cy.window().then((win) => cy.stub(win, 'alert').as('alert'))

  let k = 0
  recurse(
    () => {
      cy.get('.accordion').eq(k).click()
      return cy.get('.panel:visible button').should(Cypress._.noop)
    },
    ($button) => $button.length,
    {
      post() {
        // close the current panel
        cy.get('.accordion').eq(k).click()
        // advance to the next panel
        k += 1
      },
      timeout: 10_000,
      // open up to 10 panels
      limit: 10,
      log: 'found the button',
      delay: 1000,
    },
  )
    // the cypress-recurse yields the subject of the first function
    // and in our case it will be the found button
    .click()
  // confirm the application called the alert
  cy.get('@alert').should('have.been.calledOnce')
})
