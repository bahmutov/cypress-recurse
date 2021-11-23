// @ts-check

/** @type {import('./index').RecurseOptions} */
const RecurseDefaults = {
  limit: 20,
  timeout: Cypress.config('defaultCommandTimeout'),
  log: true,
  delay: Cypress.config('defaultCommandTimeout') / 5,
}

/**
 * @type {import('./index').RecurseFn}
 */
function recurse(commandsFn, checkFn, options = {}) {
  return cy.then(function cypressRecurse() {
    const now = +new Date()
    const timeout = options.timeout || RecurseDefaults.timeout

    if (!Cypress._.isNumber(timeout)) {
      throw new Error(`timeout must be a number, was ${timeout}`)
    }

    // make sure not to modify the passed in options
    options = Cypress._.clone(options)
    Cypress._.defaults(options, RecurseDefaults, {
      // set the started time if not set
      started: now,
      // and calculate the end time if not set
      ends: now + timeout,
      iteration: 1,
    })
    // console.log('options', options)

    const timeRemaining = options.started + options.timeout - now
    if (!Cypress._.isFinite(timeRemaining)) {
      throw new Error(`timeRemaining must be a number, was ${timeRemaining}`)
    }

    function getErrorDetails() {
      const details = Cypress._.omit(
        Cypress._.merge({}, options, { now, timeRemaining }),
        // skip the following keys
        'log',
        'post',
        'error',
      )
      return Cypress._.toPairs(details)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
    }

    if (options.debugLog) {
      const details = getErrorDetails()
      cy.log(`cypress-recurse: ${details}`)
    }

    const logCommands = options.log === true

    if (options.limit < 1) {
      const err = Cypress._.isNil(options.error)
        ? 'Recursion limit reached'
        : options.error
      const details = getErrorDetails()
      return cy.log(`cypress-recurse: ${details}`).then(function () {
        throw new Error(err)
      })
    }
    if (logCommands) {
      cy.log(`remaining attempts **${options.limit}**`)
    }

    if (timeRemaining < 0) {
      const err = Cypress._.isNil(options.error)
        ? 'Max time limit reached'
        : options.error

      const details = getErrorDetails()
      return cy.log(`cypress-recurse: ${details}`).then(function () {
        throw new Error(err)
      })
    }
    if (logCommands) {
      cy.log(`time remaining **${timeRemaining}**`)
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
    return result.then(function cypressRecurse(x) {
      if (logCommands) {
        cy.log(x)
      } else if (typeof options.log === 'function') {
        options.log(x)
      }

      try {
        const predicateResult = checkFn(x)
        // treat truthy as success and stop the recursion
        if (
          Boolean(predicateResult) === true ||
          predicateResult === undefined
        ) {
          if (logCommands) {
            cy.log('**NICE!**')
          } else if (typeof options.log === 'string') {
            cy.log(options.log)
          }

          // always yield the result
          return cy.wrap(x, { log: false })
        }
      } catch (e) {
        // ignore the error, treat is as falsy predicate
      }

      const nextIteration = () => {
        // const finished = +new Date()
        // const elapsed = finished - options.started
        // console.log('elapsed', elapsed)
        return recurse(commandsFn, checkFn, {
          started: options.started,
          timeout: options.timeout,
          limit: options.limit - 1,
          iteration: options.iteration + 1,
          log: options.log,
          delay: options.delay,
          post: options.post,
          error: options.error,
          debugLog: options.debugLog,
        })
      }

      const delayStep =
        options.delay > 0 ? cy.wait(options.delay, { log: logCommands }) : cy

      const callPost = () => {
        const result = options.post({ limit: options.limit })
        return Cypress.isCy(result) ? result : cy
      }

      const postStep =
        typeof options.post === 'function'
          ? delayStep.then(callPost)
          : delayStep

      return postStep.then(nextIteration)
    })
  })
}

module.exports = {
  recurse,
  RecurseDefaults,
}
