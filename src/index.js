// @ts-check

/** @type {import('./index').RecurseOptions} */
const RecurseDefaults = {
  limit: 20,
  timeout: Cypress.config('defaultCommandTimeout'),
  log: true,
  delay: Cypress.config('defaultCommandTimeout') / 5,
  reduce: undefined,
  reduceFrom: undefined,
  reduceLastValue: false,
  yield: 'value',
}
/**
 *
 * @param {() => Cypress.Chainable<T>} commandsFn
 * @param {(x: T) => boolean | void | Chai.Assertion} checkFn
 * @param {Partial<RecurseOptions<T>>} options
 *
 * @returns {Cypress.Chainable<T>}
 */

/**
 * @template T
 * @typedef {import('./index').RecurseOptions<T>} RecurseOptions<T>
 * @typedef {import('./index').recurse<T>} RecurseFn<T>
 */

/**
 * @template T
 * @type {RecurseFn<T>}
 *
 * @param {() => Cypress.Chainable<Promise<T>>} commandsFn
 * @param {(x: T) => boolean | void | Chai.Assertion} checkFn
 * @param {Partial<RecurseOptions<T>>} options
 *
 * @returns {Cypress.Chainable<T>}
 *
 */
function recurse(commandsFn, checkFn, options = {}) {
  return cy.then(function cypressRecurse() {
    const now = +new Date()
    const timeout = options.timeout || RecurseDefaults.timeout

    if (!Cypress._.isNumber(timeout)) {
      throw new Error(`timeout must be a number, was ${timeout}`)
    }

    if ('yield' in options && typeof options.yield !== 'undefined') {
      if (!['value', 'reduced', 'both'].includes(options.yield)) {
        throw new Error(
          `yield must be either 'value' or 'reduced' or 'both', was ${options.yield}`,
        )
      }
    }

    // make sure not to modify the passed in options
    options = Cypress._.clone(options)
    Cypress._.defaults(options, RecurseDefaults, {
      // set the started time if not set
      started: now,
      // and calculate the end time if not set
      ends: now + timeout,
      iteration: 1,
      reduce: Cypress._.noop,
    })
    // console.log('options', options)

    const timeRemaining = options.started + options.timeout - now
    if (!Cypress._.isFinite(timeRemaining)) {
      throw new Error(
        `timeRemaining must be a number, was ${timeRemaining}`,
      )
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

    return result.then(
      /** @param {T} x */
      // @ts-ignore
      function cypressRecurse(x) {
        if (logCommands) {
          // @ts-ignore
          cy.log(x)
        } else if (typeof options.log === 'function') {
          // @ts-ignore
          options.log(x)
        }

        try {
          // @ts-ignore
          const predicateResult = checkFn(x, options.reduceFrom)
          // treat truthy as success and stop the recursion
          if (
            Boolean(predicateResult) === true ||
            predicateResult === undefined
          ) {
            return cy
              .then(() => {
                if (options.reduceLastValue) {
                  const newAcc = options.reduce(options.reduceFrom, x)
                  if (typeof newAcc !== 'undefined') {
                    if (Cypress.isCy(newAcc)) {
                      return newAcc.then((yieldedAcc) => {
                        if (typeof yieldedAcc !== 'undefined') {
                          options.reduceFrom = yieldedAcc
                        }
                      })
                    } else {
                      options.reduceFrom = newAcc
                    }
                  }
                }
              })
              .then(() => {
                if (logCommands) {
                  cy.log('**NICE!**')
                } else if (typeof options.log === 'string') {
                  cy.log(options.log)
                }

                // decide what to yield to the next command
                if (
                  typeof options.yield === 'undefined' ||
                  options.yield === 'value'
                ) {
                  // always yield the result, BUT
                  // by default, cy.wrap expected jQuery object to exist
                  // we can disable the built-in element existence check
                  // by attaching our own no-op should callback
                  // https://github.com/bahmutov/cypress-recurse/issues/75
                  return cy
                    .wrap(x, { log: false })
                    .should(Cypress._.noop)
                } else if (options.yield === 'reduced') {
                  return cy.wrap(options.reduceFrom, { log: false })
                } else if (options.yield === 'both') {
                  return cy.wrap(
                    { value: x, reduced: options.reduceFrom },
                    { log: false },
                  )
                } else {
                  throw new Error(
                    `cypress-reduce can resolve with the last value or reduced value, you passed ${options.yield}`,
                  )
                }
              })
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
            reduce: options.reduce,
            reduceFrom: options.reduceFrom,
            reduceLastValue: options.reduceLastValue,
            yield: options.yield,
          })
        }

        const reduceStep =
          typeof options.reduce === 'function'
            ? cy.then(() => {
                const newAccumulator = options.reduce(
                  options.reduceFrom,
                  x,
                )
                if (typeof newAccumulator !== 'undefined') {
                  if (Cypress.isCy(newAccumulator)) {
                    return newAccumulator.then(
                      (yieldedAccumulator) => {
                        if (
                          typeof yieldedAccumulator !== 'undefined'
                        ) {
                          options.reduceFrom = yieldedAccumulator
                          return yieldedAccumulator
                        }
                      },
                    )
                  } else {
                    options.reduceFrom = newAccumulator
                  }
                }
              })
            : cy

        return reduceStep
          .then(() => {
            if (options.delay > 0) {
              cy.wait(options.delay, { log: logCommands })
            }
          })
          .then(() => {
            if (typeof options.post === 'function') {
              const elapsed = +new Date() - options.started
              const result = options.post({
                limit: options.limit,
                value: x,
                reduced: options.reduceFrom,
                elapsed,
              })
              return Cypress.isCy(result) ? result : cy
            }
          })
          .then(nextIteration)
      },
    )
  })
}

/**
 * Iterates over every value in the previous subject until the predicate
 * function returns true.
 */
function each(commands, stopWhen) {
  if (!stopWhen) {
    stopWhen = () => false
  }
  return function ($elements) {
    const els = Cypress.dom.isJquery($elements)
      ? $elements.toArray()
      : $elements

    const returnValues = []

    function nextStep(remainingEls) {
      const item = remainingEls[0]

      return cy
        .then(() => {
          return commands(item)
        })
        .then((value) => {
          if (typeof value === 'undefined') {
            value = item
          }
          if (!stopWhen(value)) {
            returnValues.push(value)
            if (remainingEls.length > 1) {
              return nextStep(remainingEls.slice(1))
            }
          }
        })
    }

    return nextStep(els).then(() => {
      return returnValues
    })
  }
}

module.exports = {
  recurse,
  RecurseDefaults,
  each,
}
