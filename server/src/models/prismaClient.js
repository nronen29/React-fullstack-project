import { PrismaClient } from '@prisma/client'
import { config } from '../config/index.js'

// A single shared Prisma client instance for the whole app.
export const prisma = new PrismaClient({
  log: config.isProduction ? ['warn', 'error'] : ['warn', 'error'],
})
