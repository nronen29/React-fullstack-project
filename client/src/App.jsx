import { useState } from 'react'
import TeacherDashboard from './TeacherDashboard.jsx'
import StudentPortal from './StudentPortal.jsx'

export default function App() {
  const [role, setRole] = useState('teacher')

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-0">
        <div className="container">
          <span className="navbar-brand mb-0 h1 fs-4">E-Test System</span>
          <div className="d-flex align-items-center gap-2">
            <span className="text-white-50 small me-2 d-none d-sm-inline">Role</span>
            <div className="btn-group" role="group" aria-label="Switch role">
              <button
                type="button"
                className={`btn btn-sm ${role === 'teacher' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setRole('teacher')}
              >
                Teacher
              </button>
              <button
                type="button"
                className={`btn btn-sm ${role === 'student' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>{role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}</main>
    </div>
  )
}
