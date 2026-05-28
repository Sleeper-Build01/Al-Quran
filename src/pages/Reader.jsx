import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import { getAyatWithTranslations, getAudioUrl, RECITERS } from '../utils/quranApi'
import { Play, Pause, SkipForward, SkipBack, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Repeat } from 'lucide-react'

export default function Reader() {
  const { surahId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEn, setShowEn] = useState(true)
  const [showUr, setShowUr] = useState(false)
  const [fontSize, setFontSize] = useState(2.2)
  const [bookmarks, setBookmarks] = useState([])
  const [currentAyah, setCurrentAyah] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [reciter, setReciter] = useState(RECITERS[0].id)
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const audioRef = useRef(null)
  const ayahRefs = useRef({})

  // Validate surahId — must be 1-114
  const surahNum = parseInt(surahId)
  const validSurah = !isNaN(surahNum) && surahNum >= 1 && surahNum <= 114

  // Fetch Quran data
  useEffect(() => {
    if (!validSurah) { setError('Invalid Surah'); setLoading(false); return }
    setLoading(true)
    setError(null)
    setCurrentAyah(1)
    setIsPlaying(false)
    setAudioProgress(0)
    getAyatWithTranslations(surahNum)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load Surah. Check internet.'); setLoading(false) })
  }, [surahNum])

  // Fetch bookmarks
  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        setBookmarks(snap.data()?.bookmarks || [])
      }).catch(() => {})
    }
  }, [user])

  // Save last reading position (debounced — only when ayah changes)
  useEffect(() => {
    if (!user?.uid || !data) return
    const timer = setTimeout(() => {
      updateDoc(doc(db, 'users', user.uid), {
        lastReading: {
          surahNumber: surahNum,
          surahName: data.arabic?.englishName || `Surah ${surahNum}`,
          surahArabic: data.arabic?.name || '',
          ayahNumber: currentAyah,
          totalAyahs: data.arabic?.numberOfAyahs || 0,
        }
      }).catch(() => {})
    }, 1000)
    return () => clearTimeout(timer)
  }, [currentAyah, data, surahNum, user])

  // Audio: update src when ayah/reciter changes
  useEffect(() => {
    if (!audioRef.current || !validSurah) return
    const wasPlaying = isPlaying
    audioRef.current.pause()
    audioRef.current.src = getAudioUrl(surahNum, currentAyah, reciter)
    audioRef.current.playbackRate = speed
    if (wasPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    }
  }, [currentAyah, reciter, surahNum])

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    }
  }, [])

  const scrollToAyah = useCallback((num) => {
    ayahRefs.current[num]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleAyahEnd = () => {
    if (loop) {
      audioRef.current?.play()
    } else {
      const total = data?.arabic?.numberOfAyahs || 1
      if (currentAyah < total) {
        const next = currentAyah + 1
        setCurrentAyah(next)
        scrollToAyah(next)
      } else {
        setIsPlaying(false)
      }
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.src = getAudioUrl(surahNum, currentAyah, reciter)
      audioRef.current.playbackRate = speed
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const goToAyah = (num) => {
    const total = data?.arabic?.numberOfAyahs || 1
    const clamped = Math.max(1, Math.min(num, total))
    setCurrentAyah(clamped)
    scrollToAyah(clamped)
  }

  const toggleBookmark = async (ayahKey) => {
    if (!user?.uid) return
    const ref = doc(db, 'users', user.uid)
    const isBookmarked = bookmarks.includes(ayahKey)
    try {
      if (isBookmarked) {
        await updateDoc(ref, { bookmarks: arrayRemove(ayahKey) })
        setBookmarks(prev => prev.filter(b => b !== ayahKey))
      } else {
        await updateDoc(ref, { bookmarks: arrayUnion(ayahKey) })
        setBookmarks(prev => [...prev, ayahKey])
      }
    } catch {}
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: 'var(--gold-500)' }}>﷽</div>
        <div style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading Surah...</div>
      </div>
    </div>
  )

  if (error) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
        <div style={{ color: '#ff6b6b', marginBottom: '20px' }}>{error}</div>
        <button className="btn-gold" onClick={() => navigate('/app/quran')}>Back to Surahs</button>
      </div>
    </div>
  )

  const surahInfo = data?.arabic
  const ayaat = data?.arabic?.ayahs || []
  const englishAyaat = data?.english?.ayahs || []
  const urduAyaat = data?.urdu?.ayahs || []

  return (
    <div className="page fade-in" style={{ paddingBottom: '140px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }; navigate('/app/quran') }}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
          <ChevronLeft size={18} /> Surahs
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 className="heading" style={{ fontSize: '1.6rem' }}>{surahInfo?.englishName}</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{surahInfo?.numberOfAyahs} Ayaat · {surahInfo?.revelationType}</div>
        </div>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.8rem', color: 'var(--gold-500)' }}>{surahInfo?.name}</div>
      </div>

      {/* Controls bar */}
      <div className="glass" style={{ padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setShowEn(!showEn)} style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${showEn ? 'var(--gold-500)' : 'rgba(201,168,76,0.2)'}`, background: showEn ? 'rgba(201,168,76,0.12)' : 'transparent', color: showEn ? 'var(--gold-500)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}>EN</button>
        <button onClick={() => setShowUr(!showUr)} style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${showUr ? 'var(--gold-500)' : 'rgba(201,168,76,0.2)'}`, background: showUr ? 'rgba(201,168,76,0.12)' : 'transparent', color: showUr ? 'var(--gold-500)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}>اردو</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>A</span>
          <button onClick={() => setFontSize(f => Math.max(1.4, parseFloat((f - 0.2).toFixed(1))))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>−</button>
          <button onClick={() => setFontSize(f => Math.min(3.5, parseFloat((f + 0.2).toFixed(1))))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>+</button>
        </div>
      </div>

      {/* Bismillah */}
      {surahNum !== 1 && surahNum !== 9 && (
        <div style={{ textAlign: 'center', marginBottom: '32px', padding: '20px', background: 'rgba(201,168,76,0.04)', borderRadius: 'var(--radius)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="arabic" style={{ fontSize: '2.2rem', color: 'var(--gold-300)' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        </div>
      )}

      {/* Ayaat */}
      {ayaat.map((ayah, idx) => {
        const ayahKey = `${surahNum}:${ayah.numberInSurah}`
        const isBookmarked = bookmarks.includes(ayahKey)
        const isCurrent = currentAyah === ayah.numberInSurah

        return (
          <div key={ayah.number}
            ref={el => { ayahRefs.current[ayah.numberInSurah] = el }}
            onClick={() => setCurrentAyah(ayah.numberInSurah)}
            style={{
              padding: '24px', marginBottom: '12px', borderRadius: 'var(--radius)',
              background: isCurrent ? 'rgba(201,168,76,0.06)' : 'var(--glass-bg)',
              border: `1px solid ${isCurrent ? 'rgba(201,168,76,0.3)' : 'var(--glass-border)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', fontSize: '0.8rem', color: 'var(--gold-500)', fontWeight: '600' }}>
                  {ayah.numberInSurah}
                </div>
                {isCurrent && isPlaying && (
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {[0, 150, 300].map(d => (
                      <div key={d} style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--gold-500)', animation: 'pulse-gold 0.8s infinite', animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={e => { e.stopPropagation(); setCurrentAyah(ayah.numberInSurah); togglePlay() }}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)', background: isCurrent && isPlaying ? 'rgba(201,168,76,0.15)' : 'transparent', color: 'var(--gold-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCurrent && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={e => { e.stopPropagation(); toggleBookmark(ayahKey) }}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${isBookmarked ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.2)'}`, background: isBookmarked ? 'rgba(201,168,76,0.12)' : 'transparent', color: 'var(--gold-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>
              </div>
            </div>

            {/* Arabic */}
            <div className="arabic" style={{ fontSize: `${fontSize}rem`, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 2.2, textAlign: 'right' }}>
              {ayah.text}
            </div>

            {/* English */}
            {showEn && englishAyaat[idx] && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>English</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, fontStyle: 'italic' }}>{englishAyaat[idx].text}</p>
              </div>
            )}

            {/* Urdu */}
            {showUr && urduAyaat[idx] && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Urdu</div>
                <p className="arabic" style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 2, direction: 'rtl' }}>{urduAyaat[idx].text}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Prev / Next Surah */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
        {surahNum > 1 && (
          <button className="btn-outline" onClick={() => navigate(`/app/quran/${surahNum - 1}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChevronLeft size={16} /> Previous
          </button>
        )}
        {surahNum < 114 && (
          <button className="btn-gold" onClick={() => navigate(`/app/quran/${surahNum + 1}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAyahEnd}
        onTimeUpdate={() => {
          if (audioRef.current?.duration) {
            setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      {/* Audio Player Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
        background: 'rgba(10,31,20,0.98)', borderTop: '1px solid rgba(201,168,76,0.15)',
        backdropFilter: 'blur(20px)', padding: '10px 20px 16px',
      }}>
        {/* Progress bar */}
        <div
          style={{ height: '3px', background: 'rgba(255,255,255,0.08)', marginBottom: '12px', cursor: 'pointer', borderRadius: '2px', position: 'relative' }}
          onClick={e => {
            if (audioRef.current?.duration) {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              audioRef.current.currentTime = pct * audioRef.current.duration
              setAudioProgress(pct * 100)
            }
          }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--green-500), var(--gold-500))', width: `${audioProgress}%`, borderRadius: '2px', transition: 'width 0.1s linear' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Info */}
          <div style={{ flex: 1, minWidth: '100px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {surahInfo?.englishName} · Ayah {currentAyah}/{surahInfo?.numberOfAyahs}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {RECITERS.find(r => r.id === reciter)?.name}
            </div>
          </div>

          {/* Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => goToAyah(currentAyah - 1)} disabled={currentAyah <= 1}
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: currentAyah <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: currentAyah <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentAyah <= 1 ? 0.4 : 1 }}>
              <SkipBack size={16} />
            </button>
            <button onClick={togglePlay}
              style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-700), var(--gold-500))', border: 'none', color: 'var(--green-900)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(201,168,76,0.35)', flexShrink: 0 }}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button onClick={() => goToAyah(currentAyah + 1)} disabled={currentAyah >= (surahInfo?.numberOfAyahs || 1)}
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentAyah >= (surahInfo?.numberOfAyahs || 1) ? 0.4 : 1 }}>
              <SkipForward size={16} />
            </button>
          </div>

          {/* Extra Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <button onClick={() => setLoop(!loop)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${loop ? 'var(--gold-500)' : 'rgba(201,168,76,0.2)'}`, background: loop ? 'rgba(201,168,76,0.1)' : 'transparent', color: loop ? 'var(--gold-500)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontFamily: 'DM Sans, sans-serif' }}>
              <Repeat size={12} /> Loop
            </button>
            <select value={reciter} onChange={e => { setReciter(e.target.value); setIsPlaying(false) }}
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', color: 'var(--text-secondary)', padding: '6px 8px', fontSize: '0.72rem', cursor: 'pointer', maxWidth: '130px', fontFamily: 'DM Sans, sans-serif' }}>
              {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name.split(' ').slice(0, 2).join(' ')}</option>)}
            </select>
            <select value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', color: 'var(--text-secondary)', padding: '6px 8px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {[0.75, 1, 1.25, 1.5].map(s => <option key={s} value={s}>{s}x</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
