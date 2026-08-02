import { http } from '../services/httpClient.js'

// ---------------------------------------------------------------------------
// Pure helpers (no network) — shared by teacher and student UI.
// ---------------------------------------------------------------------------

export const DEFAULT_QUESTION_MINUTES = 2

export function getQuestionTimeMinutes(question) {
  return Math.max(1, Number(question?.timeMinutes) || DEFAULT_QUESTION_MINUTES)
}

/** Total exam time in seconds — sum of each question's timeMinutes. */
export function getExamTimeLimitSeconds(exam) {
  const questions = exam?.questions ?? []
  if (questions.length === 0) {
    return Math.max(60, (Number(exam?.durationMinutes) || 30) * 60)
  }
  const totalMinutes = questions.reduce((sum, q) => sum + getQuestionTimeMinutes(q), 0)
  return totalMinutes * 60
}

export function formatTimeRemaining(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

/** @returns {'multiple_choice' | 'open'} */
export function getQuestionType(question) {
  if (question?.type === 'open' || question?.type === 'multiple_choice') {
    return question.type
  }
  return Array.isArray(question?.options) && question.options.length > 0
    ? 'multiple_choice'
    : 'open'
}

// ---------------------------------------------------------------------------
// Data access — talks to the backend API.
// ---------------------------------------------------------------------------

export async function getAllExams() {
  const { exams } = await http.get('/exams')
  return exams
}

export async function getExamsByTeacher() {
  const { exams } = await http.get('/exams/mine')
  return exams
}

export async function getExamById(id) {
  const { exam } = await http.get(`/exams/${encodeURIComponent(id)}`)
  return exam
}

export async function createExam(exam) {
  const { exam: created } = await http.post('/exams', exam)
  return created
}

export async function updateExam(id, exam) {
  const { exam: updated } = await http.put(`/exams/${encodeURIComponent(id)}`, exam)
  return updated
}

export async function deleteExam(id) {
  await http.delete(`/exams/${encodeURIComponent(id)}`)
}

export async function getExamStats(id) {
  const { stats } = await http.get(`/exams/${encodeURIComponent(id)}/stats`)
  return stats
}
