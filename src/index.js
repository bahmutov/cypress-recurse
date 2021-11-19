// @ts-check

/** @type {import('./index').RecurseOptions} */
const RecurseDefaults = {
  limit: 30,
  timeout: Cypress.config('defaultCommandTimeout'),
  log: true,
  delay: 0,
}

/**
 * @type {import('./index').RecurseFn}
 */
function recurse(commandsFn, checkFn, options = {}) {
  Cypress._.defaults(options, RecurseDefaults)
  const started = +new Date()

  const logCommands = options.log === true

  if (options.limit < 0) {
    const err = options.error ?? 'Recursion limit reached';
    throw new Error(err);
  }
  if (logCommands) {
    cy.log(`remaining attempts **${options.limit}**`)
  }

  if (options.timeout < 0) {
    const err = options.error ?? 'Max time limit reached';
    throw new Error(err);
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
        error: options.error
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
