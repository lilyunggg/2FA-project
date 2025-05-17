// Import React's useState hook and the CSS for styling
import { useState, useEffect, useRef } from 'react'
import './App.css'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import validator from 'validator' // Import validator.js for input validation

function App() {
  // State for phone number input
  const [phone, setPhone] = useState('')
  // State for loading indicator
  const [loading, setLoading] = useState(false)
  // State for displaying messages to the user
  const [message, setMessage] = useState('')
  // State to track which step the user is on: entering phone or code
  const [step, setStep] = useState('phone') // 'phone' or 'code'
  // State for verification code input
  const [code, setCode] = useState('')
  // Timer state for 2-minute countdown
  const [timeLeft, setTimeLeft] = useState(120)
  const timerRef = useRef(null)
  // Track if verification was successful for lock animation
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Start timer when moving to code step
  useEffect(() => {
    if (step === 'code') {
      setTimeLeft(120)
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [step])

  // Calculate progress and color for the bar
  const progress = (timeLeft / 120) * 100

  // Handles sending the verification code to the user's phone
  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsUnlocked(false)
    // Validate and sanitize phone number
    let sanitizedPhone = validator.trim(phone)
    sanitizedPhone = validator.escape(sanitizedPhone)
    if (!validator.isMobilePhone(sanitizedPhone, 'any', { strictMode: false })) {
      setMessage('Please enter a valid phone number.')
      setLoading(false)
      return
    }
    try {
      // Send phone number to backend to start verification
      const res = await fetch('https://localhost:3000/api/start-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: sanitizedPhone })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Verification code sent!')
        setStep('code') // Move to code entry step
      } else {
        setMessage(data.error || 'Failed to send verification code.')
      }
    } catch (err) {
      setMessage('Network error.')
    }
    setLoading(false)
  }

  // Handles checking the verification code entered by the user
  const handleCheck = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    // Validate and sanitize code and phone
    let sanitizedPhone = validator.trim(phone)
    sanitizedPhone = validator.escape(sanitizedPhone)
    let sanitizedCode = validator.trim(code)
    sanitizedCode = validator.escape(sanitizedCode)
    if (!validator.isMobilePhone(sanitizedPhone, 'any', { strictMode: false })) {
      setMessage('Invalid phone number.')
      setLoading(false)
      return
    }
    if (!validator.isNumeric(sanitizedCode) || sanitizedCode.length < 4 || sanitizedCode.length > 8) {
      setMessage('Invalid code format.')
      setLoading(false)
      return
    }
    try {
      // Send phone and code to backend to check verification
      const res = await fetch('https://localhost:3000/api/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: sanitizedPhone, code: sanitizedCode })
      })
      const data = await res.json()
      if (res.ok && data.status === 'approved') {
        setMessage('Verification successful!')
        setIsUnlocked(true)
        clearInterval(timerRef.current) // Stop the timer when unlocked
      } else {
        setMessage(data.error || 'Invalid code or verification failed.')
        setIsUnlocked(false)
      }
    } catch (err) {
      setMessage('Network error.')
    }
    setLoading(false)
  }

  return (
    <div className="app-bg">
      <div className="card">
        <h2>Two-Factor Authentication</h2>
        {/* Progress bar and lock always visible */}
        <div className="progressbar-wrapper">
          <CircularProgressbar
            value={progress}
            styles={buildStyles({
              pathColor: "#4fc3f7",
              trailColor: '#e0e0e0',
              pathTransition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0s, stroke 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            })}
          />
          <div className="lock-container">
            <div className="lock-icon">
              {/* Cover to hide left side of shackle */}
              <div className="lock-shackle-cover"></div>
              {/* Lock shackle (animated) */}
              <div className={`lock-shackle${isUnlocked ? ' unlocked' : ''}`}></div>
              <div className="lock-base"></div>
            </div>
          </div>
        </div>
        {/* Render phone input form or code input form based on step */}
        {step === 'phone' ? (
          <form onSubmit={handleVerify}>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="phone-input"
              required
            />
            <button type="submit" className="verify-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Verify'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCheck}>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="phone-input"
              required
              disabled={timeLeft === 0}
            />
            <button type="submit" className="verify-btn" disabled={loading || timeLeft === 0}>
              {loading ? 'Verifying...' : 'Submit Code'}
            </button>
          </form>
        )}
        {/* Display message to the user if present, or time expired */}
        {message && <div className="message">{message}</div>}
        {step === 'code' && timeLeft === 0 && (
          <div className="message" style={{ color: '#b00020' }}>Time expired. Please request a new code.</div>
        )}
      </div>
    </div>
  )
}

// Export the App component as default
export default App
