import { useState } from 'react'
import { useAuth } from './auth/useAuth.js'
import { getExamById, getQuestionType } from './api/examService.js'
import ExamSession from './components/student/ExamSession.jsx'

export default function StudentPortal() {
  const { user } = useAuth()
  const [examId, setExamId] = useState('')
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('browse')
  const [outcome, setOutcome] = useState(null)

  async function handleStart() {
    const id = examId.trim()
    if (!id) {
      setError('Please enter an exam ID.')
      return
    }
    setLoading(true)
    setError(null)
    setOutcome(null)
    try {
      const data = await getExamById(id)
      if (!data) {
        setError(`No exam found for ID “${id}”.`)
        return
      }
      if (!data.isPublished) {
        setError('This exam is not published yet. Ask your teacher to publish it.')
        return
      }
      if (!data.questions?.length) {
        setError('This exam has no questions yet.')
        return
      }
      setExam(data)
      setPhase('taking')
    } catch (e) {
      setError(e?.message ?? 'Could not load the exam.')
    } finally {
      setLoading(false)
    }
  }

  function handleExamComplete({ status, result, exam: completedExam }) {
    setExam(null)
    setPhase('browse')
    setOutcome({ status, result, exam: completedExam })
  }

  function dismissOutcome() {
    setOutcome(null)
  }

  // Per-question AI feedback for open (written) answers, if any.
  const feedbackItems = (outcome?.result?.graded?.questionResults ?? [])
    .map((r) => {
      const q = outcome?.exam?.questions?.find((qq) => qq.id === r.questionId)
      if (!q || getQuestionType(q) !== 'open') return null
      return { id: r.questionId, text: q.text, earned: r.earned, points: r.points, feedback: r.feedback }
    })
    .filter(Boolean)

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">Student portal</h1>
        <span className="badge text-bg-secondary">E-Test System</span>
      </div>

      {phase === 'browse' && (
        <>
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
                Try <code>exam-1</code> or <code>exam-2</code>. The timer is the sum of each
                question&apos;s time limit.
              </p>
            </div>
          </div>

          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}

          {outcome && (
            <div
              className={`alert ${outcome.status === 'abandoned' ? 'alert-secondary' : outcome.result?.graded?.passed ? 'alert-success' : 'alert-info'} shadow-sm`}
              role="status"
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  {outcome.status === 'abandoned' && (
                    <>
                      <h2 className="h6 alert-heading">Exam left</h2>
                      <p className="mb-0">
                        You left <strong>{outcome.exam?.title}</strong> before time ran out. No
                        score was recorded.
                      </p>
                    </>
                  )}
                  {outcome.status === 'time_up' && outcome.result?.graded && (
                    <>
                      <h2 className="h6 alert-heading">Time&apos;s up — exam submitted</h2>
                      <p className="mb-1">
                        <strong>{outcome.exam?.title}</strong>: {outcome.result.graded.scorePercent}
                        % ({outcome.result.graded.earnedPoints} / {outcome.result.graded.totalPoints}{' '}
                        points)
                      </p>
                      <p className="mb-0 small">
                        {outcome.result.graded.passed
                          ? 'You met the pass requirement.'
                          : `Pass grade is ${outcome.exam?.passPercent}%.`}
                      </p>
                    </>
                  )}
                  {outcome.status === 'graded' && outcome.result?.graded && (
                    <>
                      <h2 className="h6 alert-heading">Exam submitted</h2>
                      <p className="mb-1">
                        <strong>{outcome.exam?.title}</strong>: {outcome.result.graded.scorePercent}
                        % ({outcome.result.graded.earnedPoints} / {outcome.result.graded.totalPoints}{' '}
                        points)
                      </p>
                      <p className="mb-0 small">
                        {outcome.result.graded.passed
                          ? 'Congratulations — you passed!'
                          : `You need ${outcome.exam?.passPercent}% to pass.`}
                      </p>
                    </>
                  )}
                  {feedbackItems.length > 0 && (
                    <div className="mt-3">
                      <h3 className="h6 mb-1">AI feedback on written answers</h3>
                      <ul className="small mb-0 ps-3">
                        {feedbackItems.map((it) => (
                          <li key={it.id} className="mb-1">
                            <span className="fw-semibold">
                              {it.earned}/{it.points} pts
                            </span>
                            {it.feedback ? ` — ${it.feedback}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Dismiss"
                  onClick={dismissOutcome}
                />
              </div>
            </div>
          )}
        </>
      )}

      {phase === 'taking' && exam && user?.id && (
        <ExamSession exam={exam} studentId={user.id} onComplete={handleExamComplete} />
      )}

      {phase === 'taking' && exam && !user?.id && (
        <div className="alert alert-warning">You must be logged in to take an exam.</div>
      )}
    </div>
  )
}
