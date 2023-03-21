/**
 * Formats relevant details from the error message
 * and the current iteration details.
 * @param {string} message The first line in the error message
 * @param {object} options Object with keys to be serialized
 */
function getErrorDetails(message, options) {
  const details = Cypress._.pick(
    options,
    // pick only relevant keys
    ['iteration', 'timeout', 'delay', 'yield'],
  )
  // the original user-defined iteration limit
  if ('initialLimit' in options) {
    details.limit = options.initialLimit
  }
  if (options.started) {
    const elapsed = (options.now || +new Date()) - options.started // ms
    details.elapsed = elapsed
  }
  const s = Cypress._.toPairs(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
  return message + '\n\n' + s
}

module.exports = { getErrorDetails }
