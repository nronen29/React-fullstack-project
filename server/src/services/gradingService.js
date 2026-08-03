import { getQuestionType, scoreOpenAnswerLocally } from '../utils/grading.js'
import { gradeOpenAnswer } from './aiGraderClient.js'

// Async grading: multiple-choice is scored locally (instant); open-ended
// answers are sent to the AI grading microservice, with a local keyword-overlap
// fallback if the service is disabled or unreachable. Supports partial credit
// and per-question feedback.
export async function gradeAttempt(exam, answers = {}) {
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
    let earned = 0
    let feedback = null

    if (type === 'multiple_choice') {
      const selected = response?.selectedIndex
      answered = selected !== undefined && selected !== null && selected !== ''
      isCorrect = answered && Number(selected) === Number(question.correctIndex)
      earned = isCorrect ? points : 0
    } else {
      const text = String(response?.textAnswer ?? '').trim()
      answered = text.length > 0

      const ai = answered
        ? await gradeOpenAnswer({
            questionText: question.text,
            expectedAnswer: question.correctAnswer,
            studentAnswer: text,
            maxPoints: points,
          })
        : null

      if (ai) {
        earned = Math.max(0, Math.min(points, Number(ai.score) || 0))
        isCorrect = Boolean(ai.isCorrect)
        feedback = ai.feedback ?? null
      } else {
        const local = scoreOpenAnswerLocally({
          expectedAnswer: question.correctAnswer,
          studentAnswer: text,
          maxPoints: points,
        })
        earned = local.score
        isCorrect = local.isCorrect
        feedback = local.feedback
      }
    }

    earnedPoints += earned
    questionResults.push({ questionId: question.id, answered, isCorrect, points, earned, feedback })
  }

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = scorePercent >= (Number(exam?.passPercent) || 0)

  return { earnedPoints, totalPoints, scorePercent, passed, questionResults }
}
