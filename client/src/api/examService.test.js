import { describe, test, expect } from 'vitest'
import {
  formatTimeRemaining,
  getExamTimeLimitSeconds,
  getQuestionTimeMinutes,
  getQuestionType,
} from './examService.js'

describe('formatTimeRemaining', () => {
  test('formats mm:ss and pads seconds', () => {
    expect(formatTimeRemaining(0)).toBe('0:00')
    expect(formatTimeRemaining(65)).toBe('1:05')
    expect(formatTimeRemaining(600)).toBe('10:00')
  })

  test('never goes negative', () => {
    expect(formatTimeRemaining(-30)).toBe('0:00')
  })
})

describe('getQuestionTimeMinutes', () => {
  test('defaults to 2 minutes and enforces a 1 minute floor', () => {
    expect(getQuestionTimeMinutes({})).toBe(2)
    expect(getQuestionTimeMinutes({ timeMinutes: 0 })).toBe(2)
    expect(getQuestionTimeMinutes({ timeMinutes: 7 })).toBe(7)
  })
})

describe('getExamTimeLimitSeconds', () => {
  test('sums per-question time when questions exist', () => {
    const exam = { questions: [{ timeMinutes: 5 }, { timeMinutes: 3 }] }
    expect(getExamTimeLimitSeconds(exam)).toBe(8 * 60)
  })

  test('falls back to durationMinutes with no questions', () => {
    expect(getExamTimeLimitSeconds({ durationMinutes: 10, questions: [] })).toBe(600)
  })
})

describe('getQuestionType', () => {
  test('respects explicit type and infers otherwise', () => {
    expect(getQuestionType({ type: 'open' })).toBe('open')
    expect(getQuestionType({ options: ['a', 'b'] })).toBe('multiple_choice')
    expect(getQuestionType({})).toBe('open')
  })
})
