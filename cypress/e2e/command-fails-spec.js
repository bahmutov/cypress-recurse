// @ts-check
import { recurse } from '../..'

describe('command fails', () => {
  const aCommandFails = () => {
    // notice how this command always fails
    return cy.wrap(2, { timeout: 1000 }).should('be.equal', 10)
  }

  // this test fails inside onFail, does not recurse
  // and simply passes since we ignore a failure
  it('works', () => {
    // @ts-ignore
    const onFail = (e) => {
      console.log('test failed', e)
    }
    cy.on('fail', onFail)

    recurse(aCommandFails, (x) => x === 2).should('be.equal', 2)
  })

  // this test reaches the recursion limit and throws a custom error message
  // and verify that message is shown
  it('custom error message on limit reached failure', () => {
    const errMsg = 'sorry i reached the iteration limit'

    // @ts-ignore
    const onFail = (e) => {
      expect(e.toString()).to.include(errMsg)
    }
    cy.on('fail', onFail)

    recurse(
      () => cy.wrap(2, { timeout: 1000 }),
      (x) => {
        return x == 3
      },
      {
        limit: 5,
        timeout: 10000,
        error: errMsg,
      },
    )
  })

  // this test times out and throws a custom error message
  // and verify that message is shown
  it('custom error message on time out failure', () => {
    const errMsg = 'sorry i timed out'

    // @ts-ignore
    const onFail = (e) => {
      expect(e.toString()).to.include(errMsg)
    }
    cy.on('fail', onFail)

    recurse(
      () => cy.wrap(2, { timeout: 1000 }),
      (x) => {
        return x == 3
      },
      {
        error: errMsg,
        delay: 500,
        timeout: 1000,
      },
    )
  })

  it('logs parameters', () => {
    // @ts-ignore
    const onFail = (e) => {}
    cy.on('fail', onFail)

    recurse(
      () => cy.wrap(2, { timeout: 1000 }),
      (x) => {
        return x == 3
      },
      {
        delay: 500,
        timeout: 1000,
      },
    )
  })
})
