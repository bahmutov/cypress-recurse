function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function retry(fn, predicate, limit = 100) {
  const n = await fn()
  if (predicate(n)) {
    return n
  }

  if (limit === 1) {
    throw new Error('Max number of allowed iterations reached')
  }

  await sleep(1000)

  return retry(fn, predicate, limit - 1)
}
