// Offline grader used when no LLM API key is configured.
// Scores a free-text answer by keyword overlap with the expected answer.

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'in',
  'on', 'at', 'it', 'its', 'that', 'this', 'for', 'with', 'as', 'by', 'be',
  'from', 'which', 'only', 'can', 'will', 'not',
])

function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))
}

export function gradeHeuristic({ expectedAnswer, studentAnswer, maxPoints }) {
  const expected = tokenize(expectedAnswer)
  const student = new Set(tokenize(studentAnswer))
  const points = Math.max(1, Number(maxPoints) || 1)

  if (!String(studentAnswer ?? '').trim()) {
    return { score: 0, isCorrect: false, feedback: 'No answer was provided.' }
  }
  if (expected.length === 0) {
    // No reference to compare against — give benefit of the doubt if non-empty.
    return { score: points, isCorrect: true, feedback: 'Answer recorded.' }
  }

  const matched = expected.filter((w) => student.has(w))
  const missing = [...new Set(expected.filter((w) => !student.has(w)))]
  const ratio = matched.length / expected.length
  const score = Math.round(points * ratio)
  const isCorrect = ratio >= 0.6

  let feedback
  if (isCorrect && ratio === 1) {
    feedback = 'Correct — your answer covers all the key points.'
  } else if (isCorrect) {
    feedback = `Mostly correct. Consider also mentioning: ${missing.slice(0, 4).join(', ')}.`
  } else {
    feedback = `Partially correct. Key ideas missing: ${missing.slice(0, 5).join(', ')}.`
  }

  return { score, isCorrect, feedback, similarity: Number(ratio.toFixed(2)) }
}
