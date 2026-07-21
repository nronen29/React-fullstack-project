import { createApp } from './app.js'
import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { prisma } from './models/prismaClient.js'

const app = createApp()

const server = app.listen(config.PORT, () => {
  logger.info(`E-Test API listening on port ${config.PORT} (${config.NODE_ENV})`)
})

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
