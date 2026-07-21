import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth.js'
import { getExamsByTeacher, getExamStats } from '../../api/examService.js'
import { getSubmissionsForExam } from '../../api/submissionService.js'

function StatCard({ label, value }) {
  return (
    <div className="col">
      <div className="card text-center h-100 shadow-sm">
        <div className="card-body py-3">
          <div className="h4 mb-0">{value ?? '—'}</div>
          <div className="small text-muted">{label}</div>
        </div>
      </div>
    </div>
  )
}

export default function SubmissionsView() {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await getExamsByTeacher()
        if (cancelled) return
        setExams(data)
        if (data.length) setSelectedId((prev) => prev || data[0].id)
      } catch (e) {
        if (!cancelled) setError(e?.message ?? 'Could not load exams.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [subs, examStats] = await Promise.all([
          getSubmissionsForExam(selectedId),
          getExamStats(selectedId),
        ])
        if (!cancelled) {
          setSubmissions(subs)
          setStats(examStats)
        }
      } catch (e) {
        if (!cancelled) setError(e?.message ?? 'Could not load submissions.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Submissions &amp; results</h1>

      <div className="mb-4" style={{ maxWidth: 420 }}>
        <label htmlFor="exam-select" className="form-label fw-semibold">
          Select an exam
        </label>
        <select
          id="exam-select"
          className="form-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {exams.length === 0 && <option>No exams yet</option>}
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading…</div>}

      {!loading && stats && (
        <div className="row row-cols-2 row-cols-md-5 g-2 mb-4">
          <StatCard label="Submissions" value={stats.submissions} />
          <StatCard label="Average" value={stats.average != null ? `${stats.average}%` : null} />
          <StatCard label="Lowest" value={stats.min != null ? `${stats.min}%` : null} />
          <StatCard label="Highest" value={stats.max != null ? `${stats.max}%` : null} />
          <StatCard label="Pass rate" value={stats.passRate != null ? `${stats.passRate}%` : null} />
        </div>
      )}

      {!loading && submissions.length === 0 && selectedId && (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5 text-muted">
            No submissions for this exam yet.
          </div>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Status</th>
                  <th scope="col">Score</th>
                  <th scope="col">Result</th>
                  <th scope="col">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const passed =
                    s.scorePercent != null &&
                    stats?.passPercent != null &&
                    s.scorePercent >= stats.passPercent
                  return (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.student?.fullName ?? s.studentId}</td>
                      <td className="text-capitalize">{s.status.replace('_', ' ')}</td>
                      <td>{s.scorePercent != null ? `${s.scorePercent}%` : '—'}</td>
                      <td>
                        {s.scorePercent == null ? (
                          '—'
                        ) : (
                          <span className={passed ? 'text-success fw-semibold' : 'text-danger'}>
                            {passed ? 'Passed' : 'Failed'}
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
