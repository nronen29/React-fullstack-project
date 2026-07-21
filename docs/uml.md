# OOP / Class design (UML)

The codebase is mostly functional, but uses classes and clearly-typed "domain
models" where they add value. This diagram shows the domain entities plus the
service/utility classes.

## Domain model

```mermaid
classDiagram
  class User {
    +String id
    +String username
    +String password
    +Role role
    +String fullName
    +String email
    +DateTime createdAt
  }

  class Exam {
    +String id
    +String title
    +String description
    +String teacherId
    +int durationMinutes
    +int passPercent
    +boolean isPublished
    +DateTime createdAt
    +Question[] questions
  }

  class Question {
    +String id
    +String examId
    +QuestionType type
    +String text
    +int points
    +int timeMinutes
    +String[] options
    +int correctIndex
    +String correctAnswer
  }

  class Submission {
    +String id
    +String examId
    +String studentId
    +SubmissionStatus status
    +DateTime startedAt
    +DateTime submittedAt
    +int scorePercent
  }

  class Answer {
    +String id
    +String submissionId
    +String questionId
    +int selectedIndex
    +String textAnswer
    +boolean isCorrect
  }

  User "1" --> "*" Exam : creates
  User "1" --> "*" Submission : makes
  Exam "1" --> "*" Question : has
  Exam "1" --> "*" Submission : receives
  Submission "1" --> "*" Answer : contains
  Question "1" --> "*" Answer : answered_by
```

## Service and utility classes / modules

```mermaid
classDiagram
  class StorageService {
    -String prefix
    +get(name)
    +set(name, value)
    +remove(name)
  }

  class ApiError {
    +int statusCode
    +String message
    +Object details
    +badRequest(msg)$
    +unauthorized(msg)$
    +forbidden(msg)$
    +notFound(msg)$
    +conflict(msg)$
  }

  class Logger {
    +info(msg)
    +warn(msg)
    +error(msg)
    +http(msg)
  }

  class AuthService {
    +registerStudent(dto)
    +authenticate(username, password)
    +getUserById(id)
    +toPublicUser(user)
  }

  class ExamService {
    +listPublishedExams()
    +listExamsByTeacher(teacherId)
    +getExamForUser(id, user)
    +createExam(dto, teacherId)
    +updateExam(id, dto, teacherId)
    +deleteExam(id, teacherId)
    +getExamStats(id, teacherId)
    +serializeExam(exam, opts)
  }

  class SubmissionService {
    +submitAttempt(dto)
    +listSubmissionsForExam(examId, teacherId)
    +listMySubmissions(studentId)
  }

  class Grading {
    +gradeExamAttempt(exam, answers)$
    +getQuestionType(question)$
  }

  AuthService ..> ApiError : throws
  ExamService ..> ApiError : throws
  SubmissionService ..> Grading : uses
  SubmissionService ..> ExamService : uses
  StorageService ..> AuthService : (client) persists token
```

Notes:
- `StorageService` (client) and `ApiError`/`Logger` (server) are the concrete
  classes. Services are module singletons of pure functions - a pragmatic,
  testable style rather than heavyweight class hierarchies.
- `Grading` is a pure module (no I/O), which is why it is the most heavily
  unit-tested part of the system.
```
