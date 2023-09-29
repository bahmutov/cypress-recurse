// @ts-check
/// <reference path="../../src/index.d.ts" />
import { recurse } from '../..'

describe('recurse', () => {
  // since the default timeout is short
  // allow retries to "fix" it
  it('gets 7', { retries: 10 }, () => {
    recurse(
      () => cy.wrap(7),
      (n) => n === 7,
    ).should('equal', 7)
  })

  // there is a chance that this function fails, so allow retrying it
  it(
    'gets 7 after 50 iterations or 60 seconds',
    { retries: 5 },
    () => {
      recurse(
        () => cy.task('randomNumber'),
        // https://github.com/bahmutov/cypress-recurse/issues/76
        // @ts-ignore
        (n) => n === 7,
        {
          limit: 50, // max number of iterations
          timeout: 60_000, // time limit in ms
        },
      )
    },
  )
})
