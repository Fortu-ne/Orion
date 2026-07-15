// lib/memoryStore.mjs
// Single-instance replacements for what Redis was doing.
// Trade-off (deliberate): state lives in this process's RAM.
// - Restart wipes it → the scheduler re-warms everything on boot.
// - Would NOT work across multiple instances → we run exactly one.

// ── TTL cache ────────────────────────────────────────────────────────
// Map of key → { value, expires }. Lazy expiry: entries are checked
// on read, and a sweeper clears anything untouched every 10 minutes
// so the Map can't grow unbounded.
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

// ── Bounded queue for the ISS trail ─────────────────────────────────
// A queue in the strict sense: enqueue at the back, evict from the
// front when capacity is reached (FIFO). Replaces LPUSH + LTRIM.
class BoundedQueue {
  #items = []
  #capacity

  constructor(capacity) {
    this.#capacity = capacity
  }

  enqueue(item) {
    this.#items.push(item)
    if (this.#items.length > this.#capacity) {
      this.#items.shift() // evict oldest
    }
  }

  // Returns a copy, oldest-first — the order the map draws in.
  toArray() {
    return [...this.#items]
  }

  get length() {
    return this.#items.length
  }
}

export const issTrail = new BoundedQueue(60)
