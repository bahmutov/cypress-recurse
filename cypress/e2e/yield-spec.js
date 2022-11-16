// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'

describe('yields option', () => {
  it('returns the last value', () => {
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
          return acc + item
        },
        reduceLastValue: true,
        yield: 'value',
      },
    ).should('equal', 4)
  })

  it('returns the reduced value', () => {
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
          return acc + item
        },
        reduceLastValue: true,
        yield: 'reduced',
      },
    ).should('equal', 10)
  })

  it('returns both the last value and the reduced value', () => {
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
          return acc + item
        },
        reduceLastValue: true,
        yield: 'both',
      },
    ).should('deep.equal', {
      value: 4,
      reduced: 10,
    })
  })
})
