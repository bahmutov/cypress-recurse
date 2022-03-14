// @ts-check
/// <reference path="../../../src/index.d.ts" />
// in the user's code this import would be
// import { each } from 'cypress-recurse'
import { each, recurse } from '../../../src'

describe('each', { viewportWidth: 200 }, () => {
  it('iterates over each row until it finds number 7', () => {
    cy.visit('cypress/integration/each/index.html')
    cy.get('#lotto tbody tr button')
      .should('have.length.greaterThan', 10)
      .then(
        each(
          ($button) => {
            cy.wrap($button, { log: false })
              .click()
              // once the button is clicked,
              // find the text in the cell next to it
              .parent() // <TD>
              .parent() // <TR>
              .find('td')
              .eq(1) // <TD> with the number
              .should(($td) => expect($td.text()).to.match(/\d/))
          },
          ($td) => $td.text() === '7',
        ),
      )
  })

  it('iterates over every row', () => {
    cy.visit('cypress/integration/each/index.html')
    cy.get('#lotto tbody tr')
      .should('have.length.greaterThan', 10)
      .its('length')
      .then((n) => {
        let count = 0
        cy.get('#lotto tbody tr button')
          .then(
            each(($button) => {
              count += 1
              cy.wrap($button).click().wait(500, { log: false })
            }),
          )
          .then(() => {
            expect(count, 'number of calls').to.equal(n)
          })
      })
  })

  it('yields the values in a new array', () => {
    const numbers = [1, 2, 3, 4]
    cy.wrap(numbers)
      .then(
        each((x) => {
          cy.log(x)
        }),
      )
      .should('deep.equal', numbers)
      .and('not.equal', numbers)
  })

  it('yields the values iterated over', () => {
    const numbers = [1, 2, 3, 4]
    cy.wrap(numbers)
      .then(
        each(
          (x) => {
            cy.log(x)
          },
          // stop when the value is 3
          (x) => x === 3,
        ),
      )
      .should('deep.equal', [1, 2])
  })

  it('can change the value using commands', () => {
    const numbers = [1, 2, 3, 4]
    cy.wrap(numbers)
      .then(
        each(
          (x) => {
            cy.log(x)
            cy.wrap(10 + x)
          },
          // stop when the value is 13
          (x) => x === 13,
        ),
      )
      .should('deep.equal', [11, 12])
  })

  it('can change the value using return', () => {
    const numbers = [1, 2, 3, 4]
    cy.wrap(numbers)
      .then(
        each(
          (x) => {
            return 10 + x
          },
          // stop when the value is 13
          (x) => x === 13,
        ),
      )
      .should('deep.equal', [11, 12])
  })

  it('overwrites cy.each command', () => {
    // TODO: update the TypeScript types for cy.each method
    Cypress.Commands.overwrite(
      'each',
      (originalFn, items, itemCallback, stopCallback) => {
        // @ts-ignore
        return each(itemCallback, stopCallback)(items)
      },
    )

    cy.visit('cypress/integration/each/index.html')
    cy.get('#lotto tbody tr button')
      .should('have.length.greaterThan', 10)
      .each(
        ($button) => {
          cy.wrap($button, { log: false })
            .click()
            // once the button is clicked,
            // find the text in the cell next to it
            .parent() // <TD>
            .parent() // <TR>
            .find('td')
            .eq(1) // <TD> with the number
            .should(($td) => expect($td.text()).to.match(/\d/))
        },
        // @ts-ignore
        ($td) => $td.text() === '7',
      )
  })

  it('finds the lucky 7 using recursion', () => {
    cy.visit('cypress/integration/each/index.html')
    cy.get('#lotto tbody tr button').should('have.length.greaterThan', 10)

    recurse(
      () => {
        return cy.contains('tr', '???').then(($tr) => {
          cy.wrap($tr).contains('button', 'Click me').click()
          cy.wrap($tr).contains('td', /\d/)
        })
      },
      ($el) => {
        return $el.text() === '7'
      },
      {
        timeout: 60000,
        log: false,
      },
    )
  })
})
