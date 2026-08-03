import { jest } from '@jest/globals'
import { gradeExamAttempt, getQuestionType, scoreOpenAnswerLocally } from '../src/utils/grading.js'

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

describe('scoreOpenAnswerLocally', () => {
  const expectedAnswer =
    'A closure is a function that retains access to variables from its outer lexical scope.'

  test('ignores punctuation and casing differences', () => {
    const result = scoreOpenAnswerLocally({
      expectedAnswer,
      studentAnswer: 'a CLOSURE is a function that retains access to variables from its outer lexical scope',
      maxPoints: 20,
    })
    expect(result.score).toBe(20)
    expect(result.isCorrect).toBe(true)
  })

  test('awards partial credit instead of zero for an incomplete answer', () => {
    const result = scoreOpenAnswerLocally({
      expectedAnswer,
      studentAnswer: 'A function that retains access to its outer scope.',
      maxPoints: 20,
    })
    expect(result.score).toBeGreaterThan(0)
    expect(result.score).toBeLessThan(20)
  })

  test('scores an unrelated answer low and marks it incorrect', () => {
    const result = scoreOpenAnswerLocally({
      expectedAnswer,
      studentAnswer: 'A closure is a way to close a browser tab.',
      maxPoints: 20,
    })
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBeLessThan(10)
  })

  test('gives no credit for an empty answer', () => {
    const result = scoreOpenAnswerLocally({ expectedAnswer, studentAnswer: '   ', maxPoints: 20 })
    expect(result).toMatchObject({ score: 0, isCorrect: false })
  })

  test('does not punish the student when the exam has no reference answer', () => {
    const result = scoreOpenAnswerLocally({
      expectedAnswer: '',
      studentAnswer: 'Any reasonable explanation.',
      maxPoints: 20,
    })
    expect(result).toMatchObject({ score: 20, isCorrect: true })
  })
})
