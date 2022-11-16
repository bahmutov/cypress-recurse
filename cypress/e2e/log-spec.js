// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'
import { getTo } from './utils'

describe('log option', () => {
  it('can be a flag: true', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: true,
    })
  })

  it('can be a flag: false', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: false,
    })
  })

  it('can be a flag: string to be printed at the end', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: '**got to 3!**',
    })
  })

  it('can be a function', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: cy.stub().as('log'),
    })

    // verify the calls to our log function
    cy.get('@log').should('have.been.calledThrice')
    cy.get('@log').its('firstCall.args').should('deep.equal', [1])
    cy.get('@log').its('secondCall.args').should('deep.equal', [2])
    cy.get('@log').its('thirdCall.args').should('deep.equal', [3])
  })

  it('can be a function that uses cy.log', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: (k) => cy.log(`k = **${k}**`),
    })
  })
})
