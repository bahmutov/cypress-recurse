// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'

it('calls the failFast predicate first', () => {
  recurse(
    () => cy.task('randomNumber'),
    cy.stub().as('predicate').returns(true),
    {
      limit: 1,
      failFast: cy.stub().as('failFast').returns(false),
    },
  ).should('be.a', 'number')

  cy.log('**confirm calls**')
  cy.get('@failFast').should(
    'be.calledOnceWithExactly',
    Cypress.sinon.match.number,
  )
  cy.get('@predicate').should(
    'be.calledOnceWithExactly',
    Cypress.sinon.match.number,
    undefined,
  )

  cy.log('**confirm order of calls**')
  cy.get('@failFast').then((failFast) => {
    cy.get('@predicate').should('have.been.calledAfter', failFast)
  })
})

it('fails the test if the failFast predicate returns true', () => {
  // fail the test if we do not handle the error
  cy.on('fail', (err) => {
    console.error(err.message)

    if (
      !err.message.includes(
        'cypress-recurse: failFast predicate returned true for value',
      )
    ) {
      throw err
    }
  })

  recurse(
    () => cy.task('randomNumber'),
    cy.stub().as('predicate').returns(true),
    {
      limit: 1,
      failFast: cy.stub().as('failFast').returns(true),
    },
  ).should('be.a', 'number')
  // nothing here is reachable because the test throws an error
})
