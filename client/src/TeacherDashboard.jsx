import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './auth/AuthContext.jsx'
import {
  createExam,
  deleteExam,
  getExamById,
  getExamsByTeacher,
  getQuestionType,
  updateExam,
} from './api/examService.js'
import ExamEditor from './components/teacher/ExamEditor.jsx'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('list')
  const [editingExam, setEditingExam] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadExams = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getExamsByTeacher(user.id)
      setExams(data)
    } catch (e) {
      setError(e?.message ?? 'Failed to load exams')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  async function openCreate() {
    setEditingExam(null)
    setView('edit')
  }

  async function openEdit(examId) {
    try {
      setError(null)
      const exam = await getExamById(examId)
      if (!exam) {
        setError('Exam not found.')
        return
      }
      setEditingExam(exam)
      setView('edit')
    } catch (e) {
      setError(e?.message ?? 'Could not load exam')
    }
  }

  function closeEditor() {
    setView('list')
    setEditingExam(null)
  }

  async function handleSave(payload) {
    setSaving(true)
    try {
      if (editingExam?.id) {
        await updateExam(editingExam.id, payload)
      } else {
        await createExam({ ...payload, teacherId: user.id })
      }
      await loadExams()
      closeEditor()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(examId, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(examId)
    try {
      await deleteExam(examId)
      await loadExams()
      if (editingExam?.id === examId) closeEditor()
    } catch (e) {
      setError(e?.message ?? 'Could not delete exam')
    } finally {
      setDeletingId(null)
    }
  }

  if (view === 'edit') {
    return (
      <div className="container py-4">
        <ExamEditor
          initialExam={editingExam}
          teacherId={user?.id}
          onSave={handleSave}
          onCancel={closeEditor}
          saving={saving}
        />
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Teacher dashboard</h1>
          <p className="text-muted mb-0 small">
            Create and edit exams, add multiple-choice or open questions, and set correct answers.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Create exam
        </button>
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
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-3">You have no exams yet.</p>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Create your first exam
            </button>
          </div>
        </div>
      )}

      <div className="row g-3">
        {exams.map((exam) => {
          const mcCount = (exam.questions ?? []).filter(
            (q) => getQuestionType(q) === 'multiple_choice',
          ).length
          const openCount = (exam.questions ?? []).filter((q) => getQuestionType(q) === 'open').length

          return (
            <div key={exam.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h2 className="card-title h5 mb-0">{exam.title}</h2>
                    <span
                      className={`badge ${exam.isPublished ? 'text-bg-success' : 'text-bg-warning'}`}
                    >
                      {exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {exam.description && (
                    <p className="card-text text-muted small">{exam.description}</p>
                  )}
                  <p className="card-text small mb-2">
                    <code>{exam.id}</code>
                  </p>
                  <p className="card-text small text-muted mb-2">
                    {exam.durationMinutes} min · pass {exam.passPercent}%
                  </p>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    <span className="badge text-bg-primary">
                      {exam.questions?.length ?? 0} questions
                    </span>
                    {mcCount > 0 && (
                      <span className="badge text-bg-light text-dark border">
                        {mcCount} multiple choice
                      </span>
                    )}
                    {openCount > 0 && (
                      <span className="badge text-bg-light text-dark border">
                        {openCount} open
                      </span>
                    )}
                  </div>
                  <div className="mt-auto d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => openEdit(exam.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(exam.id, exam.title)}
                      disabled={deletingId === exam.id}
                    >
                      {deletingId === exam.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
