import { useEffect, useState } from 'react'
import { getBooks } from '../api/booksApi'
import { getErrorMessage } from '../api/client'
import BookCard from '../components/BookCard'
import { STATUS_LABELS, type Book, type BookStatus } from '../types/book'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [status, setStatus] = useState<BookStatus | ''>('') // '' = all statuses
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load the books again every time the status or the search text changes
  useEffect(() => {
    let ignore = false // becomes true if a newer request replaces this one

    // Wait 300 ms after the last change, so typing in the search box
    // does not send a request for every key press
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getBooks({ status, search })
        if (!ignore) setBooks(data)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setLoading(false)
      }
    }, 300)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [status, search])

  const hasFilters = status !== '' || search.trim() !== ''

  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">My books</h1>

      {/* Filters: stacked on mobile, side by side from "sm" up */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="search">
          Search by title or author
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:flex-1"
        />

        <label className="sr-only" htmlFor="status">
          Filter by status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as BookStatus | '')}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:w-48"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Content: error, loading, empty or the list */}
      <div className="mt-6">
        {error ? (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : loading ? (
          <p className="text-gray-500">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            {hasFilters ? 'No books match your filters.' : 'You have no books yet.'}
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-500">
              {books.length} {books.length === 1 ? 'book' : 'books'}
            </p>
            {/* grid-cols-1 lets cards shrink to the screen width on mobile */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
