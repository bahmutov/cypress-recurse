// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'
import { getTo } from './utils'

describe('timeout option', () => {
  it('sets custom timeout', () => {
    recurse(getTo(10), (x) => x === 10, {
      timeout: 15000,
      delay: 1000,
    })
    // calling the recurse with a custom timeout
    // twice should use the custom timeout
    // and not continue the previous time remaining
    // https://github.com/bahmutov/cypress-recurse/issues/45
    cy.log('**second**')
    recurse(getTo(10), (x) => x === 10, {
      timeout: 15000,
      delay: 1000,
    })
  })
})
