/**
 * IndexedDB cache for deck data
 * Caches full deck objects including moxfield_data to prevent re-fetching
 */

const DB_NAME = 'defcat-deck-cache'
const DB_VERSION = 1
const DECK_STORE = 'decks'
const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

interface CachedDeck<T = any> {
  id: string
  data: T
  timestamp: number
  version: number
}

class DeckCache {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available'))
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create deck store if it doesn't exist
        if (!db.objectStoreNames.contains(DECK_STORE)) {
          const store = db.createObjectStore(DECK_STORE, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  async get<T = any>(id: string): Promise<T | null> {
    try {
      await this.init()
      if (!this.db) return null

      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction(DECK_STORE, 'readonly')
        const store = transaction.objectStore(DECK_STORE)
        const request = store.get(id)

        request.onsuccess = () => {
          const cached = request.result as CachedDeck<T> | undefined

          if (!cached) {
            resolve(null)
            return
          }

          // Check if cache is expired
          const now = Date.now()
          if (now - cached.timestamp > CACHE_DURATION) {
            // Delete expired entry
            this.delete(id).catch(console.error)
            resolve(null)
            return
          }

          resolve(cached.data)
        }

        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB get error:', error)
      return null
    }
  }

  async set<T = any>(id: string, data: T): Promise<void> {
    try {
      await this.init()
      if (!this.db) return

      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction(DECK_STORE, 'readwrite')
        const store = transaction.objectStore(DECK_STORE)

        const cached: CachedDeck<T> = {
          id,
          data,
          timestamp: Date.now(),
          version: DB_VERSION,
        }

        const request = store.put(cached)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB set error:', error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.init()
      if (!this.db) return

      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction(DECK_STORE, 'readwrite')
        const store = transaction.objectStore(DECK_STORE)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB delete error:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      await this.init()
      if (!this.db) return

      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction(DECK_STORE, 'readwrite')
        const store = transaction.objectStore(DECK_STORE)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('IndexedDB clear error:', error)
    }
  }

  async cleanExpired(): Promise<void> {
    try {
      await this.init()
      if (!this.db) return

      const now = Date.now()
      const transaction = this.db.transaction(DECK_STORE, 'readwrite')
      const store = transaction.objectStore(DECK_STORE)
      const index = store.index('timestamp')
      const request = index.openCursor()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
        if (cursor) {
          const cached = cursor.value as CachedDeck
          if (now - cached.timestamp > CACHE_DURATION) {
            cursor.delete()
          }
          cursor.continue()
        }
      }
    } catch (error) {
      console.error('IndexedDB cleanExpired error:', error)
    }
  }
}

export const deckCache = new DeckCache()

// Clean expired entries on load
if (typeof window !== 'undefined') {
  deckCache.cleanExpired().catch(console.error)
}
