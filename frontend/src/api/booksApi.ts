import api from './client'
import type { Book, BookInput, BookStatus } from '../types/book'

export interface BookFilters {
  status?: BookStatus | ''
  search?: string
}

// Books are sent as multipart/form-data so an optional cover image can go
// in the same request. FormData only holds text, so numbers become strings
// (the backend converts them back) and null becomes "" (= remove rating).
const toFormData = (data: Partial<BookInput>, cover?: File) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value === null ? '' : String(value))
    }
  })
  if (cover) {
    formData.append('cover', cover)
  }
  return formData
}

// GET /api/books?status=...&search=...
export const getBooks = async (filters: BookFilters = {}) => {
  const params: Record<string, string> = {}
  if (filters.status) params.status = filters.status
  if (filters.search?.trim()) params.search = filters.search.trim()

  const response = await api.get<Book[]>('/books', { params })
  return response.data
}

// GET /api/books/:id
export const getBook = async (id: string) => {
  const response = await api.get<Book>(`/books/${id}`)
  return response.data
}

// POST /api/books (optional cover image)
export const createBook = async (data: BookInput, cover?: File) => {
  const response = await api.post<Book>('/books', toFormData(data, cover))
  return response.data
}

// PUT /api/books/:id (only the fields sent are changed; optional new cover)
export const updateBook = async (id: string, data: Partial<BookInput>, cover?: File) => {
  const response = await api.put<Book>(`/books/${id}`, toFormData(data, cover))
  return response.data
}

// DELETE /api/books/:id
export const deleteBook = async (id: string) => {
  const response = await api.delete<{ message: string }>(`/books/${id}`)
  return response.data
}

// URL of a cover image served by the backend (GET /uploads/<file name>)
export const getCoverUrl = (coverImage: string) => `/uploads/${coverImage}`
