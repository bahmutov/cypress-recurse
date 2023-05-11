function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const identity = (x) => x

const DEFAULT_RETRY_OPTIONS = {
  attempts: 1,
  limit: 100,
  delay: 100,
  log: false,
  extract: identity,
}

/**
 * Retry the given function `fn` (could be asynchronous)
 * up to the limit number of attempts with time delays between attempts.
 * @param {Partial<typeof DEFAULT_RETRY_OPTIONS>} options
 */
async function retry(fn, predicate, options = DEFAULT_RETRY_OPTIONS) {
  const mergedOptions = { ...DEFAULT_RETRY_OPTIONS, ...options }

  const result = await fn()
  const satisfied = Boolean(predicate(result))

  const limit = mergedOptions.attempts + mergedOptions.limit - 1
  if (mergedOptions.log === true) {
    console.log(
      'attempt %d of %d was %s',
      mergedOptions.attempts,
      limit,
      satisfied ? '✅' : '🚨',
    )
  } else if (typeof mergedOptions.log === 'function') {
    mergedOptions.log({
      attempt: mergedOptions.attempts,
      limit,
      value: result,
      successful: satisfied,
    })
  }

  if (satisfied) {
    if (typeof options.extract === 'function') {
      const finalResult = await options.extract(result)
      return finalResult
    } else {
      return result
    }
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
