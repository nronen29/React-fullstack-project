// Demo data (ported from the original client/src/api/mockDb.js) plus a reusable
// seeding routine shared by the CLI seed script and the auto-seed-on-boot logic.

import bcrypt from 'bcryptjs'

export const users = [
  { id: 'user-teacher-1', username: 'drsmith', password: 'teacher123', role: 'teacher', fullName: 'Dr. Smith', email: 'dr.smith@school.edu', createdAt: '2026-01-10T08:00:00.000Z' },
  { id: 'user-student-1', username: 'alex', password: 'student123', role: 'student', fullName: 'Alex Rivera', email: 'alex.rivera@student.edu', createdAt: '2026-02-01T09:00:00.000Z' },
  { id: 'user-student-2', username: 'jordan', password: 'student123', role: 'student', fullName: 'Jordan Lee', email: 'jordan.lee@student.edu', createdAt: '2026-02-01T09:30:00.000Z' },
  { id: 'user-student-3', username: 'sam', password: 'student123', role: 'student', fullName: 'Sam Patel', email: 'sam.patel@student.edu', createdAt: '2026-02-15T10:00:00.000Z' },
]

export const exams = [
  {
    id: 'exam-1', title: 'JavaScript Basics', description: 'Test your knowledge of core JS concepts.',
    teacherId: 'user-teacher-1', durationMinutes: 20, passPercent: 60, isPublished: true, createdAt: '2026-03-01T12:00:00.000Z',
    questions: [
      { id: 'exam-1-q1', type: 'multiple_choice', text: 'What does `typeof null` evaluate to in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"number"'], correctIndex: 2, points: 25, timeMinutes: 5 },
      { id: 'exam-1-q2', type: 'multiple_choice', text: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctIndex: 0, points: 25, timeMinutes: 5 },
      { id: 'exam-1-q3', type: 'multiple_choice', text: 'Promises can be in which states?', options: ['pending, fulfilled, rejected', 'loading, success, error', 'open, closed, merged', 'idle, running, blocked'], correctIndex: 0, points: 25, timeMinutes: 5 },
      { id: 'exam-1-q4', type: 'multiple_choice', text: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'define'], correctIndex: 1, points: 25, timeMinutes: 5 },
    ],
  },
  {
    id: 'exam-2', title: 'React Fundamentals', description: 'Core React concepts and hooks.',
    teacherId: 'user-teacher-1', durationMinutes: 25, passPercent: 70, isPublished: true, createdAt: '2026-03-05T14:00:00.000Z',
    questions: [
      { id: 'exam-2-q1', type: 'multiple_choice', text: 'Which hook runs after a component mounts?', options: ['useState', 'useEffect', 'useMemo', 'useRef'], correctIndex: 1, points: 34, timeMinutes: 8 },
      { id: 'exam-2-q2', type: 'multiple_choice', text: 'What is the correct way to update state in function components?', options: ['Call the setter from useState', 'Mutate state directly', 'Use only global variables', 'Reload the page'], correctIndex: 0, points: 33, timeMinutes: 8 },
      { id: 'exam-2-q3', type: 'multiple_choice', text: 'JSX is best described as:', options: ['A syntax extension for JavaScript', 'A separate templating language compiled to HTML only', 'A CSS preprocessor', 'A database query language'], correctIndex: 0, points: 33, timeMinutes: 9 },
    ],
  },
  {
    id: 'exam-3', title: 'Advanced JavaScript (Draft)', description: 'Closure, prototypes, and async patterns — not yet published.',
    teacherId: 'user-teacher-1', durationMinutes: 30, passPercent: 65, isPublished: false, createdAt: '2026-05-20T09:00:00.000Z',
    questions: [
      { id: 'exam-3-q1', type: 'multiple_choice', text: 'What does a closure preserve access to?', options: ['Its outer lexical environment', 'Only global variables', 'The DOM tree', 'Network cache'], correctIndex: 0, points: 100, timeMinutes: 30 },
    ],
  },
]

