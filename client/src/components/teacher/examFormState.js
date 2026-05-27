import { getQuestionType } from '../../api/examService.js'

const EMPTY_OPTION = ['', '', '', '']

export function emptyQuestion() {
  return {
    id: '',
    type: 'multiple_choice',
    text: '',
    points: 10,
    timeMinutes: 2,
    options: [...EMPTY_OPTION],
    correctIndex: 0,
    correctAnswer: '',
  }
}

export function examToFormState(exam) {
  return {
    title: exam?.title ?? '',
    description: exam?.description ?? '',
    durationMinutes: exam?.durationMinutes ?? 30,
    passPercent: exam?.passPercent ?? 60,
    isPublished: exam?.isPublished ?? false,
    questions: (exam?.questions ?? []).map((q) => {
      const type = getQuestionType(q)
      if (type === 'open') {
        return {
          id: q.id ?? '',
          type: 'open',
          text: q.text ?? '',
          points: q.points ?? 10,
          timeMinutes: q.timeMinutes ?? 2,
          options: [...EMPTY_OPTION],
          correctIndex: 0,
          correctAnswer: q.correctAnswer ?? '',
        }
      }
      const options = [...EMPTY_OPTION]
      ;(q.options ?? []).slice(0, 4).forEach((opt, i) => {
        options[i] = opt
      })
      return {
        id: q.id ?? '',
        type: 'multiple_choice',
        text: q.text ?? '',
        points: q.points ?? 10,
        timeMinutes: q.timeMinutes ?? 2,
        options,
        correctIndex: q.correctIndex ?? 0,
        correctAnswer: '',
      }
    }),
  }
}
