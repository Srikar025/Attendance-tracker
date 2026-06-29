import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

// Lazy-load all page components — Vite will split each into its own chunk.
// This reduces the initial JS bundle size and improves first-paint time.
const Login    = lazy(() => import('./pages/login').then(m => ({ default: m.Login })))
const Signup   = lazy(() => import('./pages/Signup'))
const Home     = lazy(() => import('./pages/Home'))
const Track    = lazy(() => import('./pages/Track'))
const Profile  = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))

// Minimal inline fallback — keeps the dark background during chunk load so
// there's no white flash. The SkeletonLoader / DashboardSkeleton components
// are page-specific and will render as soon as their chunk arrives.
const PageFallback = () => (
  <div className="min-h-screen bg-[#0a0d14]" />
)

function App() {
  const { user, isLoading } = useAuth()

  // Show nothing while checking auth (ProtectedRoute handles its own loader)
  if (isLoading) return null

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public routes — redirect if already logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />

        {/* Protected routes */}
        <Route path="/"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/track"   element={<ProtectedRoute><Track /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
