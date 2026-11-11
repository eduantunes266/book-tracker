export type BookStatus = 'read' | 'reading' | 'planned'

// Book as returned by the backend (same fields as the Mongoose model)
export interface Book {
  _id: string
  userId: string
  title: string
  author: string
  totalPages: number
  pagesRead: number
  status: BookStatus
  rating?: number | null // 1-5, null or missing = not rated
  notes: string
  coverImage?: string // file name inside /uploads
  createdAt: string
  updatedAt: string
}

// Fields we send when creating or updating a book
export interface BookInput {
  title: string
  author: string
  totalPages: number
  pagesRead?: number
  status?: BookStatus
  rating?: number | null // null removes the rating
  notes?: string
}
