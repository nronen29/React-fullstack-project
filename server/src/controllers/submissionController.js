import { asyncHandler } from '../utils/asyncHandler.js'
import * as submissionService from '../services/submissionService.js'
import { ApiError } from '../utils/ApiError.js'

export const submitAttempt = asyncHandler(async (req, res) => {
  const result = await submissionService.submitAttempt({
    ...req.body,
    studentId: req.user.id,
  })
  res.status(201).json(result)
})

export const listForExam = asyncHandler(async (req, res) => {
  const { examId } = req.query
  if (!examId) throw ApiError.badRequest('examId query parameter is required')
  const submissions = await submissionService.listSubmissionsForExam(examId, req.user.id)
  res.json({ submissions })
})

export const listMine = asyncHandler(async (req, res) => {
  const submissions = await submissionService.listMySubmissions(req.user.id)
  res.json({ submissions })
})
