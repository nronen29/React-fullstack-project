// Pure grading logic, ported from the original client-side submissionService.
// Kept framework-free so it is trivially unit-testable.

export function getQuestionType(question) {
  if (question?.type === 'open' || question?.type === 'multiple_choice') {
    return question.type
  }
  return Array.isArray(question?.options) && question.options.length > 0
    ? 'multiple_choice'
    : 'open'
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'in',
  'on', 'at', 'it', 'its', 'that', 'this', 'for', 'with', 'as', 'by', 'be',
  'from', 'which', 'only', 'can', 'will', 'not',
])

function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word))
}

const PASS_RATIO = 0.6

/**
 * Local scorer for one open answer, used when the AI grader is unreachable.
 * Mirrors the microservice heuristic (keyword overlap) rather than comparing
 * strings exactly, so punctuation or wording differences cost partial credit
 * instead of the whole question.
 */
export function scoreOpenAnswerLocally({ expectedAnswer, studentAnswer, maxPoints }) {
  const points = Math.max(1, Number(maxPoints) || 1)

  if (!String(studentAnswer ?? '').trim()) {
    return { score: 0, isCorrect: false, feedback: 'No answer provided.' }
  }

  const expected = tokenize(expectedAnswer)
  const student = new Set(tokenize(studentAnswer))

  if (expected.length === 0) {
    // No reference answer to compare against — give the benefit of the doubt.
    return { score: points, isCorrect: true, feedback: 'Answer recorded.' }
  }

  const matched = expected.filter((word) => student.has(word))
  const missing = [...new Set(expected.filter((word) => !student.has(word)))]
  const ratio = matched.length / expected.length
  const score = Math.round(points * ratio)
  const isCorrect = ratio >= PASS_RATIO

  let feedback
  if (ratio === 1) {
    feedback = 'Correct — your answer covers all the key points.'
  } else if (isCorrect) {
    feedback = `Mostly correct. Consider also mentioning: ${missing.slice(0, 4).join(', ')}.`
  } else {
    feedback = `Partially correct. Key ideas missing: ${missing.slice(0, 5).join(', ')}.`
  }

  return { score, isCorrect, feedback, similarity: Number(ratio.toFixed(2)) }
}

/**
 * @param {{questions: Array}} exam
 * @param {Record<string, { selectedIndex?: number, textAnswer?: string }>} answers
 */
export function gradeExamAttempt(exam, answers = {}) {
  const questions = exam?.questions ?? []
  let earnedPoints = 0
  let totalPoints = 0
  const questionResults = []

  for (const question of questions) {
    const points = Math.max(1, Number(question.points) || 1)
    totalPoints += points
    const response = answers[question.id]
    const type = getQuestionType(question)

    let answered = false
    let isCorrect = false

    if (type === 'multiple_choice') {
      const selected = response?.selectedIndex
      answered = selected !== undefined && selected !== null && selected !== ''
      isCorrect = answered && Number(selected) === Number(question.correctIndex)
    } else {
      const text = String(response?.textAnswer ?? '').trim()
      answered = text.length > 0
      isCorrect = answered && normalizeText(text) === normalizeText(question.correctAnswer)
    }

    if (isCorrect) earnedPoints += points

    questionResults.push({
      questionId: question.id,
      answered,
      isCorrect,
      points,
      earned: isCorrect ? points : 0,
    })
  }

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = scorePercent >= (Number(exam?.passPercent) || 0)

  return { earnedPoints, totalPoints, scorePercent, passed, questionResults }
}
