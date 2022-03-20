// @ts-check
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
})
