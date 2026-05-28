import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SurahList from './pages/SurahList'
import Reader from './pages/Reader'
import Bookmarks from './pages/Bookmarks'
import Search from './pages/Search'
import Settings from './pages/Settings'
import Stats from './pages/Stats'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="quran" element={<SurahList />} />
        <Route path="quran/:surahId" element={<Reader />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="search" element={<Search />} />
        <Route path="settings" element={<Settings />} />
        <Route path="stats" element={<Stats />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
