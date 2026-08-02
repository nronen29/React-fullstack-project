import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import routes from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  const corsOptions =
    config.CORS_ORIGIN === '*'
      ? { origin: true }
      : { origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()) }

  app.use(cors(corsOptions))
  app.use(express.json({ limit: '1mb' }))

  if (!config.isTest) {
    app.use(
      morgan(config.isProduction ? 'combined' : 'dev', {
        stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
      }),
    )
  }

  app.get('/', (_req, res) => res.json({ service: 'E-Test System API', docs: '/api/health' }))
  app.use('/api', routes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
