import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { BookOpen, Bookmark, Search, BarChart2, Flame, Target, Play } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [ayatOfDay, setAyatOfDay] = useState(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!user?.uid) return
    getDoc(doc(db, 'users', user.uid))
      .then(snap => { if (snap.exists()) setProfile(snap.data()) })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    // Deterministic ayat of the day based on calendar date
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((now - start) / 86400000)
    const surah = (dayOfYear % 114) + 1
    fetch(`https://api.alquran.cloud/v1/ayah/${surah}:1/editions/quran-uthmani,en.asad`)
      .then(r => r.json())
      .then(data => { if (data.data) setAyatOfDay(data.data) })
      .catch(() => {})
  }, [])

  const hour = time.getHours()
  const greeting = hour < 5 ? 'Assalamu Alaikum' : hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const quickLinks = [
    { icon: BookOpen, label: 'Full Quran', path: '/app/quran', color: 'var(--gold-500)' },
    { icon: Bookmark, label: 'Bookmarks', path: '/app/bookmarks', color: '#52b788' },
    { icon: Search, label: 'Search', path: '/app/search', color: '#74c0fc' },
    { icon: BarChart2, label: 'My Stats', path: '/app/stats', color: '#da77f2' },
  ]

  const todayRead = profile?.todayAyaatRead || 0
  const dailyGoal = profile?.dailyGoal || 10
  const progress = Math.min((todayRead / dailyGoal) * 100, 100)

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="heading" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', lineHeight: 1.3 }}>
          {greeting},<br />
          <span className="gold">{user?.displayName?.split(' ')[0] || 'Dear Reader'}</span> 👋
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

        {/* Continue Reading */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Continue Reading</div>
          <h3 className="heading" style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
            {profile?.lastReading ? `Surah ${profile.lastReading.surahName}` : 'Start your journey'}
          </h3>
          {profile?.lastReading && (
            <>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '14px' }}>
                Ayah {profile.lastReading.ayahNumber} of {profile.lastReading.totalAyahs}
              </p>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    background: 'linear-gradient(90deg, var(--green-500), var(--gold-500))',
                    width: `${Math.min((profile.lastReading.ayahNumber / profile.lastReading.totalAyahs) * 100, 100)}%`,
                  }} />
                </div>
              </div>
            </>
          )}
          <button className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: profile?.lastReading ? 0 : '16px' }}
            onClick={() => navigate(profile?.lastReading ? `/app/quran/${profile.lastReading.surahNumber}` : '/app/quran')}>
            <Play size={15} fill="currentColor" />
            {profile?.lastReading ? 'Continue' : 'Start Reading'}
          </button>
        </div>

        {/* Daily Goal */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={16} color="var(--gold-500)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Goal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--gold-500)" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--gold-500)' }}>{todayRead}</span>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>ayaat</span>
              </div>
            </div>
            <div>
              <div className="heading" style={{ fontSize: '1.5rem' }}>{todayRead}/{dailyGoal}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '6px' }}>ayaat today</div>
              <div style={{ color: progress >= 100 ? '#4caf50' : 'var(--text-muted)', fontSize: '0.78rem' }}>
                {progress >= 100 ? '✅ Goal achieved!' : `${dailyGoal - todayRead} more to go`}
              </div>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Flame size={16} color="#ff6b35" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Reading Streak</span>
          </div>
          <div className="heading" style={{ fontSize: '3rem', color: '#ff6b35', lineHeight: 1 }}>{profile?.streak || 0}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px', marginBottom: '14px' }}>
            {(profile?.streak || 0) >= 7 ? '🔥 On fire!' : (profile?.streak || 0) >= 3 ? '⚡ Keep going!' : 'days in a row'}
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{
                flex: 1, height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem',
                background: i < (profile?.streak || 0) % 7 ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i < (profile?.streak || 0) % 7 ? 'rgba(255,107,53,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: i < (profile?.streak || 0) % 7 ? '#ff6b35' : 'var(--text-muted)',
              }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </div>
            ))}
          </div>
        </div>

        {/* Ayat of the Day */}
        {ayatOfDay && (
          <div className="glass" style={{ padding: '28px', gridColumn: '1 / -1', borderColor: 'rgba(201,168,76,0.2)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--gold-500)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>✦ Ayat of the Day</div>
            <div className="arabic" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'right', lineHeight: 2.2 }}>
              {ayatOfDay[0]?.text}
            </div>
            <div style={{ height: '1px', background: 'rgba(201,168,76,0.1)', marginBottom: '14px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.8, fontStyle: 'italic' }}>
              "{ayatOfDay[1]?.text}"
            </p>
            <div style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              — {ayatOfDay[0]?.surah?.englishName}, Ayah {ayatOfDay[0]?.numberInSurah}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ gridColumn: '1 / -1' }}>
          <h3 className="heading" style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-secondary)' }}>Quick Access</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {quickLinks.map(({ icon: Icon, label, path, color }) => (
              <button key={path} onClick={() => navigate(path)} style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)',
                padding: '18px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '10px', color: 'var(--text-primary)', transition: 'all 0.2s', backdropFilter: 'blur(12px)',
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.borderColor = color }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}>
                <Icon size={22} color={color} />
                <span style={{ fontSize: '0.82rem', fontWeight: '500' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
