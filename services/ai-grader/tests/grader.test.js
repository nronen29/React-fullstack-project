import request from 'supertest'
import { gradeHeuristic } from '../src/heuristic.js'
import { createApp } from '../src/app.js'

describe('gradeHeuristic', () => {
  const base = { questionText: 'What does a closure preserve?', expectedAnswer: 'its outer lexical environment', maxPoints: 10 }

  test('full marks for a semantically matching answer', () => {
    const r = gradeHeuristic({ ...base, studentAnswer: 'It preserves the outer lexical environment.' })
    expect(r.isCorrect).toBe(true)
    expect(r.score).toBe(10)
  })

  test('partial/zero for an unrelated answer', () => {
    const r = gradeHeuristic({ ...base, studentAnswer: 'The DOM tree and network cache.' })
    expect(r.isCorrect).toBe(false)
    expect(r.score).toBeLessThan(10)
  })

  test('empty answer scores zero', () => {
    const r = gradeHeuristic({ ...base, studentAnswer: '   ' })
    expect(r.score).toBe(0)
    expect(r.isCorrect).toBe(false)
  })
})

describe('POST /grade', () => {
  const app = createApp()

  test('health endpoint works', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.service).toBe('ai-grader')
  })

  test('grades an answer and returns score + feedback', async () => {
    const res = await request(app).post('/grade').send({
      questionText: 'Capital of France?',
      expectedAnswer: 'Paris',
      studentAnswer: 'Paris',
      maxPoints: 5,
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('score')
    expect(res.body).toHaveProperty('feedback')
    expect(res.body.isCorrect).toBe(true)
  })

  test('rejects missing maxPoints', async () => {
    const res = await request(app).post('/grade').send({ studentAnswer: 'x' })
    expect(res.status).toBe(400)
  })
})
