import { jest } from '@jest/globals'
import { gradeExamAttempt, getQuestionType } from '../src/utils/grading.js'

const exam = {
  passPercent: 60,
  questions: [
    { id: 'q1', type: 'multiple_choice', options: ['a', 'b', 'c', 'd'], correctIndex: 2, points: 50 },
    { id: 'q2', type: 'open', correctAnswer: 'Closure', points: 50 },
  ],
}

describe('getQuestionType', () => {
  test('respects explicit type', () => {
    expect(getQuestionType({ type: 'open' })).toBe('open')
    expect(getQuestionType({ type: 'multiple_choice' })).toBe('multiple_choice')
  })

  test('infers from options when type missing', () => {
    expect(getQuestionType({ options: ['a', 'b'] })).toBe('multiple_choice')
    expect(getQuestionType({})).toBe('open')
  })
})

describe('gradeExamAttempt', () => {
  test('scores a fully correct attempt as 100 and passed', () => {
    const result = gradeExamAttempt(exam, {
      q1: { selectedIndex: 2 },
      q2: { textAnswer: 'closure' }, // case-insensitive match
    })
    expect(result.scorePercent).toBe(100)
    expect(result.earnedPoints).toBe(100)
    expect(result.passed).toBe(true)
  })

  test('scores a half-correct attempt as 50 and failed against passPercent 60', () => {
    const result = gradeExamAttempt(exam, {
      q1: { selectedIndex: 0 }, // wrong
      q2: { textAnswer: 'Closure' }, // correct
    })
    expect(result.scorePercent).toBe(50)
    expect(result.passed).toBe(false)
  })

  test('unanswered questions count as incorrect', () => {
    const result = gradeExamAttempt(exam, {})
    expect(result.scorePercent).toBe(0)
    expect(result.questionResults.every((q) => q.answered === false)).toBe(true)
  })

  test('handles empty exam without dividing by zero', () => {
    const result = gradeExamAttempt({ passPercent: 50, questions: [] }, {})
    expect(result.scorePercent).toBe(0)
    expect(result.totalPoints).toBe(0)
  })
})
