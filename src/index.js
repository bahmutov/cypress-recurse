// @ts-check
/// <reference types="cypress" />
/**
 * @typedef {object} RecurseOptions
 * @property {number} limit The max number of iterations
 * @property {number} timeout In milliseconds
 * @property {boolean} log Log to Command Log
 */

/** @type {RecurseOptions} */
const RecurseDefaults = {
  limit: 30,
  timeout: Cypress.config('defaultCommandTimeout'),
  log: true,
}

/**
 * Recursively calls the given command until the predicate is true.
 * @param {() => Cypress.Chainable} commandsFn Function running Cypress commands
 * @param {(any) => boolean} checkFn Predicate that should return true to finish
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

  return commandsFn().then((x) => {
    if (options.log) {
      cy.log(x)
    }

    if (checkFn(x)) {
      if (options.log) {
        cy.log('**NICE!**')
      }
      return
    }

    const finished = +new Date()
    const elapsed = finished - started
    return recurse(commandsFn, checkFn, {
      timeout: options.timeout - elapsed,
      limit: options.limit - 1,
      log: options.log,
    })
  })
}

module.exports = {
  recurse,
  RecurseDefaults,
}
