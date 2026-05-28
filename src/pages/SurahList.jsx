import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSurahList } from '../utils/quranApi'
import { Search, BookOpen } from 'lucide-react'

export default function SurahList() {
  const [surahs, setSurahs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getSurahList().then(data => {
      setSurahs(data)
      setFiltered(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = surahs
    if (filter !== 'All') result = result.filter(s => s.revelationType === filter)
    if (query) result = result.filter(s =>
      s.englishName.toLowerCase().includes(query.toLowerCase()) ||
      s.name.includes(query) ||
      String(s.number).includes(query)
    )
    setFiltered(result)
  }, [query, filter, surahs])

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: 'var(--gold-500)', animation: 'pulse 2s infinite' }}>﷽</div>
        <div style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading Quran...</div>
      </div>
    </div>
  )

  return (
    <div className="page fade-in">
      <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '8px' }}>The Holy <span className="gold">Quran</span></h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>114 Surahs · 6,236 Ayaat · 30 Juz</p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-field" style={{ paddingLeft: '40px' }}
          placeholder="Search surah name or number..."
          value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['All', 'Meccan', 'Medinan'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 20px', border: `1px solid ${filter === f ? 'var(--gold-500)' : 'rgba(201,168,76,0.2)'}`,
            borderRadius: '100px', background: filter === f ? 'rgba(201,168,76,0.12)' : 'transparent',
            color: filter === f ? 'var(--gold-500)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif'
          }}>
            {f} {f === 'All' ? `(${surahs.length})` : `(${surahs.filter(s => s.revelationType === f).length})`}
          </button>
        ))}
      </div>

      {/* Surah Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {filtered.map(surah => (
          <button key={surah.number} onClick={() => navigate(`/app/quran/${surah.number}`)}
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius)', padding: '16px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left',
              transition: 'all 0.2s', backdropFilter: 'blur(12px)', width: '100%',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}>

            {/* Number */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold-500)', fontWeight: '600', fontSize: '0.9rem'
            }}>
              {surah.number}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '500', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{surah.englishName}</div>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.1rem', color: 'var(--gold-500)' }}>{surah.name}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{surah.englishNameTranslation}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>·</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{surah.numberOfAyahs} ayaat</span>
                <span style={{
                  padding: '2px 8px', borderRadius: '100px', fontSize: '0.65rem',
                  background: surah.revelationType === 'Meccan' ? 'rgba(201,168,76,0.1)' : 'rgba(82,183,136,0.1)',
                  color: surah.revelationType === 'Meccan' ? 'var(--gold-500)' : 'var(--green-400)',
                  border: `1px solid ${surah.revelationType === 'Meccan' ? 'rgba(201,168,76,0.2)' : 'rgba(82,183,136,0.2)'}`,
                }}>
                  {surah.revelationType}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <div>No surahs found for "{query}"</div>
        </div>
      )}
    </div>
  )
}
