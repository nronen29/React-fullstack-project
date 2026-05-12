// נתונים בזיכרון בלבד — מדמה DB עד שיהיה שרת אמיתי

export const mockDb = {
  // רשימת מבחנים: לכל מבחן id, כותרת, ומערך שאלות
  exams: [
    {
      id: 'exam-1',
      title: 'JavaScript Fundamentals',
      questions: [
        {
          id: 'q1',
          text: 'What does `typeof null` evaluate to in JavaScript?',
          options: ['"null"', '"undefined"', '"object"', '"number"'],
          correctIndex: 2,
        },
        {
          id: 'q2',
          text: 'Which method adds an element to the end of an array?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctIndex: 0,
        },
        {
          id: 'q3',
          text: 'Promises can be in which states?',
          options: [
            'pending, fulfilled, rejected',
            'loading, success, error',
            'open, closed, merged',
            'idle, running, blocked',
          ],
          correctIndex: 0,
        },
      ],
    },
    {
      id: 'exam-2',
      title: 'React & Components',
      questions: [
        {
          id: 'q1',
          text: 'Which hook runs after a component mounts?',
          options: ['useState', 'useEffect', 'useMemo', 'useRef'],
          correctIndex: 1,
        },
        {
          id: 'q2',
          text: 'What is the correct way to update state from a class pattern mindset in function components?',
          options: [
            'Call the setter from useState',
            'Mutate state directly',
            'Use only global variables',
            'Reload the page',
          ],
          correctIndex: 0,
        },
      ],
    },
  ],
  // ציוני תלמידים (לשימוש עתידי במסכים)
  studentScores: [
    {
      id: 'score-1',
      studentName: 'Alex Rivera',
      examId: 'exam-1',
      scorePercent: 92,
      submittedAt: '2026-05-01T10:00:00.000Z',
    },
    {
      id: 'score-2',
      studentName: 'Jordan Lee',
      examId: 'exam-1',
      scorePercent: 78,
      submittedAt: '2026-05-02T14:30:00.000Z',
    },
    {
      id: 'score-3',
      studentName: 'Sam Patel',
      examId: 'exam-2',
      scorePercent: 100,
      submittedAt: '2026-05-03T09:15:00.000Z',
    },
  ],
}
