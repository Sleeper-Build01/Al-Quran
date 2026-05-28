import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Chrome } from 'lucide-react'
import { checkRateLimit, resetRateLimit } from '../utils/rateLimiter'
import { validateEmail, validatePassword, validateName, sanitize } from '../utils/validation'

function getPasswordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Weak', color: '#ff4444', width: '25%' }
  if (score === 2) return { label: 'Fair', color: '#ff9800', width: '50%' }
  if (score === 3) return { label: 'Good', color: '#4caf50', width: '75%' }
  return { label: 'Strong', color: '#00e676', width: '100%' }
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const [isSignup, setIsSignup] = useState(searchParams.get('signup') === 'true')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const { login, signup, loginWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()
  const strength = getPasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // ✅ Input validation
    const emailErr = validateEmail(email)
    if (emailErr) return setError(emailErr)

    if (isSignup) {
      const nameErr = validateName(name)
      if (nameErr) return setError(nameErr)
      const passErr = validatePassword(password)
      if (passErr) return setError(passErr)
      if (password !== confirm) return setError('Passwords do not match')
    }

    setLoading(true)
    try {
      // ✅ Rate limit: max 5 attempts per 15 minutes
      checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)
      if (isSignup) await signup(email, password, name)
      else await login(email, password)
      resetRateLimit(`login_${email}`) // reset on success
      navigate('/app')
    } catch (err) {
      const msg = err.message.includes('Too many attempts') ? err.message
        : err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/email-already-in-use' ? 'Email already in use'
        : err.code === 'auth/network-request-failed' ? 'Network error. Check internet.'
        : err.message
      setError(msg)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/app')
    } catch (err) {
      setError('Google login failed. Try again.')
    }
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) return setError('Enter your email first')
    setLoading(true)
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err) {
      setError('Could not send reset email')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: 'var(--gold-500)', marginBottom: '4px' }}>النور</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Al-Noor Quran</div>
        </div>

        <div className="glass" style={{ padding: '40px 36px', borderColor: 'rgba(201,168,76,0.2)' }}>
          {resetMode ? (
            <>
              <h2 className="heading" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Reset Password</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Enter your email to receive a reset link
              </p>
              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gold-300)' }}>
                  ✅ Reset email sent! Check your inbox.
                  <br /><button onClick={() => setResetMode(false)} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--gold-500)', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
                </div>
              ) : (
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                  {error && <div style={{ display: 'flex', gap: '8px', color: '#ff6b6b', fontSize: '0.85rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}
                  <button className="btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
                  <button type="button" onClick={() => setResetMode(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>← Back to Login</button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Tabs */}
              <div style={{ display: 'flex', marginBottom: '28px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
                {['Login', 'Sign Up'].map((tab, i) => (
                  <button key={tab} onClick={() => { setIsSignup(i === 1); setError('') }} style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    background: (i === 1) === isSignup ? 'var(--glass-hover)' : 'transparent',
                    color: (i === 1) === isSignup ? 'var(--gold-500)' : 'var(--text-muted)',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: '500',
                    transition: 'all 0.2s',
                  }}>{tab}</button>
                ))}
              </div>

              {/* Google Button */}
              <button onClick={handleGoogle} disabled={loading} style={{
                width: '100%', padding: '13px', marginBottom: '20px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', transition: 'all 0.2s',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isSignup && (
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: '40px' }} type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input-field" style={{ paddingLeft: '40px' }} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input-field" style={{ paddingLeft: '40px', paddingRight: '40px' }} type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength */}
                {isSignup && password && (
                  <div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s', borderRadius: '2px' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: strength.color, marginTop: '4px', textAlign: 'right' }}>{strength.label}</div>
                  </div>
                )}

                {isSignup && (
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: '40px', borderColor: confirm && confirm !== password ? '#ff4444' : undefined }} type={showPass ? 'text' : 'password'} placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                  </div>
                )}

                {error && (
                  <div style={{ display: 'flex', gap: '8px', color: '#ff6b6b', fontSize: '0.85rem', alignItems: 'center', padding: '10px', background: 'rgba(255,70,70,0.08)', borderRadius: '8px', border: '1px solid rgba(255,70,70,0.15)' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />{error}
                  </div>
                )}

                <button className="btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: '4px' }}>
                  {loading ? '⏳ Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                </button>

                {!isSignup && (
                  <button type="button" onClick={() => setResetMode(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center' }}>
                    Forgot password?
                  </button>
                )}
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  )
}
