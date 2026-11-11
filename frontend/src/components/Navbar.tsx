import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getToken, removeToken } from '../api/client'

export default function Navbar() {
  const navigate = useNavigate()
  // Using the location makes the navbar re-render on every page change,
  // so the logout button shows/hides right after logging in or out.
  useLocation()
  const isLoggedIn = Boolean(getToken())

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600">
          ShelfLog
        </Link>

        {isLoggedIn && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Log out
          </button>
        )}
      </nav>
    </header>
  )
}
