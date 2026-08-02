import { useState } from 'react'
import { formatTimeRemaining, getExamTimeLimitSeconds } from '../../api/examService.js'
import { emptyQuestion, examToFormState } from './examFormState.js'

const EMPTY_OPTION = ['', '', '', '']

function QuestionFields({ question, index, onChange, onRemove }) {
  const update = (patch) => onChange(index, { ...question, ...patch })

  const setType = (type) => {
    if (type === question.type) return
    if (type === 'open') {
      onChange(index, {
        ...question,
        type: 'open',
        options: [...EMPTY_OPTION],
        correctIndex: 0,
      })
    } else {
      onChange(index, {
        ...question,
        type: 'multiple_choice',
        correctAnswer: '',
        options: question.options?.length === 4 ? question.options : [...EMPTY_OPTION],
      })
    }
  }

  return (
    <div className="card border mb-3">
      <div className="card-header d-flex justify-content-between align-items-center py-2">
        <span className="fw-semibold">Question {index + 1}</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onRemove(index)}
          aria-label={`Remove question ${index + 1}`}
        >
          Remove
        </button>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <span className="form-label d-block">Question type</span>
          <div className="btn-group" role="group" aria-label="Question type">
            <input
              type="radio"
              className="btn-check"
              name={`q-type-${index}`}
              id={`q-mc-${index}`}
              checked={question.type === 'multiple_choice'}
              onChange={() => setType('multiple_choice')}
            />
            <label className="btn btn-outline-primary btn-sm" htmlFor={`q-mc-${index}`}>
              4 options
            </label>
            <input
              type="radio"
              className="btn-check"
              name={`q-type-${index}`}
              id={`q-open-${index}`}
              checked={question.type === 'open'}
              onChange={() => setType('open')}
            />
            <label className="btn btn-outline-primary btn-sm" htmlFor={`q-open-${index}`}>
              Open question
            </label>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor={`q-text-${index}`}>
            Question text
          </label>
          <textarea
            id={`q-text-${index}`}
            className="form-control"
            rows={2}
            value={question.text}
            onChange={(e) => update({ text: e.target.value })}
            required
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor={`q-points-${index}`}>
              Points
            </label>
            <input
              id={`q-points-${index}`}
              type="number"
              min={1}
              className="form-control"
              value={question.points}
              onChange={(e) => update({ points: Number(e.target.value) })}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor={`q-time-${index}`}>
              Time (minutes)
            </label>
            <input
              id={`q-time-${index}`}
              type="number"
              min={1}
              className="form-control"
              value={question.timeMinutes}
              onChange={(e) => update({ timeMinutes: Number(e.target.value) })}
            />
          </div>
        </div>

        {question.type === 'multiple_choice' ? (
          <>
            <p className="form-label mb-2">Answer options (mark the correct one)</p>
            {question.options.map((opt, optIndex) => (
              <div key={optIndex} className="input-group mb-2">
                <span className="input-group-text">
                  <input
                    type="radio"
                    name={`q-correct-${index}`}
                    checked={question.correctIndex === optIndex}
                    onChange={() => update({ correctIndex: optIndex })}
                    aria-label={`Option ${optIndex + 1} is correct`}
                  />
                </span>
                <span className="input-group-text">{String.fromCharCode(65 + optIndex)}</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Option ${optIndex + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const options = [...question.options]
                    options[optIndex] = e.target.value
                    update({ options })
                  }}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="mb-0">
            <label className="form-label" htmlFor={`q-answer-${index}`}>
              Expected answer
            </label>
            <textarea
              id={`q-answer-${index}`}
              className="form-control"
              rows={2}
              placeholder="Enter the correct answer students should match"
              value={question.correctAnswer}
              onChange={(e) => update({ correctAnswer: e.target.value })}
              required
            />
            <p className="form-text mb-0">
              Used for auto-checking (case-insensitive match when students submit).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExamEditor({ initialExam, teacherId, onSave, onCancel, saving }) {
  const isNew = !initialExam?.id
  const [form, setForm] = useState(() => examToFormState(initialExam))
  const [error, setError] = useState(null)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateQuestion = (index, question) => {
    setForm((prev) => {
      const questions = [...prev.questions]
      questions[index] = question
      return { ...prev, questions }
    })
  }

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion()],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const payload = {
      ...(initialExam ?? {}),
      title: form.title,
      description: form.description,
      durationMinutes: form.durationMinutes,
      passPercent: form.passPercent,
      isPublished: form.isPublished,
      teacherId: teacherId ?? initialExam?.teacherId,
      questions: form.questions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        points: q.points,
        timeMinutes: q.timeMinutes,
        ...(q.type === 'multiple_choice'
          ? { options: q.options, correctIndex: q.correctIndex }
          : { correctAnswer: q.correctAnswer }),
      })),
    }

    try {
      await onSave(payload)
    } catch (err) {
      setError(err?.message ?? 'Could not save exam.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="h4 mb-0">{isNew ? 'Create exam' : 'Edit exam'}</h2>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save exam'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="h6 text-muted text-uppercase mb-3">Exam details</h3>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label" htmlFor="exam-title">
                Title
              </label>
              <input
                id="exam-title"
                type="text"
                className="form-control"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="exam-desc">
                Description
              </label>
              <textarea
                id="exam-desc"
                className="form-control"
                rows={2}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="exam-duration">
                Duration (minutes)
              </label>
              <input
                id="exam-duration"
                type="number"
                min={1}
                className="form-control"
                value={form.durationMinutes}
                onChange={(e) => updateField('durationMinutes', Number(e.target.value))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="exam-pass">
                Pass grade (%)
              </label>
              <input
                id="exam-pass"
                type="number"
                min={0}
                max={100}
                className="form-control"
                value={form.passPercent}
                onChange={(e) => updateField('passPercent', Number(e.target.value))}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check form-switch mb-2">
                <input
                  id="exam-published"
                  className="form-check-input"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateField('isPublished', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="exam-published">
                  Published (visible to students)
                </label>
              </div>
            </div>
          </div>
          {!isNew && (
            <p className="form-text mb-0 mt-2">
              Exam ID: <code>{initialExam.id}</code> — share this with students to start the test.
            </p>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="h5 mb-0">Questions ({form.questions.length})</h3>
          {form.questions.length > 0 && (
            <p className="text-muted small mb-0">
              Total exam time:{' '}
              {formatTimeRemaining(
                getExamTimeLimitSeconds({ questions: form.questions }),
              )}
            </p>
          )}
        </div>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={addQuestion}>
          + Add question
        </button>
      </div>

      {form.questions.length === 0 && (
        <p className="text-muted">No questions yet. Add at least one before publishing.</p>
      )}

      {form.questions.map((q, index) => (
        <QuestionFields
          key={q.id || `new-${index}`}
          question={q}
          index={index}
          onChange={updateQuestion}
          onRemove={removeQuestion}
        />
      ))}

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save exam'}
        </button>
      </div>
    </form>
  )
}
