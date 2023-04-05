// @ts-check
/// <reference types="cypress" />
import { recurse, RecurseDefaults } from '../..'
import { getTo } from './utils'

describe('options', () => {
  it('has default options', () => {
    // there are lots of default options
    cy.wrap(Object.keys(RecurseDefaults), { log: false })
      .invoke('join', ', ')
      .then(cy.log)
    // check some of them
    cy.wrap(RecurseDefaults).should('include.keys', [
      'limit',
      'timeout',
      'log',
      'delay',
    ])
  })

  it('does not change the options object', () => {
    const options = {
      limit: 5,
      timeout: 500,
      delay: 50,
      log: true,
    }
    const savedOptions = Cypress._.clone(options)
    cy.log('**first iteration**')
    recurse(getTo(3), (x) => x === 3, options).then(() => {
      expect(options, 'options unchanged').to.deep.equal(savedOptions)
    })

    cy.log('**second iteration**')
    recurse(getTo(4), (x) => x === 4, options).then(() => {
      expect(options, 'options unchanged').to.deep.equal(savedOptions)
    })
  })

  // https://github.com/bahmutov/cypress-recurse/issues/159
  it('computes the limit from timeout and delay', () => {
    const options = {
      timeout: 500,
      delay: 50,
      log: true,
    }
    recurse(getTo(3), (x) => x === 3, options)
    // hmm, how to confirm the computed limit?
  })

  // it('checks invalid option via types', () => {
  //   recurse(
  //     () => cy.task('randomNumber'),
  //     (n) => n === 7,
  //     {
  //       limit: 10,
  //       unknownOptions: 42,
  //     },
  //   )
  // })
})
