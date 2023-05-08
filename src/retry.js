function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const DEFAULT_RETRY_OPTIONS = {
  attempts: 1,
  limit: 100,
  delay: 100,
  log: false,
}

/**
 * Retry the given function `fn` (could be asynchronous)
 * up to the limit number of attempts with time delays between attempts.
 * @param {Partial<typeof DEFAULT_RETRY_OPTIONS>} options
 */
async function retry(fn, predicate, options = DEFAULT_RETRY_OPTIONS) {
  const mergedOptions = { ...DEFAULT_RETRY_OPTIONS, ...options }

  const n = await fn()
  const satisfied = Boolean(predicate(n))

  if (mergedOptions.log) {
    console.log(
      'attempt %d of %d was %s',
      mergedOptions.attempts,
      mergedOptions.attempts + mergedOptions.limit - 1,
      satisfied ? '✅' : '🚨',
    )
  }

  if (satisfied) {
    return n
  }

  if (mergedOptions.limit === 1) {
    throw new Error('Max number of allowed iterations reached')
  }

  await sleep(mergedOptions.delay)

  return retry(fn, predicate, {
    ...mergedOptions,
    attempts: mergedOptions.attempts + 1,
    limit: mergedOptions.limit - 1,
  })
}

module.exports = { sleep, DEFAULT_RETRY_OPTIONS, retry }
