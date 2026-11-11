import { getCoverUrl } from '../api/booksApi'
import { STATUS_LABELS, type Book, type BookStatus } from '../types/book'

// Badge colours for each status
const STATUS_STYLES: Record<BookStatus, string> = {
  reading: 'bg-blue-100 text-blue-800',
  planned: 'bg-amber-100 text-amber-800',
  read: 'bg-green-100 text-green-800',
}

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const progress = Math.round((book.pagesRead / book.totalPages) * 100)

  return (
    <article className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Cover image, or a simple placeholder when the book has none */}
      {book.coverImage ? (
        <img
          src={getCoverUrl(book.coverImage)}
          alt={`Cover of ${book.title}`}
          className="h-32 w-22 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-32 w-22 shrink-0 items-center justify-center rounded bg-indigo-50 px-2 text-center text-xs text-indigo-400">
          No cover
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="truncate font-semibold" title={book.title}>
          {book.title}
        </h2>
        <p className="truncate text-sm text-gray-600" title={book.author}>
          {book.author}
        </p>

        <span
          className={`mt-2 w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[book.status]}`}
        >
          {STATUS_LABELS[book.status]}
        </span>

        {/* Reading progress */}
        <div className="mt-auto pt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {book.pagesRead} / {book.totalPages} pages
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-200">
            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {book.rating ? (
          <p className="mt-2 text-sm text-amber-500" aria-label={`Rating: ${book.rating} out of 5`}>
            {'★'.repeat(book.rating)}
            <span className="text-gray-300">{'★'.repeat(5 - book.rating)}</span>
          </p>
        ) : null}
      </div>
    </article>
  )
}
