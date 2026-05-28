import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Headphones, Bookmark, TrendingUp, Star, ChevronRight } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const features = [
    { icon: BookOpen, title: 'Read', desc: 'Full Quran with Arabic, Urdu & English translation' },
    { icon: Headphones, title: 'Listen', desc: 'Beautiful recitations from world-renowned Qaris' },
    { icon: Bookmark, title: 'Bookmark', desc: 'Save your favourite ayaat and access anytime' },
    { icon: TrendingUp, title: 'Track', desc: 'Monitor your daily reading progress and streaks' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid rgba(201,168,76,0.1)',
        position: 'sticky', top: 0, backdropFilter: 'blur(20px)',
        background: 'rgba(10,31,20,0.8)', zIndex: 100,
      }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.6rem', color: 'var(--gold-500)' }}>
          النور <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Al-Noor</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user ? (
            <button className="btn-gold" onClick={() => navigate('/app')}>Go to App</button>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-gold" onClick={() => navigate('/login?signup=true')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: '100px',
          padding: '8px 20px', marginBottom: '32px',
          fontSize: '0.85rem', color: 'var(--gold-300)', letterSpacing: '1px'
        }}>
          ✦ The Holy Quran — Complete Edition
        </div>

        <div style={{
          fontFamily: 'Amiri, serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          color: 'var(--gold-500)', marginBottom: '16px', lineHeight: 1.4,
          textShadow: '0 0 60px rgba(201,168,76,0.2)'
        }}>
          اقْرَأْ بِاسْمِ رَبِّكَ
        </div>

        <h1 className="heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '20px', lineHeight: 1.2, color: 'var(--text-primary)' }}>
          Read. Listen. <span className="gold">Reflect.</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.8 }}>
          A beautiful, complete Quran experience with translations, audio recitations, bookmarks, and personal progress tracking.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gold" style={{ fontSize: '1rem', padding: '16px 36px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate('/login?signup=true')}>
            Start Reading <ChevronRight size={18} />
          </button>
          <button className="btn-outline" style={{ fontSize: '1rem', padding: '16px 36px' }}
            onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 className="heading" style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '48px', color: 'var(--text-primary)' }}>
          Everything you need for your <span className="gold">Quran journey</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass" style={{ padding: '32px 24px', textAlign: 'center', cursor: 'default' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: 'var(--gold-500)'
              }}>
                <Icon size={24} />
              </div>
              <h3 className="heading" style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {[['114', 'Surahs'], ['6,236', 'Ayaat'], ['30', 'Juz'], ['3+', 'Reciters']].map(([num, label]) => (
            <div key={label}>
              <div className="heading gold" style={{ fontSize: '2.5rem', fontWeight: '600' }}>{num}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <div className="glass" style={{ padding: '60px 40px', borderColor: 'rgba(201,168,76,0.25)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🕌</div>
          <h2 className="heading" style={{ fontSize: '2rem', marginBottom: '16px' }}>Begin your journey today</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.7 }}>
            Join thousands of Muslims reading and listening to the Quran daily.
          </p>
          <button className="btn-gold" style={{ fontSize: '1rem', padding: '16px 40px' }}
            onClick={() => navigate('/login?signup=true')}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.2rem', color: 'var(--gold-500)', marginBottom: '8px' }}>النور</div>
        Al-Noor © {new Date().getFullYear()} — Built with ❤️ for the Ummah
      </footer>
    </div>
  )
}
