// @ts-check
/// <reference types="cypress" />
// register chai-sorted assertions
// https://www.chaijs.com/plugins/chai-sorted/
chai.use(require('chai-sorted'))

import { recurse } from '../..'

describe('Table pagination', () => {
  it('has table sorted by points', { viewportHeight: 1100 }, () => {
    cy.visit('/cypress/integration/pagination-sort-filter-manager')
    // at first, the table shows 5 rows per page
    cy.get('#numrows').should('have.value', '5')
    // and there are buttons to pick other pages
    cy.get('.pagecontroller-num').should('have.length.gt', 1)

    cy.get('#numrows').select('100')
    // check if the table fits into one page
    cy.get('.pagecontroller-num').should('have.length', 1)

    // confirm the points column is not sorted
    // first, pick all cells in the 5th column
    cy.get('tbody td + td + td + td + td')
      .then(($cells) => Cypress._.map($cells, 'innerText'))
      .then((strings) => Cypress._.map(strings, Number))
      // log the first few values for clarity
      .then((points) => cy.log(points.slice(0, 5).join(', ')))
      .should('not.be.sorted')

    // sort by clicking the header column
    cy.contains('.sorterHeader', 'Points').click()
    // there is a delay between the click and the sort
    // DOES NOT WORK: the code below has multiple commands
    // that never retry getting the table cells
    // cy.get('tbody td + td + td + td + td')
    //   .then(($cells) => Cypress._.map($cells, 'innerText'))
    //   .then((strings) => Cypress._.map(strings, Number))
    //   // log the first few values for clarity
    //   .then((points) => cy.log(points.slice(0, 5).join(', ')))
    //   .should('be.ascending')

    // first solution - rewrite the separate commands into a single
    // should(callback) assertion, see cypress-examples "Sorted table" recipe

    // second solution: using cypress-recurse
    recurse(
      () =>
        cy
          .get('tbody td + td + td + td + td')
          .then(($cells) => Cypress._.map($cells, 'innerText'))
          .then((strings) => Cypress._.map(strings, Number))
          // log the first few values for clarity
          .then((points) => cy.log(points.slice(0, 5).join(', '))),
      (points) => {
        // @ts-ignore
        expect(points).to.be.ascending
      },
      {
        log: false,
        delay: 500,
        timeout: 10000,
      },
    )
  })
})
