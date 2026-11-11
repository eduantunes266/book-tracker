import api from './client'
import type { AuthResponse } from '../types/user'

// POST /api/auth/register
export const register = async (name: string, email: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
  return response.data
}

// POST /api/auth/login
export const login = async (email: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password })
  return response.data
}
