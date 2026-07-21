import { useEffect, useState } from 'react'
import { getMySubmissions } from '../../api/submissionService.js'

const STATUS_LABELS = {
  graded: { text: 'Graded', cls: 'text-bg-success' },
  in_progress: { text: 'In progress', cls: 'text-bg-secondary' },
  submitted: { text: 'Submitted', cls: 'text-bg-info' },
  abandoned: { text: 'Left', cls: 'text-bg-warning' },
}

export default function MyResults() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await getMySubmissions()
        if (!cancelled) setSubmissions(data)
      } catch (e) {
        if (!cancelled) setError(e?.message ?? 'Could not load your results.')
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
      <h1 className="h3 mb-4">My results</h1>

      {loading && <div className="alert alert-info">Loading your results…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && submissions.length === 0 && (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5 text-muted">
            You have not taken any exams yet.
          </div>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Exam</th>
                  <th scope="col">Status</th>
                  <th scope="col">Score</th>
                  <th scope="col">Result</th>
                  <th scope="col">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const status = STATUS_LABELS[s.status] ?? { text: s.status, cls: 'text-bg-light' }
                  const passed =
                    s.scorePercent != null &&
                    s.exam?.passPercent != null &&
                    s.scorePercent >= s.exam.passPercent
                  return (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.exam?.title ?? s.examId}</td>
                      <td>
                        <span className={`badge ${status.cls}`}>{status.text}</span>
                      </td>
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
