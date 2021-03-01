// @ts-check
/// <reference types="cypress" />

it.skip('yields 7 from the task (mostly fails)', () => {
  cy.task('randomNumber').should('equal', 7)
})

it.skip('yields 7 from the task (crashes)', () => {
  let found
  while (!found) {
    cy.task('randomNumber').then((n) => {
      if (n === 7) {
        found = true
      }
    })
  }
})

it('yields 7 from the task', () => {
  const checkNumber = () => {
    cy.task('randomNumber').then((n) => {
      cy.log(`**${n}**`)
      if (n === 7) {
        cy.log('**NICE!**')
        return
      }
      checkNumber()
    })
  }

  checkNumber()
})

it('yields 7 from the task (recursive)', () => {
  const recurse = (commandsFn, checkFn) => {
    commandsFn().then((x) => {
      if (checkFn(x)) {
        cy.log('**NICE!**')
        return
      }

      recurse(commandsFn, checkFn)
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
  )
})

it('yields 7 from the task (iteration count)', () => {
  const recurse = (commandsFn, checkFn, k = 1) => {
    cy.log(`iteration **${k}**`)

    commandsFn().then((x) => {
      if (checkFn(x)) {
        cy.log('**NICE!**')
        return
      }

      recurse(commandsFn, checkFn, k + 1)
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
  )
})

it('yields 7 from the task (limit)', () => {
  const recurse = (commandsFn, checkFn, limit = 3) => {
    if (limit < 0) {
      throw new Error('Recursion limit reached')
    }
    cy.log(`remaining attempts **${limit}**`)

    commandsFn().then((x) => {
      if (checkFn(x)) {
        cy.log('**NICE!**')
        return
      }

      recurse(commandsFn, checkFn, limit - 1)
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    30,
  )
})

it('yields 7 from the task (time limit)', () => {
  const recurse = (commandsFn, checkFn, timeRemaining = 4000) => {
    const started = +new Date()
    if (timeRemaining < 0) {
      throw new Error('Max time limit reached')
    }
    cy.log(`time remaining **${timeRemaining}**`)

    commandsFn().then((x) => {
      if (checkFn(x)) {
        cy.log('**NICE!**')
        return
      }

      const finished = +new Date()
      const elapsed = finished - started
      recurse(commandsFn, checkFn, timeRemaining - elapsed)
    })
  }

  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    10000,
  )
})

it('yields 7 from the task (options object)', () => {
  const recurse = (commandsFn, checkFn, options = {}) => {
    Cypress._.defaults(options, {
      limit: 30,
      timeRemaining: 30000,
      log: true,
    })
    const started = +new Date()

    if (options.limit < 0) {
      throw new Error('Recursion limit reached')
    }
    if (options.log) {
      cy.log(`remaining attempts **${options.limit}**`)
    }

    if (options.timeRemaining < 0) {
      throw new Error('Max time limit reached')
    }
    if (options.log) {
      cy.log(`time remaining **${options.timeRemaining}**`)
    }

    commandsFn().then((x) => {
      if (checkFn(x)) {
        if (options.log) {
          cy.log('**NICE!**')
        }
        return
      }

      const finished = +new Date()
      const elapsed = finished - started
      recurse(commandsFn, checkFn, {
        timeRemaining: options.timeRemaining - elapsed,
        limit: options.limit - 1,
        log: options.log,
      })
    })
  }

  recurse(
    () => cy.task('randomNumber', null, { log: false }),
    (n) => n === 7,
    { timeRemaining: 10000, log: true },
  )
})

it.only('yields 7 from the task (options object with types)', () => {
  /**
   * @typedef {object} RecurseOptions
   * @property {number=} limit The max number of iterations
   * @property {number=} timeRemaining In milliseconds
   * @property {boolean=} log Log to Command Log
   */
  /**
   * Recursively calls the given command until the predicate is true.
   * @param {() => Cypress.Chainable} commandsFn
   * @param {(any) => boolean} checkFn
   * @param {RecurseOptions} options
   */
  function recurse(commandsFn, checkFn, options = {}) {
    Cypress._.defaults(options, {
      limit: 30,
      timeRemaining: 30000,
      log: true,
    })
    const started = +new Date()

    if (options.limit < 0) {
      throw new Error('Recursion limit reached')
    }
    if (options.log) {
      cy.log(`remaining attempts **${options.limit}**`)
    }

    if (options.timeRemaining < 0) {
      throw new Error('Max time limit reached')
    }
    if (options.log) {
      cy.log(`time remaining **${options.timeRemaining}**`)
    }

    commandsFn().then((x) => {
      if (checkFn(x)) {
        if (options.log) {
          cy.log('**NICE!**')
        }
        return
      }

      const finished = +new Date()
      const elapsed = finished - started
      recurse(commandsFn, checkFn, {
        timeRemaining: options.timeRemaining - elapsed,
        limit: options.limit - 1,
        log: options.log,
      })
    })
  }

  recurse(
    () => cy.task('randomNumber', null, { log: false }),
    (n) => n === 7,
    { timeRemaining: 10000, log: true, limit: 60 },
  )
})
