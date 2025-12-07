import { StoredBook } from '../types'

const DB_NAME = 'LuminaReaderDB'
const DB_VERSION = 1
const STORE_NAME = 'books'

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result)
    }

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

export const saveBookToStorage = async (book: StoredBook): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(book)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getAllBooks = async (): Promise<StoredBook[]> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    // Use cursor or getAll. getAll is simpler for reasonable amounts of data.
    // Note: If users store 100s of books, we might want to only fetch metadata (exclude 'data' blob)
    // using a cursor, but for this demo, fetching all is fine.
    const request = store.getAll()

    request.onsuccess = () => {
      const books = request.result as StoredBook[]
      // Sort by lastRead descending
      books.sort((a, b) => b.lastRead - a.lastRead)
      resolve(books)
    }
    request.onerror = () => reject(request.error)
  })
}

export const getBookById = async (
  id: string,
): Promise<StoredBook | undefined> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const updateBookProgress = async (
  id: string,
  cfi: string,
  percentage: number,
): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const book = getRequest.result as StoredBook
      if (book) {
        book.progressCfi = cfi
        book.progressPercent = percentage
        book.lastRead = Date.now()
        store.put(book)
        resolve()
      } else {
        reject(new Error('Book not found'))
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

export const deleteBookFromStorage = async (id: string): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
