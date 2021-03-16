// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'
import { getTo } from './utils'

describe('delay option', () => {
  it('delays each iteration by N milliseconds', () => {
    const start = +new Date()
    recurse(getTo(5), (x) => x === 5, {
      delay: 500,
      limit: 5,
      timeout: 6000,
    }).then(() => {
      const end = +new Date()
      const elapsed = end - start
      expect(elapsed, 'ms').to.be.greaterThan(2000)
    })
  })

  it('runs delay AFTER post commands', () => {
    const start = +new Date()
    // should resolve on the second iteration
    // with just a single delay and a single call to "post"
    recurse(getTo(2), (x) => x === 2, {
      delay: 1000,
      limit: 1,
      timeout: 6000,
      post() {
        console.log('inside post')
        const end = +new Date()
        const elapsed = end - start
        console.log('elapsed', elapsed)
        return cy.log('The delay should have been applied').then(() => {
          expect(elapsed, 'ms').to.be.greaterThan(1000)
        })
      },
    })
  })
})
