import { Link } from 'react-router-dom'
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
  onDelete: (book: Book) => void // the page asks for confirmation and deletes
}

export default function BookCard({ book, onDelete }: BookCardProps) {
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

        <div className="mt-3 flex gap-2">
          <Link
            to={`/books/${book._id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(book)}
            className="rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
