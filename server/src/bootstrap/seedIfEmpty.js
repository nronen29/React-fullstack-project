import { prisma } from '../models/prismaClient.js'
import { logger } from '../utils/logger.js'
import { insertSeedData } from '../../prisma/seedData.js'

// Non-destructive auto-seed: only populates demo data when the database has no
// users yet. Safe to run on every boot (e.g. Render free tier without shell
// access) — it never overwrites existing data. Disable with AUTO_SEED=false.
export async function seedIfEmpty() {
  if (process.env.AUTO_SEED === 'false') return

  try {
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      logger.info(`Auto-seed skipped: ${userCount} users already exist.`)
      return
    }

    logger.info('Empty database detected — loading demo data...')
    const counts = await insertSeedData(prisma)
    logger.info(`Auto-seed complete: ${counts.users} users, ${counts.exams} exams, ${counts.submissions} submissions.`)
  } catch (err) {
    // Never block startup because of seeding.
    logger.error('Auto-seed failed', { message: err?.message })
  }
}
