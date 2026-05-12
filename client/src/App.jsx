import { useState } from 'react'
import Login from './Login.jsx'
import TeacherDashboard from './TeacherDashboard.jsx'
import StudentPortal from './StudentPortal.jsx'

export default function App() {
  const [session, setSession] = useState(null)

  if (!session) {
    return <Login onLogin={setSession} />
  }

  const { displayName, role } = session

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-0">
        <div className="container">
          <span className="navbar-brand mb-0 h1 fs-4">E-Test System</span>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="text-white small">
              Hi, <strong>{displayName}</strong>
              <span className="text-white-50 ms-1">({role === 'teacher' ? 'Teacher' : 'Student'})</span>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => setSession(null)}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main>{role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}</main>
    </div>
  )
}
