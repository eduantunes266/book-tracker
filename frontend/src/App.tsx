import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import BookFormPage from './pages/BookFormPage'
import BooksPage from './pages/BooksPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page uses the Layout (navbar + content) */}
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Pages inside ProtectedRoute need a token */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<BooksPage />} />
            {/* Same page for add and edit; the keys make React start a fresh
                form when switching between the two routes */}
            <Route path="/books/new" element={<BookFormPage key="new" />} />
            <Route path="/books/:id/edit" element={<BookFormPage key="edit" />} />
          </Route>

          {/* Unknown URL -> home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
