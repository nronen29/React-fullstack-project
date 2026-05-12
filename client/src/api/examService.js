import { mockDb } from './mockDb.js'

// המתנה קצרה — מדמה עיכוב של בקשה לשרת
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

// מייצר מזהה מבחן חדש (exam-1, exam-2, ...)
function nextExamId() {
  const nums = mockDb.exams
    .map((e) => {
      const m = String(e.id).match(/(\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `exam-${max + 1}`
}

// מחזיר את כל המבחנים מהמוק
export async function getAllExams() {
  await delay()
  return [...mockDb.exams]
}

// מחזיר מבחן אחד לפי id, או null אם לא נמצא
export async function getExamById(id) {
  await delay()
  const exam = mockDb.exams.find((e) => e.id === id)
  return exam ? structuredClone(exam) : null
}

// מוסיף מבחן חדש למוק ומחזיר אותו (עם id אוטומטי אם לא נשלח)
export async function createExam(exam) {
  await delay()
  const newExam = {
    ...exam,
    id: exam.id && exam.id.trim() ? exam.id.trim() : nextExamId(),
    questions: Array.isArray(exam.questions) ? structuredClone(exam.questions) : [],
  }
  mockDb.exams.push(newExam)
  return structuredClone(newExam)
}
