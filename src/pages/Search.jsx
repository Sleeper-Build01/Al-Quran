import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X, ExternalLink } from 'lucide-react'
import { validateSearchQuery, sanitize } from '../utils/validation'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('quran_recent_searches') || '[]'))
  const navigate = useNavigate()
  const inputRef = useRef()

  const doSearch = async (q) => {
    const err = validateSearchQuery(q)
    if (err) return
    const safeQ = sanitize(q)
    setLoading(true)
    setSearched(true)

    // Save recent (sanitized)
    const updated = [safeQ, ...recent.filter(r => r !== safeQ)].slice(0, 8)
    setRecent(updated)
    localStorage.setItem('quran_recent_searches', JSON.stringify(updated))

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(safeQ)}/all/en`)
      const data = await res.json()
      setResults(data.data?.matches || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const clearRecent = () => {
    setRecent([])
    localStorage.removeItem('quran_recent_searches')
  }

  const highlight = (text, query) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: 'rgba(201,168,76,0.3)', color: 'var(--gold-300)', borderRadius: '3px', padding: '0 2px' }}>{p}</mark>
        : p
    )
  }

  return (
    <div className="page fade-in">
      <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '8px' }}>Search <span className="gold">Quran</span></h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Search ayaat by keyword or meaning</p>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <SearchIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input ref={inputRef} className="input-field"
          style={{ paddingLeft: '48px', paddingRight: query ? '48px' : '16px', fontSize: '1rem', padding: '16px 48px' }}
          placeholder="Search for a word, phrase, or topic..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch(query)} />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus() }}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        )}
      </div>

      <button className="btn-gold" onClick={() => doSearch(query)} disabled={loading || !query.trim()}
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SearchIcon size={16} /> {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Recent searches */}
      {!searched && recent.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Searches</span>
            <button onClick={clearRecent} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Clear</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {recent.map(r => (
              <button key={r} onClick={() => { setQuery(r); doSearch(r) }}
                style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.05)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular topics */}
      {!searched && (
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Popular Topics</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['mercy', 'patience', 'paradise', 'prayer', 'forgiveness', 'gratitude', 'justice', 'faith'].map(t => (
              <button key={t} onClick={() => { setQuery(t); doSearch(t) }}
                style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(82,183,136,0.2)', background: 'rgba(82,183,136,0.05)', color: 'var(--green-400)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '2rem', color: 'var(--gold-500)', marginBottom: '8px' }}>﷽</div>
          Searching...
        </div>
      )}

      {searched && !loading && (
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </div>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.3 }}>🔍</div>
              No results found. Try a different keyword.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.slice(0, 50).map((match, i) => (
                <div key={i} className="glass" style={{ padding: '20px 24px', cursor: 'pointer' }}
                  onClick={() => navigate(`/app/quran/${match.surah.number}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold-500)' }}>
                        {match.surah.englishName} · {match.numberInSurah}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{match.surah.revelationType}</span>
                    </div>
                    <ExternalLink size={14} color="var(--text-muted)" />
                  </div>
                  <div className="arabic" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', textAlign: 'right', lineHeight: 2, marginBottom: '10px' }}>
                    {match.text}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, fontStyle: 'italic' }}>
                    {highlight(match.edition?.text || '', query)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
