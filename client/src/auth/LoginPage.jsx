import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const loggedIn = await login(username, password)
      navigate(loggedIn.role === 'teacher' ? '/teacher' : '/student', { replace: true })
    } catch (err) {
      setError(err?.message ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm text-start">
            <div className="card-body p-4">
              <h1 className="h4 mb-1">Sign in</h1>
              <p className="text-muted small mb-4">E-Test System</p>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Login'}
                </button>
              </form>

              <p className="small text-muted mt-4 mb-0">
                Demo teacher: <code>drsmith</code> / <code>teacher123</code>
                <br />
                Demo student: <code>alex</code> / <code>student123</code>
              </p>
              <p className="small mt-3 mb-0">
                No account? <Link to="/register">Register as student</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
