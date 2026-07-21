import { asyncHandler } from '../utils/asyncHandler.js'
import * as examService from '../services/examService.js'

export const listExams = asyncHandler(async (req, res) => {
  // Teachers browsing the generic list still only get published exams here;
  // their own management list is served by GET /exams/mine.
  const exams = await examService.listPublishedExams()
  res.json({ exams })
})

export const listMyExams = asyncHandler(async (req, res) => {
  const exams = await examService.listExamsByTeacher(req.user.id)
  res.json({ exams })
})

export const getExam = asyncHandler(async (req, res) => {
  const exam = await examService.getExamForUser(req.params.id, req.user)
  res.json({ exam })
})

export const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body, req.user.id)
  res.status(201).json({ exam })
})

export const updateExam = asyncHandler(async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body, req.user.id)
  res.json({ exam })
})

export const deleteExam = asyncHandler(async (req, res) => {
  await examService.deleteExam(req.params.id, req.user.id)
  res.status(204).send()
})

export const getExamStats = asyncHandler(async (req, res) => {
  const stats = await examService.getExamStats(req.params.id, req.user.id)
  res.json({ stats })
})
