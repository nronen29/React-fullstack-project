import { http } from '../services/httpClient.js'

/**
 * Submits a student's exam attempt. Grading happens server-side.
 * @param {{
 *   exam: object,
 *   answers: Record<string, { selectedIndex?: number, textAnswer?: string }>,
 *   status: 'graded' | 'abandoned' | 'time_up',
 *   startedAt: string,
 * }} payload
 * @returns {Promise<{ submission: object, graded: object | null }>}
 */
export async function submitExamAttempt({ exam, answers, status, startedAt }) {
  return http.post('/submissions', {
    examId: exam.id,
    answers,
    status,
    startedAt,
  })
}

// Student: my past submissions with exam info.
export async function getMySubmissions() {
  const { submissions } = await http.get('/submissions/mine')
  return submissions
}

// Teacher: submissions for a given exam (with student identity).
export async function getSubmissionsForExam(examId) {
  const { submissions } = await http.get(`/submissions?examId=${encodeURIComponent(examId)}`)
  return submissions
}
