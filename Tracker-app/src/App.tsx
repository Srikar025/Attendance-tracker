import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { Login } from './pages/login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Track from './pages/Track'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import './App.css'

function App() {
  const { user, isLoading } = useAuth()

  // Show nothing while checking auth (ProtectedRoute handles its own loader)
  if (isLoading) return null

  return (
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
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/track" element={<ProtectedRoute><Track /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
