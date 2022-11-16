// typically it would be importing from "cypress-recurse"
import { recurse } from '../../src'

//
// watch the video "Iterate Through Pages And Count Rows Using Recursion"
// https://youtu.be/_vqOtLIGI9o
//

describe('Table', () => {
  it('counts rows on each page (cypress-recurse)', () => {
    cy.visit('/cypress/e2e/pagination-sort-filter-manager')

    let count = 0
    recurse(
      () => {
        cy.get('tbody tr:visible')
          .should('have.length.gt', 0)
          .its('length')
          .then((n) => {
            count += n
          })
        return cy.get('[value=next]')
      },
      ($button) => $button.attr('disabled') === 'disabled',
      {
        log: 'Last page',
        delay: 500, // wait half a second between clicks
        post() {
          // if the button is not disabled, click it
          cy.get('[value=next]').click()
        },
      },
    ).then(() => {
      cy.log(`Total rows: ${count}`)
    })
  })

  it('counts all the rows across the pages', () => {
    cy.visit('/cypress/e2e/pagination-sort-filter-manager')

    let count = 0

    function goToTheNextPage() {
      cy.get('tbody tr:visible')
        .should('have.length.gt', 0)
        .its('length')
        .then((n) => {
          count += n
        })
      cy.get('[value=next]')
        .invoke('attr', 'disabled')
        .then((disabled) => {
          if (disabled === 'disabled') {
            // we are done
            cy.log(`count: ${count}`)
          } else {
            cy.wait(500)
            cy.get('[value=next]').click().then(goToTheNextPage)
          }
        })
    }

    goToTheNextPage()
  })

  it('counts all the rows across the pages (return chain)', () => {
    cy.visit('/cypress/e2e/pagination-sort-filter-manager')

    function goToTheNextPage(count) {
      cy.get('tbody tr:visible')
        .should('have.length.gt', 0)
        .its('length')
        .then((n) => {
          count += n
        })

      return cy
        .get('[value=next]')
        .invoke('attr', 'disabled')
        .then((disabled) => {
          if (disabled === 'disabled') {
            // we are done
            cy.log(`count: ${count}`)
            return cy.wrap(count)
          } else {
            cy.wait(500)
            return cy
              .get('[value=next]')
              .click()
              .then(() => goToTheNextPage(count))
          }
        })
    }

    goToTheNextPage(0).then((n) => {
      cy.log(n)
    })
  })

  it('counts all the rows across the pages (alias)', () => {
    cy.visit('/cypress/e2e/pagination-sort-filter-manager')

    function goToTheNextPage(count) {
      cy.get('tbody tr:visible')
        .should('have.length.gt', 0)
        .its('length')
        .then((n) => {
          count += n
        })

      cy.get('[value=next]')
        .invoke('attr', 'disabled')
        .then((disabled) => {
          if (disabled === 'disabled') {
            // we are done
            cy.log(`count: ${count}`)
            cy.wrap(count).as('rows')
          } else {
            cy.wait(500)
            cy.get('[value=next]')
              .click()
              .then(() => goToTheNextPage(count))
          }
        })
    }

    goToTheNextPage(0)
    cy.get('@rows').should('equal', 23)
  })
})
