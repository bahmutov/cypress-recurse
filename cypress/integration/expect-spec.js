// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'

const getTo = (n) => {
  let k = 0
  return () => {
    k += 1
    return cy.wrap(k)
  }
}

describe('expect inside the predicate', () => {
  it('predicate works', () => {
    recurse(getTo(4), (x) => x === 4).should('equal', 4)
  })

  it('works for 4', () => {
    recurse(
      () => cy.wrap(4),
      (x) => {
        expect(x).to.equal(4)
      },
    ).should('equal', 4)
  })

  it('works', () => {
    recurse(getTo(4), (x) => {
      expect(x).to.equal(4)
    }).should('equal', 4)
  })

  it('works when throwing', () => {
    recurse(getTo(4), (x) => {
      if (x !== 4) {
        throw new Error(`${x} is not 4`)
      }
    }).should('equal', 4)
  })

  it('works with multiple assertions', () => {
    recurse(
      () => cy.wrap('hello'),
      (x) => {
        expect(x).to.be.a('string')
        expect(x).to.equal('hello')
      },
    )
  })
})