export const submissions = [
  { id: 'sub-1', examId: 'exam-1', studentId: 'user-student-1', status: 'graded', startedAt: '2026-05-01T09:45:00.000Z', submittedAt: '2026-05-01T10:00:00.000Z', scorePercent: 92 },
  { id: 'sub-2', examId: 'exam-1', studentId: 'user-student-2', status: 'graded', startedAt: '2026-05-02T14:00:00.000Z', submittedAt: '2026-05-02T14:30:00.000Z', scorePercent: 78 },
  { id: 'sub-3', examId: 'exam-2', studentId: 'user-student-3', status: 'graded', startedAt: '2026-05-03T08:50:00.000Z', submittedAt: '2026-05-03T09:15:00.000Z', scorePercent: 100 },
  { id: 'sub-4', examId: 'exam-2', studentId: 'user-student-1', status: 'in_progress', startedAt: '2026-05-26T15:00:00.000Z', submittedAt: null, scorePercent: null },
]

export const answers = [
  { id: 'ans-1', submissionId: 'sub-1', questionId: 'exam-1-q1', selectedIndex: 2, isCorrect: true },
  { id: 'ans-2', submissionId: 'sub-1', questionId: 'exam-1-q2', selectedIndex: 0, isCorrect: true },
  { id: 'ans-3', submissionId: 'sub-1', questionId: 'exam-1-q3', selectedIndex: 0, isCorrect: true },
  { id: 'ans-4', submissionId: 'sub-1', questionId: 'exam-1-q4', selectedIndex: 2, isCorrect: false },
  { id: 'ans-5', submissionId: 'sub-2', questionId: 'exam-1-q1', selectedIndex: 2, isCorrect: true },
  { id: 'ans-6', submissionId: 'sub-2', questionId: 'exam-1-q2', selectedIndex: 1, isCorrect: false },
  { id: 'ans-7', submissionId: 'sub-2', questionId: 'exam-1-q3', selectedIndex: 0, isCorrect: true },
  { id: 'ans-8', submissionId: 'sub-2', questionId: 'exam-1-q4', selectedIndex: 1, isCorrect: true },
  { id: 'ans-9', submissionId: 'sub-3', questionId: 'exam-2-q1', selectedIndex: 1, isCorrect: true },
  { id: 'ans-10', submissionId: 'sub-3', questionId: 'exam-2-q2', selectedIndex: 0, isCorrect: true },
  { id: 'ans-11', submissionId: 'sub-3', questionId: 'exam-2-q3', selectedIndex: 0, isCorrect: true },
  { id: 'ans-12', submissionId: 'sub-4', questionId: 'exam-2-q1', selectedIndex: 1, isCorrect: true },
]

/**
 * Inserts all demo rows using the given Prisma client.
 * Assumes the relevant tables are empty (call after a reset or an emptiness check).
 */
export async function insertSeedData(prisma, { rounds = Number(process.env.BCRYPT_ROUNDS ?? 10) } = {}) {
  for (const u of users) {
    await prisma.user.create({
      data: { ...u, password: await bcrypt.hash(u.password, rounds), createdAt: new Date(u.createdAt) },
    })
  }

  for (const exam of exams) {
    const { questions, createdAt, ...rest } = exam
    await prisma.exam.create({
      data: {
        ...rest,
        createdAt: new Date(createdAt),
        questions: {
          create: questions.map((q, index) => ({
            id: q.id,
            type: q.type,
            text: q.text,
            points: q.points,
            timeMinutes: q.timeMinutes,
            order: index,
            options: q.options ?? [],
            correctIndex: q.correctIndex ?? null,
            correctAnswer: q.correctAnswer ?? null,
          })),
        },
      },
    })
  }

  for (const s of submissions) {
    await prisma.submission.create({
      data: {
        ...s,
        startedAt: new Date(s.startedAt),
        submittedAt: s.submittedAt ? new Date(s.submittedAt) : null,
      },
    })
  }

  await prisma.answer.createMany({
    data: answers.map((a) => ({
      id: a.id,
      submissionId: a.submissionId,
      questionId: a.questionId,
      selectedIndex: a.selectedIndex ?? null,
      textAnswer: a.textAnswer ?? null,
      isCorrect: a.isCorrect,
    })),
  })

  return { users: users.length, exams: exams.length, submissions: submissions.length }
}
