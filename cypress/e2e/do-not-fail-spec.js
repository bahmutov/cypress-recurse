// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'
import { getTo } from './utils'

chai.config.truncateThreshold = 300

describe('do not fail option', () => {
  it('continues if max number of iterations is reached', () => {
    recurse(getTo(3), (x) => x === 100, {
      doNotFail: true,
      limit: 3,
    }).should('be.undefined')
  })

  it('continues if time limit is reached', () => {
    recurse(getTo(3), (x) => x === 100, {
      doNotFail: true,
      limit: 100,
      timeout: 1000,
    }).should('be.undefined')
  })

  context('yields value', () => {
    // https://github.com/bahmutov/cypress-recurse/issues/157
    it.skip('even if predicate is false', () => {
      recurse(getTo(3), (x) => x === 100, {
        doNotFail: true,
        yield: 'value',
        limit: 3,
        delay: 100,
      }).should('equal', 3)
    })
  })
})
