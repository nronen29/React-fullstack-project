// Human-friendly, sequential ID helpers so exam/question IDs stay readable
// (e.g. "exam-4", "exam-4-q2") the way students expect to type them.

function maxSuffix(values, regex) {
  let max = 0
  for (const value of values) {
    const match = String(value).match(regex)
    if (match) {
      const n = parseInt(match[1], 10)
      if (!Number.isNaN(n) && n > max) max = n
    }
  }
  return max
}

export function nextExamId(existingIds) {
  return `exam-${maxSuffix(existingIds, /(\d+)$/) + 1}`
}

export function nextQuestionId(examId, existingQuestionIds) {
  return `${examId}-q${maxSuffix(existingQuestionIds, /-q(\d+)$/) + 1}`
}

export function nextUserId(role, existingIds) {
  const prefix = role === 'teacher' ? 'user-teacher-' : 'user-student-'
  const scoped = existingIds.filter((id) => String(id).startsWith(prefix))
  return `${prefix}${maxSuffix(scoped, /(\d+)$/) + 1}`
}

export function nextSubmissionId(existingIds) {
  return `sub-${maxSuffix(existingIds, /(\d+)$/) + 1}`
}

export function nextAnswerId(existingIds) {
  return `ans-${maxSuffix(existingIds, /(\d+)$/) + 1}`
}
