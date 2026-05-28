import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Home, Search, Bookmark, Settings, BarChart2, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/quran', icon: BookOpen, label: 'Quran' },
  { to: '/app/search', icon: Search, label: 'Search' },
  { to: '/app/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/app/stats', icon: BarChart2, label: 'Stats' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: '240px',
        background: 'rgba(10,31,20,0.95)',
        borderRight: '1px solid rgba(201,168,76,0.1)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
      }} className="desktop-sidebar">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px', padding: '16px 0' }}>
          <div style={{ fontSize: '2rem', fontFamily: 'Amiri, serif', color: 'var(--gold-500)', marginBottom: '4px' }}>النور</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Al-Noor</div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--gold-500)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400',
              transition: 'all 0.2s ease',
            })}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green-600), var(--gold-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: '600', color: 'white', flexShrink: 0
            }}>
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px', background: 'transparent',
            border: '1px solid rgba(255,100,100,0.2)', borderRadius: 'var(--radius-sm)',
            color: '#ff6b6b', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
          }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '240px', minHeight: '100vh' }} className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,31,20,0.98)',
        borderTop: '1px solid rgba(201,168,76,0.15)',
        display: 'none', justifyContent: 'space-around', alignItems: 'center',
        padding: '10px 0 16px', backdropFilter: 'blur(20px)',
        zIndex: 200,
      }} className="mobile-nav">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            color: isActive ? 'var(--gold-500)' : 'var(--text-muted)',
            textDecoration: 'none', fontSize: '0.65rem', padding: '4px 12px',
          })}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
