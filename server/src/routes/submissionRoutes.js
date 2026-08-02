import { Router } from 'express'
import { submitAttempt, listForExam, listMine } from '../controllers/submissionController.js'
import { authJwt, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { submissionSchema } from '../validators/schemas.js'

const router = Router()

router.use(authJwt)

router.post('/', requireRole('student'), validate(submissionSchema), submitAttempt)
router.get('/mine', requireRole('student'), listMine)
router.get('/', requireRole('teacher'), listForExam)

export default router
