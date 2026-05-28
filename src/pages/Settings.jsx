import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth'
import { auth } from '../firebase'
import { User, Lock, Bell, Trash2, Shield, Eye, EyeOff, AlertCircle, Check, ChevronRight, Monitor, Smartphone } from 'lucide-react'

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

const Section = ({ title, icon: Icon, children }) => (
  <div className="glass" style={{ padding: '24px', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon size={18} color="var(--gold-500)" />
      <h3 className="heading" style={{ fontSize: '1.1rem' }}>{title}</h3>
    </div>
    {children}
  </div>
)

const Toggle = ({ label, desc, value, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</div>
      {desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      background: value ? 'var(--gold-500)' : 'rgba(255,255,255,0.12)',
      position: 'relative', transition: 'all 0.3s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: value ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%', background: 'white',
        transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  </div>
)

export default function Settings() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Password change
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  // Preferences
  const [fontSize, setFontSize] = useState('medium')
  const [translation, setTranslation] = useState('english')
  const [reciter, setReciter] = useState('ar.alafasy')
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)

  // Notifications
  const [dailyReminder, setDailyReminder] = useState(false)
  const [prayerAlerts, setPrayerAlerts] = useState(false)
  const [goalReminder, setGoalReminder] = useState(false)

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  const strength = getPasswordStrength(newPass)

  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) {
          const d = snap.data()
          setProfile(d)
          setFontSize(d.fontSize || 'medium')
          setTranslation(d.translation || 'english')
          setReciter(d.reciter || 'ar.alafasy')
          setAutoPlay(d.autoPlay || false)
          setAutoScroll(d.autoScroll !== false)
          setDailyReminder(d.dailyReminder || false)
          setPrayerAlerts(d.prayerAlerts || false)
          setGoalReminder(d.goalReminder || false)
        }
      })
    }
  }, [user])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3000)
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fontSize, translation, reciter, autoPlay, autoScroll,
        dailyReminder, prayerAlerts, goalReminder,
      })
      showMsg('success', 'Preferences saved!')
    } catch {
      showMsg('error', 'Failed to save. Try again.')
    }
    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) return showMsg('error', 'Passwords do not match')
    if (newPass.length < 8) return showMsg('error', 'Password must be at least 8 characters')

    setChangingPass(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPass)
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
      showMsg('success', 'Password updated successfully!')
    } catch (err) {
      if (err.code === 'auth/wrong-password') showMsg('error', 'Current password is incorrect')
      else showMsg('error', 'Failed to update password')
    }
    setChangingPass(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return showMsg('error', 'Type DELETE to confirm')
    try {
      await deleteUser(auth.currentUser)
      logout()
    } catch {
      showMsg('error', 'Please re-login and try again')
    }
  }

  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com'

  return (
    <div className="page fade-in">
      <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>Manage your account and preferences</p>

      {/* Alert message */}
      {msg.text && (
        <div style={{
          padding: '14px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: msg.type === 'success' ? 'rgba(76,175,80,0.12)' : 'rgba(255,70,70,0.12)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(76,175,80,0.3)' : 'rgba(255,70,70,0.3)'}`,
          color: msg.type === 'success' ? '#4caf50' : '#ff6b6b',
        }}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--green-600), var(--gold-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: '600', color: 'white',
          }}>
            {user?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '500', fontSize: '1rem', marginBottom: '4px' }}>{user?.displayName || 'User'}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</div>
            <div style={{ marginTop: '6px', padding: '3px 10px', borderRadius: '100px', display: 'inline-block', fontSize: '0.7rem', background: isGoogleUser ? 'rgba(66,133,244,0.12)' : 'rgba(201,168,76,0.1)', color: isGoogleUser ? '#74c0fc' : 'var(--gold-500)', border: `1px solid ${isGoogleUser ? 'rgba(66,133,244,0.2)' : 'rgba(201,168,76,0.2)'}` }}>
              {isGoogleUser ? '🔵 Google Account' : '✉️ Email Account'}
            </div>
          </div>
        </div>
      </Section>

      {/* Reading Preferences */}
      <Section title="Reading Preferences" icon={Monitor}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Arabic Font Size</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['small', 'medium', 'large', 'xlarge'].map(s => (
                <button key={s} onClick={() => setFontSize(s)} style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${fontSize === s ? 'var(--gold-500)' : 'rgba(201,168,76,0.2)'}`,
                  background: fontSize === s ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: fontSize === s ? 'var(--gold-500)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif',
                  textTransform: 'capitalize',
                }}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Translation</label>
            <select value={translation} onChange={e => setTranslation(e.target.value)} className="input-field">
              <option value="english">English</option>
              <option value="urdu">Urdu</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Default Reciter</label>
            <select value={reciter} onChange={e => setReciter(e.target.value)} className="input-field">
              <option value="ar.alafasy">Sheikh Mishary Alafasy</option>
              <option value="ar.abdurrahmaansudais">Sheikh Abdurrahman Al-Sudais</option>
              <option value="ar.husary">Sheikh Mahmoud Khalil Al-Husary</option>
            </select>
          </div>

          <Toggle label="Auto-play Audio" desc="Automatically play recitation when opening a surah" value={autoPlay} onChange={setAutoPlay} />
          <Toggle label="Auto-scroll with Audio" desc="Scroll to current ayah while audio is playing" value={autoScroll} onChange={setAutoScroll} />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Toggle label="Daily Reading Reminder" desc="Get reminded to read Quran daily" value={dailyReminder} onChange={setDailyReminder} />
        <Toggle label="Prayer Time Alerts" desc="Receive alerts for each prayer time" value={prayerAlerts} onChange={setPrayerAlerts} />
        <Toggle label="Goal Achieved Notification" desc="Notify when you reach your daily reading goal" value={goalReminder} onChange={setGoalReminder} />
      </Section>

      {/* Save preferences */}
      <div style={{ marginBottom: '16px' }}>
        <button className="btn-gold" onClick={savePreferences} disabled={saving} style={{ width: '100%', padding: '14px' }}>
          {saving ? '⏳ Saving...' : '💾 Save Preferences'}
        </button>
      </div>

      {/* Security — only show for email users */}
      {!isGoogleUser && (
        <Section title="Security" icon={Shield}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Change your account password</p>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" style={{ paddingLeft: '40px' }} type={showPass ? 'text' : 'password'}
                placeholder="Current password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} required />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" style={{ paddingLeft: '40px', paddingRight: '40px' }} type={showPass ? 'text' : 'password'}
                placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {newPass && (
              <div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s', borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: strength.color, marginTop: '4px', textAlign: 'right' }}>{strength.label}</div>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field"
                style={{ paddingLeft: '40px', borderColor: confirmPass && confirmPass !== newPass ? '#ff4444' : undefined }}
                type={showPass ? 'text' : 'password'}
                placeholder="Confirm new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
            </div>

            <button className="btn-outline" type="submit" disabled={changingPass} style={{ padding: '13px' }}>
              {changingPass ? '⏳ Updating...' : '🔒 Update Password'}
            </button>
          </form>
        </Section>
      )}

      {/* Active Sessions */}
      <Section title="Active Sessions" icon={Smartphone}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Devices currently logged into your account</p>
        {[
          { device: 'Current Device', type: 'Mobile', time: 'Active now', icon: '📱', current: true },
          { device: 'Chrome Browser', type: 'Desktop', time: '2 hours ago', icon: '💻', current: false },
        ].map((session, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0',
            borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{ fontSize: '1.5rem' }}>{session.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{session.device}</span>
                {session.current && <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '0.65rem', background: 'rgba(76,175,80,0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.25)' }}>Current</span>}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{session.type} · {session.time}</div>
            </div>
            {!session.current && (
              <button style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,100,100,0.25)', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'DM Sans, sans-serif' }}>
                Sign out
              </button>
            )}
          </div>
        ))}
        <button style={{
          width: '100%', marginTop: '16px', padding: '12px',
          border: '1px solid rgba(255,100,100,0.2)', borderRadius: 'var(--radius-sm)',
          background: 'transparent', color: '#ff6b6b', cursor: 'pointer',
          fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
        }}>
          Sign Out All Devices
        </button>
      </Section>

      {/* Danger Zone */}
      <div className="glass" style={{ padding: '24px', borderColor: 'rgba(255,70,70,0.2)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Trash2 size={18} color="#ff6b6b" />
          <h3 className="heading" style={{ fontSize: '1.1rem', color: '#ff6b6b' }}>Danger Zone</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.6 }}>
          Deleting your account is permanent. All your bookmarks, reading history, and progress will be lost forever.
        </p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} style={{
            padding: '12px 24px', border: '1px solid rgba(255,70,70,0.3)', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: '#ff6b6b', cursor: 'pointer',
            fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif',
          }}>
            Delete My Account
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>Type <strong>DELETE</strong> to confirm:</p>
            <input className="input-field" style={{ borderColor: 'rgba(255,70,70,0.3)' }}
              placeholder="Type DELETE here" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowDelete(false); setDeleteConfirm('') }} className="btn-outline" style={{ flex: 1, padding: '12px' }}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: 'var(--radius-sm)',
                background: deleteConfirm === 'DELETE' ? '#c0392b' : 'rgba(255,70,70,0.2)',
                color: 'white', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: '500',
              }}>
                Permanently Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
