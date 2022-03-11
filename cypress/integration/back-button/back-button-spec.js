// @ts-check
/// <reference path="../../../src/index.d.ts" />

// normally, this would be
// import {recurse} from 'cypress-recurse
import { recurse } from '../../../src'

describe('Back button', { viewportHeight: 200, viewportWidth: 300 }, () => {
  it('goes from the last page to the first', () => {
    cy.visit('cypress/integration/back-button/index.html')
    // click on the "Back" button until the we get to the first page
    // and the button is gone from the DOM
    recurse(() => cy.get('#back').should(Cypress._.noop), Cypress._.isEmpty, {
      post() {
        cy.get('#back').click()
      },
      delay: 1_000,
      limit: 10,
      timeout: 30_000,
      log: false,
    })
  })
})
