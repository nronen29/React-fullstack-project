import { createApp } from './app.js'
import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { prisma } from './models/prismaClient.js'
import { seedIfEmpty } from './bootstrap/seedIfEmpty.js'

const app = createApp()

const server = app.listen(config.PORT, async () => {
  logger.info(`E-Test API listening on port ${config.PORT} (${config.NODE_ENV})`)
  // Populate demo data on first boot when the DB is empty (no shell needed).
  await seedIfEmpty()
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
