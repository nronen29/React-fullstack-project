import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { grade } from './grader.js'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '256kb' }))

  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', service: 'ai-grader', mode: config.AI_API_KEY ? 'llm' : 'heuristic' }),
  )

  // Simple shared-secret auth between the main API and this service.
  app.use((req, res, next) => {
    if (!config.SERVICE_KEY) return next()
    if (req.headers['x-service-key'] === config.SERVICE_KEY) return next()
    return res.status(401).json({ error: { message: 'Invalid or missing service key' } })
  })

  app.post('/grade', async (req, res) => {
    const { questionText, expectedAnswer, studentAnswer, maxPoints } = req.body ?? {}
    if (maxPoints == null) {
      return res.status(400).json({ error: { message: 'maxPoints is required' } })
    }
    try {
      const result = await grade({ questionText, expectedAnswer, studentAnswer, maxPoints })
      return res.json(result)
    } catch {
      return res.status(500).json({ error: { message: 'Grading failed' } })
    }
  })

  return app
}
