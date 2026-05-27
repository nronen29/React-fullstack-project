import { useCallback, useEffect, useRef, useState } from 'react'
import {
  formatTimeRemaining,
  getExamTimeLimitSeconds,
  getQuestionTimeMinutes,
  getQuestionType,
} from '../../api/examService.js'
import { submitExamAttempt } from '../../api/submissionService.js'

export default function ExamSession({ exam, studentId, onComplete }) {
  const totalSeconds = getExamTimeLimitSeconds(exam)
  const [endsAt] = useState(() => Date.now() + totalSeconds * 1000)
  const [startedAt] = useState(() => new Date().toISOString())
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const finishedRef = useRef(false)
  const finishAttemptRef = useRef(null)

  const setMcAnswer = (questionId, selectedIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedIndex },
    }))
  }

  const setOpenAnswer = (questionId, textAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], textAnswer },
    }))
  }

  const finishAttempt = useCallback(
    async (status) => {
      if (finishedRef.current || submitting) return
      finishedRef.current = true
      setSubmitting(true)
      setError(null)
      try {
        const result = await submitExamAttempt({
          exam,
          studentId,
          answers,
          status,
          startedAt,
        })
        onComplete({ status, result, exam })
      } catch (e) {
        finishedRef.current = false
        setError(e?.message ?? 'Could not submit exam.')
        setSubmitting(false)
      }
    },
    [answers, exam, onComplete, startedAt, studentId, submitting],
  )

  useEffect(() => {
    finishAttemptRef.current = finishAttempt
  }, [finishAttempt])

  useEffect(() => {
    const tick = () => {
      const left = (endsAt - Date.now()) / 1000
      setRemainingSeconds(left)
      if (left <= 0 && !finishedRef.current) {
        finishAttemptRef.current?.('time_up')
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  function handleSubmitClick() {
    const unanswered = (exam.questions ?? []).filter((q) => {
      const a = answers[q.id]
      const type = getQuestionType(q)
      if (type === 'multiple_choice') {
        return a?.selectedIndex === undefined || a?.selectedIndex === null
      }
      return !String(a?.textAnswer ?? '').trim()
    })

    if (unanswered.length > 0) {
      const proceed = window.confirm(
        `${unanswered.length} question(s) are unanswered. Submit anyway?`,
      )
      if (!proceed) return
    }

    finishAttempt('graded')
  }

  function handleLeaveClick() {
    const proceed = window.confirm(
      'Leave this exam? Your progress will not be saved and the attempt will be marked as abandoned.',
    )
    if (!proceed) return
    finishAttempt('abandoned')
  }

  const isUrgent = remainingSeconds <= 60
  const isCritical = remainingSeconds <= 15

  return (
    <div>
      <div
        className={`card shadow-sm mb-4 border-2 sticky-top ${isCritical ? 'border-danger' : isUrgent ? 'border-warning' : ''}`}
        style={{ top: '0.5rem', zIndex: 1020 }}
      >
        <div className="card-body py-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 className="h5 mb-1">{exam.title}</h2>
              <p className="text-muted small mb-0">
                Total time: {formatTimeRemaining(totalSeconds)} (
                {exam.questions?.length ?? 0} questions)
              </p>
            </div>
            <div
              className={`display-6 fw-bold mb-0 tabular-nums ${isCritical ? 'text-danger' : isUrgent ? 'text-warning' : 'text-primary'}`}
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatTimeRemaining(remainingSeconds)}
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleLeaveClick}
                disabled={submitting}
              >
                Leave exam
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmitClick}
                disabled={submitting || remainingSeconds <= 0}
              >
                {submitting ? 'Submitting…' : 'Submit exam'}
              </button>
            </div>
          </div>
          {remainingSeconds <= 0 && !submitting && (
            <p className="text-danger small mb-0 mt-2">Time is up — submitting your answers…</p>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm">
        <ul className="list-group list-group-flush">
          {(exam.questions ?? []).map((q, index) => {
            const type = getQuestionType(q)
            const answer = answers[q.id]
            return (
              <li key={q.id ?? index} className="list-group-item">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <p className="fw-semibold mb-0">
                    {index + 1}. {q.text}
                  </p>
                  <div className="d-flex gap-1">
                    <span className="badge text-bg-secondary">
                      {type === 'open' ? 'Open' : '4 options'}
                    </span>
                    <span className="badge text-bg-light text-dark border">
                      {getQuestionTimeMinutes(q)} min
                    </span>
                    <span className="badge text-bg-light text-dark border">{q.points} pts</span>
                  </div>
                </div>
                {type === 'multiple_choice' && Array.isArray(q.options) && (
                  <div className="vstack gap-2">
                    {q.options.map((opt, i) => (
                      <label
                        key={i}
                        className={`form-check border rounded px-3 py-2 mb-0 ${answer?.selectedIndex === i ? 'border-primary bg-light' : ''}`}
                      >
                        <input
                          type="radio"
                          className="form-check-input"
                          name={`q-${q.id}`}
                          checked={answer?.selectedIndex === i}
                          onChange={() => setMcAnswer(q.id, i)}
                          disabled={submitting}
                        />
                        <span className="form-check-label ms-1">
                          {String.fromCharCode(65 + i)}. {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {type === 'open' && (
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Type your answer here…"
                    value={answer?.textAnswer ?? ''}
                    onChange={(e) => setOpenAnswer(q.id, e.target.value)}
                    disabled={submitting}
                    aria-label={`Answer for question ${index + 1}`}
                  />
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleLeaveClick}
          disabled={submitting}
        >
          Leave exam
        </button>
        <button
          type="button"
          className="btn btn-success"
          onClick={handleSubmitClick}
          disabled={submitting || remainingSeconds <= 0}
        >
          {submitting ? 'Submitting…' : 'Submit exam'}
        </button>
      </div>
    </div>
  )
}
