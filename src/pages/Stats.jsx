import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Flame, BookOpen, Target, Award } from 'lucide-react'

const BADGES = [
  { id: 'first_ayah', icon: '🌟', label: 'First Ayah', desc: 'Read your first ayah', req: a => a >= 1 },
  { id: 'ten_ayahs', icon: '📖', label: '10 Ayaat', desc: 'Read 10 ayaat total', req: a => a >= 10 },
  { id: 'hundred', icon: '💫', label: '100 Ayaat', desc: 'Read 100 ayaat total', req: a => a >= 100 },
  { id: 'streak_3', icon: '🔥', label: '3-Day Streak', desc: '3 days in a row', req: (a, s) => s >= 3 },
  { id: 'streak_7', icon: '⚡', label: 'Week Warrior', desc: '7 days in a row', req: (a, s) => s >= 7 },
  { id: 'streak_30', icon: '🏆', label: 'Monthly Master', desc: '30 days streak', req: (a, s) => s >= 30 },
]

export default function Stats() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data())
      })
    }
  }, [user])

  const total = profile?.totalAyaatRead || 0
  const streak = profile?.streak || 0
  const bookmarks = profile?.bookmarks?.length || 0
  const goal = profile?.dailyGoal || 10
  const todayRead = profile?.todayAyaatRead || 0

  const stats = [
    { icon: BookOpen, label: 'Total Ayaat Read', value: total, color: 'var(--gold-500)' },
    { icon: Flame, label: 'Current Streak', value: `${streak} days`, color: '#ff6b35' },
    { icon: Target, label: 'Daily Goal', value: `${todayRead}/${goal}`, color: '#52b788' },
    { icon: Award, label: 'Bookmarks', value: bookmarks, color: '#74c0fc' },
  ]

  // Mock weekly data (in real app, store daily reads in Firestore)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekData = [8, 15, 5, 20, 12, 0, todayRead]
  const maxVal = Math.max(...weekData, 1)

  return (
    <div className="page fade-in">
      <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '8px' }}>My <span className="gold">Statistics</span></h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>Track your Quran reading journey</p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass" style={{ padding: '20px', textAlign: 'center' }}>
            <Icon size={24} color={color} style={{ marginBottom: '10px' }} />
            <div className="heading" style={{ fontSize: '1.8rem', color, marginBottom: '4px' }}>{value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
          This Week's Reading
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
          {weekDays.map((day, i) => {
            const pct = (weekData[i] / maxVal) * 100
            return (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--gold-500)' }}>{weekData[i] > 0 ? weekData[i] : ''}</div>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${Math.max(pct, 4)}%`,
                  background: i === 6 ? 'linear-gradient(180deg, var(--gold-500), var(--gold-700))' : 'rgba(201,168,76,0.25)',
                  transition: 'height 0.5s ease',
                }} />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Juz progress */}
      <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Juz Progress (30 Juz)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
          {[...Array(30)].map((_, i) => {
            const done = i < Math.floor(total / 200)
            return (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${done ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
                fontSize: '0.65rem', color: done ? 'var(--gold-500)' : 'var(--text-muted)',
                fontWeight: done ? '600' : '400',
              }}>
                {i + 1}
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {Math.floor(total / 200)} of 30 Juz completed
        </div>
      </div>

      {/* Badges */}
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Achievements
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {BADGES.map(badge => {
            const earned = badge.req(total, streak)
            return (
              <div key={badge.id} style={{
                padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center',
                background: earned ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${earned ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.05)'}`,
                opacity: earned ? 1 : 0.4, transition: 'all 0.3s',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px', filter: earned ? 'none' : 'grayscale(100%)' }}>{badge.icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '500', color: earned ? 'var(--gold-300)' : 'var(--text-muted)', marginBottom: '4px' }}>{badge.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{badge.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
