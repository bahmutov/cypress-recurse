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
    Cypress._.defaults(options, RecurseDefaults, {
      started: +new Date(),
      ends: options.started + options.timeout,
      iteration: 1,
    })
    // console.log('options', options)
    const now = +new Date()
    const timeRemaining = options.started + options.timeout - now

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
          return
        }
      } catch (e) {
        // ignore the error, treat is as falsy predicate
      }

      const nextIteration = () => {
        const finished = +new Date()
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
