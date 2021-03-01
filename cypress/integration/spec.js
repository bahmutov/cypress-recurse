// @ts-check
/// <reference types="cypress" />

// https://github.com/NoriSte/cypress-wait-until
import 'cypress-wait-until'

it.skip('yields 7 from the task (mostly fails)', () => {
  cy.task('randomNumber').should('equal', 7)
})

it('yields 7 from the task (recursion)', () => {
  const getNumber = () => {
    cy.task('randomNumber').then((n) => {
      if (n === 7) {
        cy.log('lucky **7**')
        return
      }
      cy.log(`got **${n}**`)
      getNumber()
    })
  }

  getNumber()
})

it('yields 7 from the task (reusable recursion)', () => {
  const recurse = (commandsFn, checkFn, options = {}) => {
    commandsFn().then((x) => {
      if (options.log) {
        if (typeof options.log === 'function') {
          options.log(x)
        } else {
          cy.log(`checking **${x}**`)
        }
      }

      if (checkFn(x)) {
        cy.log('check passed')
        return
      }
      recurse(commandsFn, checkFn, options)
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    {
      log: true,
    },
  )
})

it('yields 7 from the task (cypress-wait-until)', () => {
  cy.waitUntil(() => cy.task('randomNumber').then((n) => n === 7))
})

it('logs iteration', () => {
  const recurse = (
    commandsFn,
    checkFn,
    k = 1,
    remainingAttempts = 30,
    remainingTime = 30000,
  ) => {
    if (remainingAttempts < 0) {
      throw new Error('No attempts left')
    }
    if (remainingTime < 0) {
      throw new Error('Out of time')
    }

    const started = +new Date()
    commandsFn().then((x) => {
      cy.log(`recurse **${k}** (${remainingTime}ms left): ${x}`)

      if (checkFn(x)) {
        cy.log('**NICE!**')
        return
      }

      const elapsed = +new Date() - started
      recurse(
        commandsFn,
        checkFn,
        k + 1,
        remainingAttempts - 1,
        remainingTime - elapsed,
      )
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
  )
})

it('logs iteration (options object)', () => {
  const recurse = (commandsFn, checkFn, options) => {
    Cypress._.defaults(options, {
      k: 1,
      remainingAttempts: 30,
      remainingTime: 30000,
    })

    if (options.remainingAttempts < 0) {
      throw new Error('No attempts left')
    }
    if (options.remainingTime < 0) {
      throw new Error('Out of time')
    }

    const started = +new Date()
    commandsFn().then((x) => {
      cy.log(`recurse **${options.k}** (${options.remainingTime}ms left): ${x}`)

      if (checkFn(x)) {
        cy.log('**NICE!**')
        return
      }

      const elapsed = +new Date() - started
      recurse(commandsFn, checkFn, {
        k: options.k + 1,
        remainingAttempts: options.remainingAttempts - 1,
        remainingTime: options.remainingTime - elapsed,
      })
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    {
      remainingAttempts: 6,
      remainingTime: 5000,
    },
  )
})

it('logs iteration (options object with types)', () => {
  // define types for the recurse options using JSDoc comments
  // https://glebbahmutov.com/blog/trying-typescript/#types-from-jsdoc

  /**
   * @typedef {Object} RecurseOptions User options for "recurse" function
   * @property {number=} k Current iteration counter
   * @property {number=} remainingAttempts Remaining attempts
   * @property {number=} timeout Command timeout
   */
  /**
   * Recursively executes itself until the commands function
   * yields the value that makes the predicate function true.
   * @param {() => Cypress.Chainable} commandsFn Function perfoming Cypress commands
   * @param {(any) => boolean} checkFn Predicate checking the yielded value
   * @param {RecurseOptions} options Command options
   */
  function recurse(commandsFn, checkFn, options = {}) {
    Cypress._.defaults(options, {
      k: 1,
      remainingAttempts: 30,
      timeout: 30000,
    })

    if (options.remainingAttempts < 0) {
      throw new Error('No attempts left')
    }
    if (options.timeout < 0) {
      throw new Error('Out of time')
    }

    const started = +new Date()
    commandsFn().then((x) => {
      cy.log(`recurse **${options.k}** (${options.timeout}ms left): ${x}`)

      if (checkFn(x)) {
        cy.log('**NICE!**')
        return
      }

      const elapsed = +new Date() - started
      recurse(commandsFn, checkFn, {
        k: options.k + 1,
        remainingAttempts: options.remainingAttempts - 1,
        timeout: options.timeout - elapsed,
      })
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    {
      remainingAttempts: 50,
      timeout: 3000,
    },
  )
})
