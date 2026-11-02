

export async function fetchWithRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      const is429 = error.response?.status === 429
      const isLast = i === retries - 1

      if (!is429 || isLast) throw error

      const retryAfter = error.response?.headers['retry-after']
      const wait = retryAfter ? Number(retryAfter) * 1000 : delay * Math.pow(2, i)

      console.warn(`429 — retrying in ${wait}ms (attempt ${i + 1}/${retries})`)
      await new Promise(r => setTimeout(r, wait))
    }
  }
}