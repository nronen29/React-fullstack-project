import { useEffect, useState } from 'react'
import { getAllExams } from './api/examService.js'

export default function TeacherDashboard() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllExams()
        if (!cancelled) setExams(data)
      } catch (e) {
        if (!cancelled) setError(e?.message ?? 'Failed to load exams')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">Teacher dashboard</h1>
        <span className="badge text-bg-secondary">E-Test System</span>
      </div>

      {loading && (
        <div className="alert alert-info" role="status">
          Loading exams…
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && exams.length === 0 && (
        <p className="text-muted">No exams yet. Add one via your future admin flow.</p>
      )}

      <div className="row g-3">
        {exams.map((exam) => (
          <div key={exam.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title h5">{exam.title}</h2>
                <p className="card-text text-muted small mb-2">Exam ID: {exam.id}</p>
                <p className="card-text mb-0">
                  <span className="badge text-bg-primary">
                    {exam.questions?.length ?? 0} questions
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
