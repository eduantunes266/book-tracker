import axios from 'axios'

const TOKEN_KEY = 'token'

// Helpers to keep the JWT in the browser's localStorage
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY)

// Axios instance used for every request to the backend.
// Without VITE_API_URL we use "/api", which the Vite proxy forwards to the backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Before each request, add "Authorization: Bearer <token>" if we have a token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
