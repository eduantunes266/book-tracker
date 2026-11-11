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

// Automatic logout: if a request that carried a token gets 401, the token
// has expired or is invalid. Remove it and go to the login page.
// (A wrong password on login also returns 401, but that request has no token.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.headers?.Authorization
    ) {
      removeToken()
      window.location.assign('/login?expired=1') // full reload clears the page state
    }
    return Promise.reject(error)
  },
)

// Turns any request error into a message we can show to the user.
// The backend always answers errors as { "message": "..." }.
export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message

    // No response, or 502/503/504 from the Vite proxy = backend is down
    const status = error.response?.status
    if (!error.response || status === 502 || status === 503 || status === 504) {
      return 'Cannot reach the server. Is the backend running?'
    }
  }
  return 'Something went wrong. Please try again.'
}

export default api
