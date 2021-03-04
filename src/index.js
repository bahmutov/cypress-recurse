// @ts-check
/// <reference types="cypress" />
/**
 * @typedef {boolean|((any) => void)} LogOption
 */

/**
 * @typedef {object} RecurseOptions
 * @property {number} limit The max number of iterations
 * @property {number} timeout In milliseconds
 * @property {LogOption} log Log to Command Log
 * @property {number} delay Between iterations, milliseconds
 */

/** @type {RecurseOptions} */
const RecurseDefaults = {
  limit: 30,
  timeout: Cypress.config('defaultCommandTimeout'),
  log: true,
  delay: 0,
}

/**
 * Recursively calls the given command until the predicate is true.
 * @param {() => Cypress.Chainable} commandsFn Function running Cypress commands
 * @param {(any) => boolean|void} checkFn Predicate that should return true to finish
 * @param {Partial<RecurseOptions>} options Options for maximum timeout, logging, etc
 * @returns {Cypress.Chainable} Returns the command chain
 */
function recurse(commandsFn, checkFn, options = {}) {
  Cypress._.defaults(options, RecurseDefaults)
  const started = +new Date()

  if (options.limit < 0) {
    throw new Error('Recursion limit reached')
  }
  if (options.log) {
    cy.log(`remaining attempts **${options.limit}**`)
  }

  if (options.timeout < 0) {
    throw new Error('Max time limit reached')
  }
  if (options.log) {
    cy.log(`time remaining **${options.timeout}**`)
  }

  const result = commandsFn()
  if (!Cypress.isCy(result)) {
    throw new Error(
      [
        'The function passed to cypress-recurse did not return a chainable instance.',
        'Did you forget the "return" command?',
      ].join(' '),
    )
  }
  return result.then((x) => {
    if (options.log) {
      if (typeof options.log === 'function') {
        options.log(x)
      } else {
        cy.log(x)
      }
    }

    try {
      const predicateResult = checkFn(x)
      if (predicateResult === true || predicateResult === undefined) {
        if (options.log) {
          cy.log('**NICE!**')
        }
        return
      }
    } catch (e) {
      // ignore the error, treat is as falsy predicate
    }

    if (options.delay > 0) {
      return cy.wait(options.delay, { log: false }).then(() => {
        const finished = +new Date()
        const elapsed = finished - started
        return recurse(commandsFn, checkFn, {
          timeout: options.timeout - elapsed,
          limit: options.limit - 1,
          log: options.log,
          delay: options.delay,
        })
      })
    }

    // no delay
    const finished = +new Date()
    const elapsed = finished - started
    return recurse(commandsFn, checkFn, {
      timeout: options.timeout - elapsed,
      limit: options.limit - 1,
      log: options.log,
      delay: options.delay,
    })
  })
}

module.exports = {
  recurse,
  RecurseDefaults,
}
