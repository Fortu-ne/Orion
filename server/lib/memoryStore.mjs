
class MemoryCache {
  #store = new Map()

  set(key, value, ttlSeconds) {
    this.#store.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  get(key) {
    const entry = this.#store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expires) {
      this.#store.delete(key)
      return null
    }
    return entry.value
  }

  sweep() {
    const now = Date.now()
    for (const [key, entry] of this.#store) {
      if (now > entry.expires) this.#store.delete(key)
    }
  }
}

export const memoryCache = new MemoryCache()
setInterval(() => memoryCache.sweep(), 10 * 60 * 1000).unref()


class BoundedQueue {
  #items = []
  #capacity

  constructor(capacity) {
    this.#capacity = capacity
  }

  enqueue(item) {
    this.#items.push(item)
    if (this.#items.length > this.#capacity) {
      this.#items.shift() 
    }
  }

 
  toArray() {
    return [...this.#items]
  }

  get length() {
    return this.#items.length
  }
}

export const issTrail = new BoundedQueue(60)
