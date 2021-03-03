// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'
import { getTo } from './utils'

describe('delay option', () => {
  it('delays each iteration by N milliseconds', () => {
    recurse(getTo(5), (x) => x === 5, {
      delay: 500,
      limit: 5,
      timeout: 6000,
    })
  })
})
