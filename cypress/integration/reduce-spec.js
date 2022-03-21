/// <reference types="cypress" />
import { recurse } from '../../src'

describe('reduce the data', () => {
  it('accumulates the items seen using external list', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const seen = []

    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        seen.push(item)
        return seen.length === 10
      },
      {
        limit: 10,
        delay: 100,
      },
    )

    cy.wrap(seen).should('deep.equal', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('accumulates the items seen', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const seen = []

    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        return item === 10
      },
      {
        limit: 10,
        delay: 100,
        log: false,
        reduceFrom: seen,
        reduce(acc, item) {
          acc.push(item)
        },
        reduceLastValue: true,
      },
    )
    cy.wrap(seen, { log: false }).should('deep.equal', [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
    ])
  })

  it('returns the changed accumulator', () => {
    const items = [1, 2, 3, 4]

    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        return item === 4
      },
      {
        limit: 4,
        delay: 100,
        log: false,
        reduceFrom: 0,
        reduce(acc, item) {
          // console.log({ acc, item })
          return acc + item
        },
        reduceLastValue: true,
        yield: 'reduced',
      },
    ).should('equal', 10)
  })

  it('passes the reduced value to the predicate', () => {
    // draw a random number until we get a number we have already seen
    recurse(
      () => cy.wrap(Cypress._.random(10)),
      (n, numbers) => numbers.has(n),
      {
        limit: 20,
        delay: 100,
        log: false,
        reduceFrom: new Set(),
        reduce(numbers, n) {
          numbers.add(n)
        },
        yield: 'reduced',
      },
    ).then((numbers) => {
      cy.log(...numbers)
    })
  })
})
