// User as returned by the backend (the password hash is never sent)
export interface User {
  id: string
  name: string
  email: string
}

// Response of POST /api/auth/register and POST /api/auth/login
export interface AuthResponse {
  token: string
  user: User
}
