function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const DEFAULT_RETRY_OPTIONS = {
  limit: 100,
  delay: 100,
}

async function retry(fn, predicate, options = DEFAULT_RETRY_OPTIONS) {
  const mergedOptions = { ...DEFAULT_RETRY_OPTIONS, ...options }

  const n = await fn()
  if (predicate(n)) {
    return n
  }

  if (mergedOptions.limit === 1) {
    throw new Error('Max number of allowed iterations reached')
  }

  await sleep(mergedOptions.delay)

  return retry(fn, predicate, {
    ...mergedOptions,
    limit: mergedOptions.limit - 1,
  })
}

module.exports = { sleep, DEFAULT_RETRY_OPTIONS, retry }
