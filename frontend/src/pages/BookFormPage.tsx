import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createBook, getBook, getCoverUrl, updateBook } from '../api/booksApi'
import { getErrorMessage } from '../api/client'
import FormField from '../components/FormField'
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/formStyles'
import { STATUS_LABELS, type BookInput, type BookStatus } from '../types/book'

// Same rules as the backend (middleware/upload.ts)
const MAX_COVER_SIZE = 5 * 1024 * 1024 // 5 MB
const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Used for both /books/new (add) and /books/:id/edit (edit)
export default function BookFormPage() {
  const { id } = useParams() // only exists on /books/:id/edit
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  // Form fields. Numbers are kept as text while typing (an input can be empty).
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [pagesRead, setPagesRead] = useState('0')
  const [status, setStatus] = useState<BookStatus>('planned')
  const [rating, setRating] = useState('') // '' = no rating
  const [notes, setNotes] = useState('')

  // Cover: the new file chosen, its preview URL and the cover already saved
  const [cover, setCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [currentCover, setCurrentCover] = useState('')

  const [loading, setLoading] = useState(isEdit) // loading the book to edit
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Edit mode: load the book and fill the form with its values
  useEffect(() => {
    if (!id) return
    let ignore = false

    getBook(id)
      .then((book) => {
        if (ignore) return
        setTitle(book.title)
        setAuthor(book.author)
        setTotalPages(String(book.totalPages))
        setPagesRead(String(book.pagesRead))
        setStatus(book.status)
        setRating(book.rating ? String(book.rating) : '')
        setNotes(book.notes)
        setCurrentCover(book.coverImage ?? '')
      })
      .catch((err) => {
        if (!ignore) setLoadError(getErrorMessage(err))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id])

  // Free the memory used by the preview URL when it changes or the page closes
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setError('')

    // Check the file here too, so the user gets the message before uploading
    let fileError = ''
    if (file && !COVER_TYPES.includes(file.type)) {
      fileError = 'The cover must be a JPG, PNG, WEBP or GIF image.'
    } else if (file && file.size > MAX_COVER_SIZE) {
      fileError = 'The cover image must be at most 5 MB.'
    }

    if (fileError) {
      setError(fileError)
      event.target.value = '' // clear the file input
      setCover(null)
      setCoverPreview('')
      return
    }

    setCover(file)
    setCoverPreview(file ? URL.createObjectURL(file) : '')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    const data: BookInput = {
      title,
      author,
      totalPages: Number(totalPages),
      pagesRead: Number(pagesRead || 0),
      status,
      rating: rating ? Number(rating) : null, // null = no rating
      notes,
    }

    try {
      if (id) {
        await updateBook(id, data, cover ?? undefined)
      } else {
        await createBook(data, cover ?? undefined)
      }
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading book...</p>
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">
          Back to my books
        </Link>
      </div>
    )
  }

  // New file preview first, otherwise the cover that is already saved
  const shownCover = coverPreview || (currentCover ? getCoverUrl(currentCover) : '')

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit book' : 'Add book'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          id="title"
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FormField
          id="author"
          label="Author"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        {/* Two columns from "sm" up, one column on mobile */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="totalPages"
            label="Total pages"
            type="number"
            min={1}
            required
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
          />
          <FormField
            id="pagesRead"
            label="Pages read"
            type="number"
            min={0}
            max={totalPages || undefined}
            value={pagesRead}
            onChange={(e) => setPagesRead(e.target.value)}
          />

          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
              className={inputClass}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rating" className={labelClass}>
              Rating
            </label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={inputClass}
            >
              <option value="">No rating</option>
              {[1, 2, 3, 4, 5].map((stars) => (
                <option key={stars} value={stars}>
                  {'★'.repeat(stars)} ({stars})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="cover" className={labelClass}>
            Cover image (optional, JPG/PNG/WEBP/GIF, max 5 MB)
          </label>
          <div className="flex items-center gap-4">
            {shownCover && (
              <img
                src={shownCover}
                alt="Cover preview"
                className="h-24 w-16 shrink-0 rounded object-cover"
              />
            )}
            <input
              id="cover"
              type="file"
              accept={COVER_TYPES.join(',')}
              onChange={handleCoverChange}
              className="block w-full min-w-0 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Buttons: full width and stacked on mobile, side by side from "sm" up */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link to="/" className={`${secondaryButtonClass} text-center`}>
            Cancel
          </Link>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add book'}
          </button>
        </div>
      </form>
    </div>
  )
}
