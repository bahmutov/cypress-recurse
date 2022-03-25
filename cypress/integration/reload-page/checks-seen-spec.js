// @ts-check
/// <reference types="cypress" />

import { recurse } from '../../../src'

// make sure the Chai assertion shows the full array
chai.config.truncateThreshold = 200

// Watch the video
// "cypress-recurse: Reload The Page Until We See 7 Plus Check The Numbers Before That"
// https://youtu.be/KHJkRp_rRYg

it(
  'checks the numbers before 7 appears',
  {
    retries: { runMode: 5 },
    viewportWidth: 200,
    viewportHeight: 200,
  },
  () => {
    cy.visit('cypress/integration/reload-page/index.html')

    recurse(
      () => cy.get('#result').invoke('text').then(parseInt),
      (n) => n === 7,
      {
        limit: 60,
        delay: 1000, // sleep for 1 second before reloading the page
        timeout: 60_000, // try up to one minute
        log: false,
        reduceFrom: [],
        reduce(numbers, n) {
          numbers.push(n)
        },
        post: () => {
          cy.reload()
        },
        yield: 'reduced',
      },
    ).then((numbers) => {
      expect(numbers).to.not.include(7)
    })
  },
)
