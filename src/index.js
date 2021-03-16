// @ts-check
/// <reference types="cypress" />
/**
 * @typedef {boolean|string|((any) => void)} LogOption
 */

/**
 * @typedef {object} PostFunctionOptions
 * @property {number} limit The remaining number of iterations
 */
/**
 * @typedef {(opts: PostFunctionOptions) => void|Cypress.Chainable} PostFunction
 */
/**
 * @typedef {PostFunction} PostFunctionOption
 */

/**
 * @typedef {object} RecurseOptions
 * @property {number} limit The max number of iterations
 * @property {number} timeout In milliseconds
 * @property {LogOption} log Log to Command Log, could be true|false, a message to be printed once at the end, or a custom function
 * @property {number} delay Between iterations, milliseconds
 * @property {PostFunction=} post Function that can run additional Cypress commands after each iteration
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

  const logCommands = options.log === true

  if (options.limit < 0) {
    throw new Error('Recursion limit reached')
  }
  if (logCommands) {
    cy.log(`remaining attempts **${options.limit}**`)
  }

  if (options.timeout < 0) {
    throw new Error('Max time limit reached')
  }
  if (logCommands) {
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
    if (logCommands) {
      cy.log(x)
    } else if (typeof options.log === 'function') {
      options.log(x)
    }

    try {
      const predicateResult = checkFn(x)
      if (predicateResult === true || predicateResult === undefined) {
        if (logCommands) {
          cy.log('**NICE!**')
        } else if (typeof options.log === 'string') {
          cy.log(options.log)
        }
        return
      }
    } catch (e) {
      // ignore the error, treat is as falsy predicate
    }

    const nextIteration = () => {
      const finished = +new Date()
      const elapsed = finished - started
      return recurse(commandsFn, checkFn, {
        timeout: options.timeout - elapsed,
        limit: options.limit - 1,
        log: options.log,
        delay: options.delay,
        post: options.post,
      })
    }

    const delayStep =
      options.delay > 0 ? cy.wait(options.delay, { log: logCommands }) : cy

    const callPost = () => {
      const result = options.post({ limit: options.limit })
      return Cypress.isCy(result) ? result : cy
    }

    const postStep =
      typeof options.post === 'function' ? delayStep.then(callPost) : delayStep

    return postStep.then(nextIteration)
  })
}

module.exports = {
  recurse,
  RecurseDefaults,
}
