import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth.js'
import LoginPage from './auth/LoginPage.jsx'
import RegisterPage from './auth/RegisterPage.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import Layout from './components/layout/Layout.jsx'
import TeacherDashboard from './TeacherDashboard.jsx'
import StudentPortal from './StudentPortal.jsx'
import SubmissionsView from './components/teacher/SubmissionsView.jsx'
import MyResults from './components/student/MyResults.jsx'

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="status">
          Loading…
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute role="teacher" />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/submissions" element={<SubmissionsView />} />
        </Route>

        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/student" element={<StudentPortal />} />
          <Route path="/student/results" element={<MyResults />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
