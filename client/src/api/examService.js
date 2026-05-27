import { mockDb } from './mockDb.js'
import { config } from '../services/config.js'

const delay = (ms = config.MOCK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

function nextExamId() {
  const nums = mockDb.exams
    .map((e) => {
      const m = String(e.id).match(/(\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `exam-${max + 1}`
}

function nextQuestionId(examId, existingQuestions = []) {
  const nums = existingQuestions
    .map((q) => {
      const m = String(q.id).match(/-q(\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `${examId}-q${max + 1}`
}

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

export function normalizeQuestion(question, examId) {
  const type = getQuestionType(question)
  const base = {
    id: question.id,
    examId,
    type,
    text: String(question.text ?? '').trim(),
    points: Math.max(1, Number(question.points) || 1),
    timeMinutes: getQuestionTimeMinutes(question),
  }

  if (type === 'multiple_choice') {
    const options = (question.options ?? []).map((o) => String(o).trim()).slice(0, 4)
    while (options.length < 4) options.push('')
    const correctIndex = Math.min(3, Math.max(0, Number(question.correctIndex) || 0))
    return { ...base, options, correctIndex }
  }

  return {
    ...base,
    correctAnswer: String(question.correctAnswer ?? '').trim(),
  }
}

function normalizeExamPayload(exam, { isNew, existingQuestions = [] } = {}) {
  const examId = isNew
    ? exam.id && String(exam.id).trim()
      ? String(exam.id).trim()
      : nextExamId()
    : exam.id

  const questions = []
  for (const q of exam.questions ?? []) {
    const normalized = normalizeQuestion(q, examId)
    const id =
      normalized.id && String(normalized.id).trim()
        ? String(normalized.id).trim()
        : nextQuestionId(examId, [...existingQuestions, ...questions])
    questions.push({ ...normalized, id })
  }

  return {
    id: examId,
    title: String(exam.title ?? '').trim(),
    description: String(exam.description ?? '').trim(),
    teacherId: exam.teacherId,
    durationMinutes: Math.max(1, Number(exam.durationMinutes) || 30),
    passPercent: Math.min(100, Math.max(0, Number(exam.passPercent) || 60)),
    isPublished: Boolean(exam.isPublished),
    createdAt: exam.createdAt ?? new Date().toISOString(),
    questions,
  }
}

export function validateExam(exam) {
  const errors = []
  if (!String(exam.title ?? '').trim()) {
    errors.push('Exam title is required.')
  }

  for (let i = 0; i < (exam.questions ?? []).length; i++) {
    const q = exam.questions[i]
    const label = `Question ${i + 1}`
    if (!String(q.text ?? '').trim()) {
      errors.push(`${label}: question text is required.`)
      continue
    }

    const type = getQuestionType(q)
    if (type === 'multiple_choice') {
      const options = (q.options ?? []).map((o) => String(o).trim())
      if (options.length < 4 || options.some((o) => !o)) {
        errors.push(`${label}: enter all four answer options.`)
      }
      const idx = Number(q.correctIndex)
      if (Number.isNaN(idx) || idx < 0 || idx > 3) {
        errors.push(`${label}: select the correct option.`)
      }
    } else if (!String(q.correctAnswer ?? '').trim()) {
      errors.push(`${label}: enter the expected answer for the open question.`)
    }
  }

  return errors
}

export async function getAllExams() {
  await delay()
  return mockDb.exams.map((e) => structuredClone(e))
}

export async function getExamsByTeacher(teacherId) {
  await delay()
  return mockDb.exams
    .filter((e) => e.teacherId === teacherId)
    .map((e) => structuredClone(e))
}

export async function getExamById(id) {
  await delay()
  const exam = mockDb.exams.find((e) => e.id === id)
  return exam ? structuredClone(exam) : null
}

export async function createExam(exam) {
  await delay()
  const normalized = normalizeExamPayload(exam, { isNew: true })
  const validationErrors = validateExam(normalized)
  if (validationErrors.length) {
    throw new Error(validationErrors.join(' '))
  }

  if (mockDb.exams.some((e) => e.id === normalized.id)) {
    throw new Error(`Exam ID "${normalized.id}" already exists.`)
  }

  mockDb.exams.push(normalized)
  return structuredClone(normalized)
}

export async function updateExam(id, exam) {
  await delay()
  const index = mockDb.exams.findIndex((e) => e.id === id)
  if (index === -1) {
    throw new Error('Exam not found.')
  }

  const existing = mockDb.exams[index]
  const normalized = normalizeExamPayload(
    { ...existing, ...exam, id },
    { isNew: false, existingQuestions: existing.questions },
  )
  const validationErrors = validateExam(normalized)
  if (validationErrors.length) {
    throw new Error(validationErrors.join(' '))
  }

  mockDb.exams[index] = normalized
  return structuredClone(normalized)
}

export async function deleteExam(id) {
  await delay()
  const index = mockDb.exams.findIndex((e) => e.id === id)
  if (index === -1) {
    throw new Error('Exam not found.')
  }
  mockDb.exams.splice(index, 1)
}
