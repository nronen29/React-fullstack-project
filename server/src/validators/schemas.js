import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('A valid email is required'),
})

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

const questionSchema = z
  .object({
    id: z.string().optional(),
    type: z.enum(['multiple_choice', 'open']).default('multiple_choice'),
    text: z.string().min(1, 'Question text is required'),
    points: z.number().int().positive().default(1),
    timeMinutes: z.number().int().positive().default(2),
    options: z.array(z.string()).optional(),
    correctIndex: z.number().int().min(0).max(3).optional(),
    correctAnswer: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'multiple_choice') {
      const options = (q.options ?? []).map((o) => o.trim())
      if (options.length < 4 || options.some((o) => !o)) {
        ctx.addIssue({ code: 'custom', message: 'Enter all four answer options' })
      }
      if (q.correctIndex == null) {
        ctx.addIssue({ code: 'custom', message: 'Select the correct option' })
      }
    } else if (!q.correctAnswer || !q.correctAnswer.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Enter the expected answer for the open question' })
    }
  })

export const examSchema = z.object({
  title: z.string().min(1, 'Exam title is required'),
  description: z.string().optional().default(''),
  durationMinutes: z.number().int().positive().default(30),
  passPercent: z.number().int().min(0).max(100).default(60),
  isPublished: z.boolean().default(false),
  questions: z.array(questionSchema).default([]),
})

export const submissionSchema = z.object({
  examId: z.string().min(1, 'examId is required'),
  status: z.enum(['graded', 'time_up', 'abandoned']).default('graded'),
  startedAt: z.string().optional(),
  answers: z
    .record(
      z.string(),
      z.object({
        selectedIndex: z.number().int().nullable().optional(),
        textAnswer: z.string().nullable().optional(),
      }),
    )
    .default({}),
})
