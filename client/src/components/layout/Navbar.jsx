import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const links =
    user?.role === 'teacher'
      ? [
          { to: '/teacher', label: 'Dashboard' },
          { to: '/teacher/submissions', label: 'Submissions' },
        ]
      : user?.role === 'student'
        ? [
            { to: '/student', label: 'Exams' },
            { to: '/student/results', label: 'My Results' },
          ]
        : []

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-0">
      <div className="container">
        <Link className="navbar-brand mb-0 h1 fs-4 text-white text-decoration-none" to="/">
          E-Test System
        </Link>
        {user && (
          <div className="d-flex align-items-center gap-3 ms-auto flex-wrap">
            <div className="d-flex gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    `nav-link px-2 py-1 rounded ${isActive ? 'active bg-white text-primary fw-semibold' : 'text-white'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
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
