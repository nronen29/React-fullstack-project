import { mockDb } from './mockDb.js'
import { getQuestionType } from './examService.js'
import { config } from '../services/config.js'

const delay = (ms = config.MOCK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

function nextSubmissionId() {
  const nums = mockDb.submissions
    .map((s) => {
      const m = String(s.id).match(/(\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `sub-${max + 1}`
}

function nextAnswerId() {
  const nums = mockDb.answers
    .map((a) => {
      const m = String(a.id).match(/(\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `ans-${max + 1}`
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

/** @param {Record<string, { selectedIndex?: number, textAnswer?: string }>} answers */
export function gradeExamAttempt(exam, answers) {
  const questions = exam?.questions ?? []
  let earnedPoints = 0
  let totalPoints = 0
  const questionResults = []

  for (const question of questions) {
    const points = Math.max(1, Number(question.points) || 1)
    totalPoints += points
    const response = answers[question.id]
    const type = getQuestionType(question)
    const { answered, isCorrect } =
      type === 'multiple_choice'
        ? (() => {
            const selected = response?.selectedIndex
            const hasAnswer =
              selected !== undefined && selected !== null && selected !== ''
            return {
              answered: hasAnswer,
              isCorrect:
                hasAnswer && Number(selected) === Number(question.correctIndex),
            }
          })()
        : (() => {
            const text = String(response?.textAnswer ?? '').trim()
            const hasAnswer = text.length > 0
            return {
              answered: hasAnswer,
              isCorrect:
                hasAnswer &&
                normalizeText(text) === normalizeText(question.correctAnswer),
            }
          })()

    if (isCorrect) earnedPoints += points

    questionResults.push({
      questionId: question.id,
      answered,
      isCorrect,
      points,
      earned: isCorrect ? points : 0,
    })
  }

  const scorePercent =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = scorePercent >= (Number(exam.passPercent) || 0)

  return {
    earnedPoints,
    totalPoints,
    scorePercent,
    passed,
    questionResults,
  }
}

/**
 * @param {{
 *   exam: object,
 *   studentId: string,
 *   answers: Record<string, { selectedIndex?: number, textAnswer?: string }>,
 *   status: 'graded' | 'abandoned' | 'time_up',
 *   startedAt: string,
 * }} payload
 */
export async function submitExamAttempt(payload) {
  await delay()
  const { exam, studentId, answers, status, startedAt } = payload
  const submittedAt = new Date().toISOString()
  const submissionId = nextSubmissionId()

  if (status === 'abandoned') {
    const submission = {
      id: submissionId,
      examId: exam.id,
      studentId,
      status: 'abandoned',
      startedAt,
      submittedAt,
      scorePercent: null,
    }
    mockDb.submissions.push(submission)
    return { submission, graded: null }
  }

  const graded = gradeExamAttempt(exam, answers)
  const submission = {
    id: submissionId,
    examId: exam.id,
    studentId,
    status: status === 'time_up' ? 'graded' : 'graded',
    startedAt,
    submittedAt,
    scorePercent: graded.scorePercent,
  }
  mockDb.submissions.push(submission)

  for (const result of graded.questionResults) {
    const question = exam.questions.find((q) => q.id === result.questionId)
    const response = answers[result.questionId]
    const type = getQuestionType(question)
    mockDb.answers.push({
      id: nextAnswerId(),
      submissionId,
      questionId: result.questionId,
      ...(type === 'multiple_choice'
        ? {
            selectedIndex:
              response?.selectedIndex !== undefined && response?.selectedIndex !== null
                ? Number(response.selectedIndex)
                : null,
          }
        : { textAnswer: String(response?.textAnswer ?? '') }),
      isCorrect: result.isCorrect,
    })
  }

  return { submission, graded }
}
