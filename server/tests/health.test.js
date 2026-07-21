import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

describe('API smoke tests', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', service: 'e-test-api' })
  })

  test('protected route rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/exams')
    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })

  test('unknown route returns 404 json', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.error.message).toMatch(/not found/i)
  })
})
