import { Router } from 'express'
import {
  listExams,
  listMyExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamStats,
} from '../controllers/examController.js'
import { authJwt, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { examSchema } from '../validators/schemas.js'

const router = Router()

// All exam routes require authentication.
router.use(authJwt)

router.get('/', listExams)
router.get('/mine', requireRole('teacher'), listMyExams)
router.get('/:id', getExam)
router.get('/:id/stats', requireRole('teacher'), getExamStats)

router.post('/', requireRole('teacher'), validate(examSchema), createExam)
router.put('/:id', requireRole('teacher'), validate(examSchema), updateExam)
router.delete('/:id', requireRole('teacher'), deleteExam)

export default router
