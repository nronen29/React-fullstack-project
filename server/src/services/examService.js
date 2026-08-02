import { prisma } from '../models/prismaClient.js'
import { ApiError } from '../utils/ApiError.js'
import { nextExamId, nextQuestionId } from '../utils/ids.js'
import { getQuestionType } from '../utils/grading.js'

// Maps a DB exam (with questions) into the shape the React client expects.
// When includeAnswers is false, correct answers are stripped so students
// cannot see them by inspecting network traffic.
export function serializeExam(exam, { includeAnswers } = { includeAnswers: true }) {
  if (!exam) return null
  const questions = [...(exam.questions ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((q) => {
      const type = getQuestionType(q)
      const base = {
        id: q.id,
        examId: q.examId,
        type,
        text: q.text,
        points: q.points,
        timeMinutes: q.timeMinutes,
      }
      if (type === 'multiple_choice') {
        base.options = q.options ?? []
        if (includeAnswers) base.correctIndex = q.correctIndex ?? 0
      } else if (includeAnswers) {
        base.correctAnswer = q.correctAnswer ?? ''
      }
      return base
    })

  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    teacherId: exam.teacherId,
    durationMinutes: exam.durationMinutes,
    passPercent: exam.passPercent,
    isPublished: exam.isPublished,
    createdAt: exam.createdAt,
    questions,
  }
}

function buildQuestionRows(examId, questions = [], startIds = []) {
  const rows = []
  const usedIds = [...startIds]
  questions.forEach((q, index) => {
    const type = q.type === 'open' ? 'open' : 'multiple_choice'
    const id =
      q.id && String(q.id).trim() ? String(q.id).trim() : nextQuestionId(examId, usedIds)
    usedIds.push(id)

    const row = {
      id,
      examId,
      type,
      text: String(q.text ?? '').trim(),
      points: Math.max(1, Number(q.points) || 1),
      timeMinutes: Math.max(1, Number(q.timeMinutes) || 2),
      order: index,
      options: [],
      correctIndex: null,
      correctAnswer: null,
    }

    if (type === 'multiple_choice') {
      const options = (q.options ?? []).map((o) => String(o).trim()).slice(0, 4)
      while (options.length < 4) options.push('')
      row.options = options
      row.correctIndex = Math.min(3, Math.max(0, Number(q.correctIndex) || 0))
    } else {
      row.correctAnswer = String(q.correctAnswer ?? '').trim()
    }
    rows.push(row)
  })
  return rows
}

export async function listPublishedExams() {
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: { questions: true },
    orderBy: { createdAt: 'desc' },
  })
  return exams.map((e) => serializeExam(e, { includeAnswers: false }))
}

export async function listExamsByTeacher(teacherId) {
  const exams = await prisma.exam.findMany({
    where: { teacherId },
    include: { questions: true },
    orderBy: { createdAt: 'desc' },
  })
  return exams.map((e) => serializeExam(e, { includeAnswers: true }))
}

// Fetches an exam applying visibility rules based on the requesting user.
export async function getExamForUser(id, user) {
  const exam = await prisma.exam.findUnique({ where: { id }, include: { questions: true } })
  if (!exam) throw ApiError.notFound('Exam not found')

  const isOwnerTeacher = user.role === 'teacher' && exam.teacherId === user.id
  if (isOwnerTeacher) return serializeExam(exam, { includeAnswers: true })

  // Students (and other teachers) can only see published exams, without answers.
  if (!exam.isPublished) {
    throw ApiError.forbidden('This exam is not published yet.')
  }
  return serializeExam(exam, { includeAnswers: false })
}

// Internal: full exam incl. answers, used by the grading flow.
export async function getExamWithAnswers(id) {
  const exam = await prisma.exam.findUnique({ where: { id }, include: { questions: true } })
  if (!exam) throw ApiError.notFound('Exam not found')
  return serializeExam(exam, { includeAnswers: true })
}

export async function createExam(payload, teacherId) {
  const existingIds = (await prisma.exam.findMany({ select: { id: true } })).map((e) => e.id)
  const examId = nextExamId(existingIds)
  const questionRows = buildQuestionRows(examId, payload.questions)

  const created = await prisma.exam.create({
    data: {
      id: examId,
      title: payload.title.trim(),
      description: (payload.description ?? '').trim(),
      durationMinutes: Math.max(1, Number(payload.durationMinutes) || 30),
      passPercent: Math.min(100, Math.max(0, Number(payload.passPercent) || 60)),
      isPublished: Boolean(payload.isPublished),
      teacherId,
      questions: { create: questionRows.map(({ examId: _drop, ...q }) => q) },
    },
    include: { questions: true },
  })
  return serializeExam(created, { includeAnswers: true })
}

export async function updateExam(id, payload, teacherId) {
  const existing = await prisma.exam.findUnique({ where: { id } })
  if (!existing) throw ApiError.notFound('Exam not found')
  if (existing.teacherId !== teacherId) {
    throw ApiError.forbidden('You can only edit your own exams')
  }

  const questionRows = buildQuestionRows(id, payload.questions)

  // Replace the exam's questions atomically (delete + recreate).
  const updated = await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany({ where: { examId: id } })
    await tx.exam.update({
      where: { id },
      data: {
        title: payload.title.trim(),
        description: (payload.description ?? '').trim(),
        durationMinutes: Math.max(1, Number(payload.durationMinutes) || 30),
        passPercent: Math.min(100, Math.max(0, Number(payload.passPercent) || 60)),
        isPublished: Boolean(payload.isPublished),
        questions: { create: questionRows.map(({ examId: _drop, ...q }) => q) },
      },
    })
    return tx.exam.findUnique({ where: { id }, include: { questions: true } })
  })

  return serializeExam(updated, { includeAnswers: true })
}

export async function deleteExam(id, teacherId) {
  const existing = await prisma.exam.findUnique({ where: { id } })
  if (!existing) throw ApiError.notFound('Exam not found')
  if (existing.teacherId !== teacherId) {
    throw ApiError.forbidden('You can only delete your own exams')
  }
  await prisma.exam.delete({ where: { id } })
}

// Aggregate stats for a teacher dashboard.
export async function getExamStats(examId, teacherId) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) throw ApiError.notFound('Exam not found')
  if (exam.teacherId !== teacherId) throw ApiError.forbidden('You can only view your own exams')

  const graded = await prisma.submission.findMany({
    where: { examId, status: 'graded', scorePercent: { not: null } },
    select: { scorePercent: true },
  })

  const scores = graded.map((s) => s.scorePercent)
  const count = scores.length
  const passCount = scores.filter((s) => s >= exam.passPercent).length

  return {
    examId,
    submissions: count,
    average: count ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : null,
    min: count ? Math.min(...scores) : null,
    max: count ? Math.max(...scores) : null,
    passRate: count ? Math.round((passCount / count) * 100) : null,
    passPercent: exam.passPercent,
  }
}
