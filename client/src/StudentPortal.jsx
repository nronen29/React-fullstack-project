import { useState } from 'react'
import { getExamById } from './api/examService.js'

export default function StudentPortal() {
  const [examId, setExamId] = useState('')
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleStart() {
    const id = examId.trim()
    if (!id) {
      setError('Please enter an exam ID.')
      setExam(null)
      return
    }
    setLoading(true)
    setError(null)
    setExam(null)
    try {
      const data = await getExamById(id)
      if (!data) {
        setError(`No exam found for ID “${id}”.`)
        return
      }
      setExam(data)
    } catch (e) {
      setError(e?.message ?? 'Could not load the exam.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">Student portal</h1>
        <span className="badge text-bg-secondary">E-Test System</span>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label htmlFor="exam-id-input" className="form-label fw-semibold">
            Enter Exam ID to start
          </label>
          <div className="input-group">
            <input
              id="exam-id-input"
              type="text"
              className="form-control"
              placeholder="e.g. exam-1"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              autoComplete="off"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Start exam'}
            </button>
          </div>
          <p className="form-text mb-0">
            Try <code>exam-1</code> or <code>exam-2</code> with the sample data.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {exam && (
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="h5 mb-0">{exam.title}</h2>
            <small className="text-muted">ID: {exam.id}</small>
          </div>
          <ul className="list-group list-group-flush">
            {(exam.questions ?? []).map((q, index) => (
              <li key={q.id ?? index} className="list-group-item">
                <p className="fw-semibold mb-2">
                  {index + 1}. {q.text}
                </p>
                {Array.isArray(q.options) && (
                  <ol className="mb-0 small text-muted">
                    {q.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
