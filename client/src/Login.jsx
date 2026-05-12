import { useState } from 'react'

/** Mock login — no server; demo password: `demo` */
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('teacher')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      setError('Please enter a username.')
      return
    }
    if (password !== 'demo') {
      setError('Wrong password. Use: demo')
      return
    }
    onLogin({ displayName: username.trim(), role })
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="card shadow" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4">
          <h1 className="h4 card-title text-center mb-4">Sign in — E-Test</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="login-user" className="form-label">
                Username
              </label>
              <input
                id="login-user"
                type="text"
                className="form-control"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="login-pass" className="form-label">
                Password
              </label>
              <input
                id="login-pass"
                type="password"
                className="form-control"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo"
              />
              <p className="form-text mb-0 small">
                Demo password: <code>demo</code>
              </p>
            </div>
            <div className="mb-3">
              <span className="form-label d-block">Role</span>
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="role"
                  id="role-teacher"
                  checked={role === 'teacher'}
                  onChange={() => setRole('teacher')}
                />
                <label className="btn btn-outline-primary" htmlFor="role-teacher">
                  Teacher
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="role"
                  id="role-student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                />
                <label className="btn btn-outline-primary" htmlFor="role-student">
                  Student
                </label>
              </div>
            </div>
            {error && (
              <div className="alert alert-danger py-2 small mb-3" role="alert">
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-100">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
