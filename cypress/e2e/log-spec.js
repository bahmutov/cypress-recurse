// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'
import { getTo } from './utils'

chai.config.truncateThreshold = 300

describe('log option', () => {
  it('logs messages and values by default', () => {
    recurse(getTo(3), (x) => x === 3)
  })

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
    cy.get('@log')
      .its('firstCall.args')
      .should('have.length', 2)
      .its(0)
      .should('equal', 1)
    cy.get('@log')
      .its('secondCall.args')
      .should('have.length', 2)
      .its(0)
      .should('equal', 2)
    cy.get('@log')
      .its('thirdCall.args')
      .should('have.length', 2)
      .its(0)
      .should('equal', 3)
  })

  it('can be a function that uses cy.log', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: (k) => cy.log(`k = **${k}**`),
    })
  })

  it('passes a second parameter with details', () => {
    const logValues = cy.stub().as('logValues')
    const logInfo = cy.stub().as('logInfo')

    recurse(getTo(3), (x) => x === 3, {
      log(x, info) {
        logValues(x)
        logInfo(info)
      },
    })
    cy.get('@logInfo').should('have.been.calledThrice')
    cy.get('@logInfo')
      .its('firstCall.args.0')
      .should('deep.include', {
        iteration: 1,
        value: 1,
        limit: 20,
        successful: false,
      })
    cy.get('@logInfo')
      .its('secondCall.args.0')
      .should('deep.include', {
        iteration: 2,
        value: 2,
        limit: 19,
        successful: false,
      })
    cy.get('@logInfo')
      .its('thirdCall.args.0')
      .should('deep.include', {
        iteration: 3,
        value: 3,
        limit: 18,
        successful: true,
      })
  })

  it('has successful property in the data object', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: (k, data) =>
        cy.log(`${data.successful ? '✅' : '🚫'} k = **${k}**`),
    })
  })

  it('prints elapsed time and current value', () => {
    recurse(getTo(3), (x) => x === 3, {
      log: (k, data) =>
        cy.log(
          `${data.successful ? '✅' : '🚫'} after ${
            data.elapsedDuration
          } k = **${k}**`,
        ),
    })
  })
})
