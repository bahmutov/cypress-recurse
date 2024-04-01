// @ts-check
/// <reference types="cypress" />

import 'cypress-if'
import { recurse } from '../../../src'
import { getTo } from '../utils'
// import 'cypress-command-chain'

it('log message works', () => {
  cy.spy(cy, 'log').as('log')
  const message = '**got to 3!**'

  recurse(getTo(3), (x) => x === 3, {
    log: message,
  })

  cy.get('@log').should('have.been.calledWith', message)
})

it('log message works with wrapped value', () => {
  cy.spy(cy, 'log').as('log')
  const message = '**got to true!**'
  recurse(
    () => cy.wrap(true),
    (x) => x === true,
    {
      log: '**got to true!**',
    },
  ).should('be.true')
  cy.get('@log').should('have.been.calledWith', message)
})

it('log message works with cypress-if', () => {
  cy.spy(cy, 'log').as('log')
  const message = '**got to true!**'
  recurse(
    () =>
      cy
        .wrap(42)
        .if('equal', 42)
        .wrap(true)
        .else()
        .wrap(false)
        // it is important to call .finally() to stop the
        // "cy.if" from disabling the rest of the recursive chain
        .finally(),
    (x) => x === true,
    {
      log: message,
    },
  )
  cy.get('@log').should('have.been.calledWith', message)
})
