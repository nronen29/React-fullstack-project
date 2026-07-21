# Sequence diagrams - key scenarios

Three end-to-end flows showing how data moves across Client, Server, and DB.

## Scenario 1: Login (student or teacher)

```mermaid
sequenceDiagram
  actor U as User
  participant L as LoginPage
  participant A as AuthContext
  participant US as userService
  participant H as httpClient
  participant API as Express /auth/login
  participant AS as authService
  participant DB as PostgreSQL

  U->>L: enter username + password
  L->>A: login(username, password)
  A->>US: login(...)
  US->>H: POST /auth/login
  H->>API: HTTP request (no token)
  API->>AS: authenticate(username, password)
  AS->>DB: findUnique(user by username)
  DB-->>AS: user row (with hash)
  AS->>AS: bcrypt.compare(password, hash)
  AS-->>API: public user
  API->>API: signToken(user)
  API-->>H: 200 { token, user }
  H-->>A: { token, user }
  A->>A: store token + user (localStorage)
  A-->>L: user
  L->>U: redirect to /teacher or /student
```

## Scenario 2: Teacher creates and publishes an exam

```mermaid
sequenceDiagram
  actor T as Teacher
  participant ED as ExamEditor
  participant TD as TeacherDashboard
  participant ES as examService (client)
  participant H as httpClient
  participant API as Express /exams
  participant MW as Middleware (authJwt + requireRole + validate)
  participant SVC as examService (server)
  participant DB as PostgreSQL

  T->>ED: fill title, questions, mark "Published"
  ED->>TD: onSave(payload)
  TD->>ES: createExam(payload)
  ES->>H: POST /exams (Bearer token)
  H->>API: HTTP request
  API->>MW: verify JWT, require teacher, validate body (zod)
  MW->>SVC: createExam(payload, teacherId)
  SVC->>SVC: generate ids + normalize questions
  SVC->>DB: exam.create({ ..., questions: { create } })
  DB-->>SVC: created exam + questions
  SVC-->>API: serialized exam
  API-->>H: 201 { exam }
  H-->>TD: exam
  TD->>ES: getExamsByTeacher()
  ES-->>TD: refreshed list
  TD->>T: exam shown as "Published"
```

## Scenario 3: Student takes an exam (auto-graded submission)

```mermaid
sequenceDiagram
  actor S as Student
  participant SP as StudentPortal
  participant EX as ExamSession
  participant SS as submissionService (client)
  participant ES as examService (client)
  participant API as Express API
  participant SVC as submissionService (server)
  participant G as grading (pure)
  participant DB as PostgreSQL

  S->>SP: enter exam id, Start
  SP->>ES: getExamById(id)
  ES->>API: GET /exams/:id (Bearer)
  API->>DB: find exam + questions
  API-->>ES: exam WITHOUT correct answers
  ES-->>SP: exam
  SP->>EX: render questions + start timer

  loop while answering / until time_up
    S->>EX: select option / type answer
    EX->>EX: update local answers state
  end

  S->>EX: Submit (or timer hits 0)
  EX->>SS: submitExamAttempt({ exam, answers, status, startedAt })
  SS->>API: POST /submissions (Bearer)
  API->>SVC: submitAttempt({ examId, studentId, answers, ... })
  SVC->>DB: load exam WITH correct answers
  SVC->>G: gradeExamAttempt(exam, answers)
  G-->>SVC: { scorePercent, passed, questionResults }
  SVC->>DB: create submission + answers (transaction)
  SVC-->>API: { submission, graded }
  API-->>SS: 201 { submission, graded }
  SS-->>EX: result
  EX->>SP: onComplete(result)
  SP->>S: show score + pass/fail
```
