import { Router } from 'express'
import authRoutes from './authRoutes.js'
import examRoutes from './examRoutes.js'
import submissionRoutes from './submissionRoutes.js'

const router = Router()

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'e-test-api' }))
router.use('/auth', authRoutes)
router.use('/exams', examRoutes)
router.use('/submissions', submissionRoutes)

export default router
