import { prisma } from '../models/prismaClient.js'
import { ApiError } from '../utils/ApiError.js'
import { gradeExamAttempt, getQuestionType } from '../utils/grading.js'
import { nextSubmissionId, nextAnswerId } from '../utils/ids.js'
import { getExamWithAnswers } from './examService.js'

// Records a student's attempt, grading it server-side (authoritative).
export async function submitAttempt({ examId, studentId, answers, status, startedAt }) {
  const exam = await getExamWithAnswers(examId)
  if (!exam.isPublished) throw ApiError.forbidden('This exam is not published.')

  const startedIso = startedAt ?? new Date().toISOString()
  const submittedIso = new Date().toISOString()

  const existingSubIds = (await prisma.submission.findMany({ select: { id: true } })).map((s) => s.id)
  const submissionId = nextSubmissionId(existingSubIds)

  if (status === 'abandoned') {
    const submission = await prisma.submission.create({
      data: {
        id: submissionId,
        examId,
        studentId,
        status: 'abandoned',
        startedAt: new Date(startedIso),
        submittedAt: new Date(submittedIso),
        scorePercent: null,
      },
    })
    return { submission: serializeSubmission(submission), graded: null }
  }

  const graded = gradeExamAttempt(exam, answers)

  let answerCounter = (await prisma.answer.findMany({ select: { id: true } })).map((a) => a.id)
  const answerRows = graded.questionResults.map((result) => {
    const question = exam.questions.find((q) => q.id === result.questionId)
    const response = answers[result.questionId]
    const type = getQuestionType(question)
    const id = nextAnswerId(answerCounter)
    answerCounter.push(id)
    return {
      id,
      submissionId,
      questionId: result.questionId,
      selectedIndex:
        type === 'multiple_choice' && response?.selectedIndex != null
          ? Number(response.selectedIndex)
          : null,
      textAnswer: type === 'open' ? String(response?.textAnswer ?? '') : null,
      isCorrect: result.isCorrect,
    }
  })

  const submission = await prisma.$transaction(async (tx) => {
    const sub = await tx.submission.create({
      data: {
        id: submissionId,
        examId,
        studentId,
        status: 'graded',
        startedAt: new Date(startedIso),
        submittedAt: new Date(submittedIso),
        scorePercent: graded.scorePercent,
      },
    })
    if (answerRows.length) await tx.answer.createMany({ data: answerRows })
    return sub
  })

  return { submission: serializeSubmission(submission), graded }
}

function serializeSubmission(sub) {
  return {
    id: sub.id,
    examId: sub.examId,
    studentId: sub.studentId,
    status: sub.status,
    startedAt: sub.startedAt,
    submittedAt: sub.submittedAt,
    scorePercent: sub.scorePercent,
  }
}

// Teacher review: submissions for one exam, with student identity.
export async function listSubmissionsForExam(examId, teacherId) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) throw ApiError.notFound('Exam not found')
  if (exam.teacherId !== teacherId) throw ApiError.forbidden('You can only view your own exams')

  const submissions = await prisma.submission.findMany({
    where: { examId },
    include: { student: { select: { id: true, fullName: true, username: true } } },
    orderBy: { submittedAt: 'desc' },
  })

  return submissions.map((s) => ({
    ...serializeSubmission(s),
    student: s.student,
  }))
}

// Student results: their own submissions with exam titles.
export async function listMySubmissions(studentId) {
  const submissions = await prisma.submission.findMany({
    where: { studentId },
    include: { exam: { select: { id: true, title: true, passPercent: true } } },
    orderBy: { submittedAt: 'desc' },
  })

  return submissions.map((s) => ({
    ...serializeSubmission(s),
    exam: s.exam,
  }))
}
