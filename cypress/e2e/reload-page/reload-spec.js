// @ts-check
/// <reference types="cypress" />

import { recurse } from '../../../src'
// import 'cypress-command-chain'

it(
  'reloads the page until number 7 appears',
  {
    retries: { runMode: 5 },
    viewportWidth: 200,
    viewportHeight: 200,
  },
  () => {
    cy.visit('cypress/e2e/reload-page/index.html')

    recurse(
      () => cy.contains('#result', '7').should(Cypress._.noop),
      ($el) => $el && $el.text() === '7',
      {
        limit: 60,
        delay: 1000, // sleep for 1 second before reloading the page
        timeout: 60_000, // try up to one minute
        log: false,
        post: () => {
          cy.reload()
        },
      },
    )
  },
)
