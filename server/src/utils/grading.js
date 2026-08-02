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
