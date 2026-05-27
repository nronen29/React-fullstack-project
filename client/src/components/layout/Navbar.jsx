import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-0">
      <div className="container">
        <Link className="navbar-brand mb-0 h1 fs-4 text-white text-decoration-none" to="/">
          E-Test System
        </Link>
        {user && (
          <div className="d-flex align-items-center gap-2 ms-auto">
            <span className="text-white-50 small d-none d-sm-inline">
              Logged in as <strong className="text-white">{user.fullName}</strong>
            </span>
            <span className="badge text-bg-light text-capitalize">{user.role}</span>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
