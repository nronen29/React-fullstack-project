import { nextExamId, nextQuestionId, nextUserId, nextSubmissionId } from '../src/utils/ids.js'

describe('id generators', () => {
  test('nextExamId increments the max numeric suffix', () => {
    expect(nextExamId(['exam-1', 'exam-2', 'exam-10'])).toBe('exam-11')
    expect(nextExamId([])).toBe('exam-1')
  })

  test('nextQuestionId scopes to the exam', () => {
    expect(nextQuestionId('exam-3', ['exam-3-q1', 'exam-3-q2'])).toBe('exam-3-q3')
    expect(nextQuestionId('exam-9', [])).toBe('exam-9-q1')
  })

  test('nextUserId is role-prefixed', () => {
    expect(nextUserId('student', ['user-student-1', 'user-teacher-5'])).toBe('user-student-2')
    expect(nextUserId('teacher', ['user-student-1', 'user-teacher-5'])).toBe('user-teacher-6')
  })

  test('nextSubmissionId increments', () => {
    expect(nextSubmissionId(['sub-1', 'sub-4'])).toBe('sub-5')
  })
})
