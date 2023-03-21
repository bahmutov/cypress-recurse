// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'
import { getErrorDetails } from '../../src/error-utils'
import { getTo } from './utils'
// @ts-ignore
import { stripIndent } from 'common-tags'

chai.config.truncateThreshold = 300

describe('error message', () => {
  it('formats options object', () => {
    const options = {
      timeout: 10,
      limit: 19,
      iteration: 2,
    }
    const s = getErrorDetails('Something went wrong', options)
    expect(s).to.equal(stripIndent`
      Something went wrong

      iteration: 2, timeout: 10
    `)
  })

  it('formats options object with elapsed time', () => {
    const options = {
      timeout: 10,
      limit: 19,
      iteration: 2,
      started: 100,
      now: 107,
    }
    const s = getErrorDetails('Something went wrong', options)
    expect(s).to.equal(stripIndent`
      Something went wrong

      iteration: 2, timeout: 10, elapsed: 7
    `)
  })

  // only for showing the error message
  it.skip('shows all details nicely formatted for timeout', () => {
    recurse(getTo(3), (x) => x === 3, { timeout: 1100 })
  })

  it.skip('shows all details nicely formatted for iteration', () => {
    recurse(getTo(3), (x) => x === 3, { limit: 1 })
  })
})
