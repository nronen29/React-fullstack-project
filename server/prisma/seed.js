// CLI seed script. Destructive: clears all tables, then loads the demo data.
// Run with `npm run seed`.

import { PrismaClient } from '@prisma/client'
import { insertSeedData } from './seedData.js'

const prisma = new PrismaClient()

async function main() {
  // Clear in FK-safe order.
  await prisma.answer.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.question.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.user.deleteMany()

  const counts = await insertSeedData(prisma)
  console.log(`Seeded ${counts.users} users, ${counts.exams} exams, ${counts.submissions} submissions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
