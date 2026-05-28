import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import { Bookmark, Trash2, Play, ArrowRight } from 'lucide-react'
import { getAudioUrl, RECITERS } from '../utils/quranApi'

export default function Bookmarks() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState([])
  const [ayaatData, setAyaatData] = useState({})
  const [loading, setLoading] = useState(true)
  const [playingKey, setPlayingKey] = useState(null)
  const audioRef = useState(() => new Audio())[0]

  useEffect(() => {
    if (!user?.uid) return
    getDoc(doc(db, 'users', user.uid)).then(async snap => {
      const bms = snap.data()?.bookmarks || []
      setBookmarks(bms)

      // Fetch ayat data for each bookmark
      const fetched = {}
      await Promise.all(bms.map(async key => {
        const [surah, ayah] = key.split(':')
        try {
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${key}/editions/quran-uthmani,en.asad`)
          const data = await res.json()
          fetched[key] = data.data
        } catch {}
      }))
      setAyaatData(fetched)
      setLoading(false)
    })
  }, [user])

  const removeBookmark = async (key) => {
    await updateDoc(doc(db, 'users', user.uid), { bookmarks: arrayRemove(key) })
    setBookmarks(prev => prev.filter(b => b !== key))
  }

  const togglePlay = (key) => {
    const [surah, ayah] = key.split(':')
    if (playingKey === key) {
      audioRef.pause()
      setPlayingKey(null)
    } else {
      audioRef.src = getAudioUrl(surah, ayah, RECITERS[0].id)
      audioRef.play().catch(() => {})
      audioRef.onended = () => setPlayingKey(null)
      setPlayingKey(key)
    }
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: 'var(--gold-500)' }}>﷽</div>
        <div style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading bookmarks...</div>
      </div>
    </div>
  )

  return (
    <div className="page fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Bookmark size={22} color="var(--gold-500)" />
        <h1 className="heading" style={{ fontSize: '2rem' }}>My <span className="gold">Bookmarks</span></h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>
        {bookmarks.length} saved ayaat
      </p>

      {bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.3 }}>🔖</div>
          <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>No bookmarks yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start reading and bookmark your favourite ayaat</p>
          <button className="btn-gold" onClick={() => navigate('/app/quran')}>Start Reading</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookmarks.map(key => {
            const ayahs = ayaatData[key]
            const arabic = ayahs?.[0]
            const english = ayahs?.[1]
            const [surah, ayah] = key.split(':')
            const isPlaying = playingKey === key

            return (
              <div key={key} className="glass" style={{ padding: '20px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem',
                      background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                      color: 'var(--gold-500)'
                    }}>
                      {arabic?.surah?.englishName || `Surah ${surah}`} · Ayah {ayah}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => togglePlay(key)} style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: `1px solid ${isPlaying ? 'var(--gold-500)' : 'rgba(201,168,76,0.2)'}`,
                      background: isPlaying ? 'rgba(201,168,76,0.12)' : 'transparent',
                      color: 'var(--gold-500)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Play size={13} fill={isPlaying ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => navigate(`/app/quran/${surah}`)} style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <ArrowRight size={13} />
                    </button>
                    <button onClick={() => removeBookmark(key)} style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: '1px solid rgba(255,100,100,0.2)', background: 'transparent',
                      color: '#ff6b6b', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Arabic text */}
                {arabic ? (
                  <>
                    <div className="arabic" style={{ fontSize: '1.6rem', color: 'var(--text-primary)', textAlign: 'right', lineHeight: 2, marginBottom: '12px' }}>
                      {arabic.text}
                    </div>
                    {english && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        "{english.text}"
                      </p>
                    )}
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>Loading...</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
