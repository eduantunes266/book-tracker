import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Shared page frame: navbar on top, current page below (<Outlet />)
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
