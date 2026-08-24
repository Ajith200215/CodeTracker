# CodeTracker — Phased Build Spec (College Coding Progress Platform)

Feed ONE phase at a time into Antigravity. Do not paste the whole file in
one prompt — build, run, and fix each phase before moving to the next.

Tech stack: Next.js 15 (App Router, TypeScript) · Tailwind + shadcn/ui ·
PostgreSQL (Neon/Supabase) · Prisma · NextAuth.js (Google provider) ·
Redis + BullMQ · Judge0 (self-hosted, Docker) · Monaco Editor · Socket.IO ·
Recharts · Vercel + Railway (deploy)

---

## Phase 0 — Scaffold

Set up a Next.js 15 App Router project with TypeScript and Tailwind.
Install and initialize shadcn/ui. Install Prisma, next-auth, ioredis,
bullmq, socket.io-client, socket.io, recharts, @monaco-editor/react.
Set up `.env.local` with placeholders for DATABASE_URL, NEXTAUTH_SECRET,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIS_URL, JUDGE0_URL. Create a
basic app shell with a role-aware sidebar (Dashboard, Classrooms, Tests,
Feedback for students; Dashboard, Classrooms, Tests, Monitor for teachers)
and a topbar showing the logged-in user's name and role badge.

## Phase 1 — Data model

Use this exact Prisma schema:

```prisma
enum Role {
  STUDENT
  TEACHER
  ADMIN
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  role         Role
  regNo        String?
  createdAt    DateTime @default(now())

  classroomsCreated   Classroom[]      @relation("TeacherClassrooms")
  enrollments         Enrollment[]
  platformHandles     PlatformHandle[]
  feedbackReceived    Feedback[]       @relation("FeedbackToStudent")
  feedbackGiven       Feedback[]       @relation("FeedbackFromTeacher")
  testAttempts        TestAttempt[]
  proctorFlags        ProctorFlag[]
  retestRequests      RetestRequest[]
}

model Classroom {
  id          String   @id @default(cuid())
  name        String
  section     String?
  teacherId   String
  teacher     User     @relation("TeacherClassrooms", fields: [teacherId], references: [id])
  createdAt   DateTime @default(now())

  enrollments Enrollment[]
  tests       Test[]
}

model Enrollment {
  id          String   @id @default(cuid())
  studentId   String
  classroomId String
  student     User      @relation(fields: [studentId], references: [id])
  classroom   Classroom @relation(fields: [classroomId], references: [id])
  joinedAt    DateTime  @default(now())

  @@unique([studentId, classroomId])
}

enum Platform {
  LEETCODE
  CODEFORCES
  GEEKSFORGEEKS
  HACKERRANK
  NEETCODE
  CODECHEF
}

model PlatformHandle {
  id         String   @id @default(cuid())
  userId     String
  platform   Platform
  username   String
  verified   Boolean  @default(false)
  user       User     @relation(fields: [userId], references: [id])

  @@unique([userId, platform])
}

model PlatformStatSnapshot {
  id            String   @id @default(cuid())
  handleId      String
  totalSolved   Int
  easySolved    Int?
  mediumSolved  Int?
  hardSolved    Int?
  rating        Int?
  raw           Json
  fetchedAt     DateTime @default(now())

  @@index([handleId, fetchedAt])
}

model Feedback {
  id          String   @id @default(cuid())
  studentId   String
  teacherId   String
  classroomId String
  message     String
  createdAt   DateTime @default(now())
  student     User @relation("FeedbackToStudent", fields: [studentId], references: [id])
  teacher     User @relation("FeedbackFromTeacher", fields: [teacherId], references: [id])
}

enum TestType {
  MCQ
  CODING
  APTITUDE
  MIXED
}

model Test {
  id            String   @id @default(cuid())
  classroomId   String
  classroom     Classroom @relation(fields: [classroomId], references: [id])
  title         String
  type          TestType
  durationMins  Int
  startsAt      DateTime
  endsAt        DateTime
  proctored     Boolean  @default(true)
  maxTabSwitchWarnings Int @default(1)
  questions     Question[]
  attempts      TestAttempt[]
}

model Question {
  id            String   @id @default(cuid())
  testId        String
  test          Test @relation(fields: [testId], references: [id])
  type          TestType
  prompt        String
  options       Json?
  correctOption String?
  starterCode   Json?
  testCases     Json?
  points        Int  @default(1)
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  AUTO_ENDED_CHEATING
  AUTO_ENDED_TIME
  RETEST_APPROVED
}

model TestAttempt {
  id            String   @id @default(cuid())
  testId        String
  studentId     String
  status        AttemptStatus @default(IN_PROGRESS)
  startedAt     DateTime @default(now())
  submittedAt   DateTime?
  score         Float?
  attemptNumber Int @default(1)
  test          Test @relation(fields: [testId], references: [id])
  student       User @relation(fields: [studentId], references: [id])
  answers       Answer[]
  flags         ProctorFlag[]
}

model Answer {
  id             String   @id @default(cuid())
  attemptId      String
  questionId     String
  attempt        TestAttempt @relation(fields: [attemptId], references: [id])
  selectedOption String?
  code           String?
  isCorrect      Boolean?
  pointsAwarded  Float?
}

enum FlagType {
  TAB_SWITCH
  FULLSCREEN_EXIT
  COPY_PASTE
  MULTI_FACE
  DEVTOOLS_OPEN
  WINDOW_BLUR
}

model ProctorFlag {
  id          String   @id @default(cuid())
  attemptId   String
  studentId   String
  type        FlagType
  note        String?
  createdAt   DateTime @default(now())
  attempt     TestAttempt @relation(fields: [attemptId], references: [id])
  student     User @relation(fields: [studentId], references: [id])
}

model RetestRequest {
  id          String   @id @default(cuid())
  attemptId   String
  studentId   String
  reason      String
  status      String   @default("PENDING")
  reviewedBy  String?
  createdAt   DateTime @default(now())
  student     User @relation(fields: [studentId], references: [id])
}
```

Run migrations against a Postgres instance (Neon/Supabase). Generate the
Prisma client. Add a `lib/db.ts` singleton Prisma client following Next.js
best practices (avoid multiple instances in dev with hot reload). Write a
seed script that creates one ADMIN user.

## Phase 2 — Auth & role-based routing

Add NextAuth (Auth.js) with the Google provider. On first sign-in, look up
the user by email in the User table. If found (was pre-added by a
teacher), link the session to that existing row. If not found and the
email domain matches the college domain, auto-create as STUDENT. TEACHER
role can only be granted by editing the DB directly or via an admin
action — never self-assigned. Add `middleware.ts` that protects
`/teacher/**` for role TEACHER/ADMIN and `/student/**` for role STUDENT,
redirecting unauthorized access to `/unauthorized`.

## Phase 3 — Classroom management

Build `/teacher/classrooms`: create a classroom (name like "A1"/"Q2",
optional section), and a bulk-add form where the teacher pastes Gmail
addresses (comma or newline separated) which creates placeholder User
rows (role STUDENT, unverified) plus Enrollment rows. Build
`/teacher/classrooms/[id]` showing the roster as a table. Build
`/student/classrooms` listing the classrooms the logged-in student
belongs to. Ensure a placeholder user created by a teacher auto-links to
the real account the first time that Gmail signs in.

## Phase 4 — Platform stat sync (adapters + queue)

Define a `PlatformAdapter` TypeScript interface:

```ts
interface PlatformAdapter {
  platform: Platform;
  fetchStats(username: string): Promise<{
    totalSolved: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    rating?: number;
    raw: unknown;
  }>;
}
```

Implement `CodeforcesAdapter` first, using the official REST API
(`user.info`, `user.status`) — no auth needed. Implement
`LeetCodeAdapter` using the public GraphQL endpoint at
`leetcode.com/graphql` (`matchedUser` query, `submitStatsGlobal` for
easy/medium/hard counts). Implement `GfgAdapter` and `CodeChefAdapter`
wrapped in try/catch that marks that platform's data "stale" on failure
instead of throwing and blocking other platforms. Add a manual-entry
form (`/student/platforms`) for HackerRank and NeetCode handles, saved
with `verified=false` since there's no public API for either. Set up
Redis + BullMQ with a repeatable job re-syncing every PlatformHandle every
6 hours, writing a new PlatformStatSnapshot row per run (never overwrite —
this is what powers the trend chart later). Add an on-demand
`POST /api/sync` endpoint rate-limited to once per 10 minutes per user.

## Phase 5 — Dashboards

Build `/student/dashboard`: a card per platform (solved counts / rating),
a combined "CodeScore" summary, and a trend line chart (Recharts) built
from PlatformStatSnapshot history. Handle 0-snapshot and 1-snapshot states
without crashing. Build `/teacher/classrooms/[id]` to include a
classroom-wide stats table, sortable by total solved per platform, pulled
via server-component Prisma queries.

## Phase 6 — Feedback

Add a feedback form on a student's profile page within a classroom
(teacher-only) that writes to the Feedback table. Build
`/student/feedback` showing feedback newest-first, filterable by
classroom.

## Phase 7 — Test authoring

Build `/teacher/classrooms/[id]/tests/new`: create a Test (title, type,
durationMins, startsAt, endsAt, proctored toggle, maxTabSwitchWarnings),
then add Questions of type MCQ (prompt + options + correctOption), CODING
(prompt + starterCode per language + testCases with a `hidden` flag), or
APTITUDE (same shape as MCQ, different tag for filtering/reporting). Build
`/teacher/classrooms/[id]/tests` listing all tests for that classroom with
status (upcoming/active/ended).

## Phase 8 — Code execution (Judge0)

Set up Judge0 CE via docker-compose for local dev, per the official repo.
Build `POST /api/run-code` accepting `{ language, source, testCases }`,
submitting each to Judge0, polling for the result, and returning
per-test-case pass/fail. Never include hidden test case inputs/expected
outputs in the response payload — only pass/fail and, for visible cases,
actual vs expected output.

## Phase 9 — Exam-taking UI

Build `/student/tests/[id]/attempt`: a countdown timer from
`durationMins`, an MCQ renderer, and a Monaco editor for coding questions
with a "Run" button (visible test cases only, via `/api/run-code`) and a
final "Submit" (runs all cases including hidden ones). Auto-submit on
timer expiry. Create a TestAttempt row when the student starts, and
Answer rows on submit. Auto-grade: MCQ by exact match, CODING by
test-case pass ratio, APTITUDE same as MCQ.

## Phase 10 — Proctoring engine

On the attempt page: force fullscreen on start. Add listeners —
`visibilitychange` (TAB_SWITCH), window `blur` (WINDOW_BLUR),
`fullscreenchange` exit (FULLSCREEN_EXIT), `copy`/`paste` prevention
(COPY_PASTE). On each violation: show an on-screen toast warning with the
remaining-warnings count, then `POST /api/proctor/flag` which writes a
ProctorFlag row server-side and checks the flag count for this attempt
against `Test.maxTabSwitchWarnings`. If exceeded, set
`TestAttempt.status = AUTO_ENDED_CHEATING` server-side, reject any further
answer submissions for that attempt, and tell the client to show an "exam
ended" screen. Emit each flag over a WebSocket room keyed by `testId` so a
teacher's live monitor view updates in real time. Enforcement must be
server-authoritative — never trust a client-only "I ended myself" signal.

## Phase 11 — Live monitor & retest flow

Build `/teacher/tests/[id]/monitor`: a live list of in-progress attempts
with running flag counts, updating via WebSocket. Build
`/student/tests/[id]/retest-request`, visible only when the student's own
attempt has status AUTO_ENDED_CHEATING or AUTO_ENDED_TIME due to a
reported technical issue — a reason textarea creates a RetestRequest.
Build `/teacher/tests/[id]/retests`: pending requests shown alongside that
student's flag history from the original attempt, with Approve/Reject
actions. Approving creates a new TestAttempt with `attemptNumber + 1` and
a reset timer, while the original attempt and its flags remain untouched
as a permanent record.

## Phase 12 — Hardening

Add rate limiting on `/api/sync`, `/api/proctor/flag`, and auth routes.
Add DB indexes on `Enrollment(studentId, classroomId)`,
`TestAttempt(testId, studentId)`, `ProctorFlag(attemptId)`. Add Sentry
error tracking. Write a k6 load-test script simulating 200 students
starting the same test within 30 seconds and concurrently hitting
`/api/proctor/flag`, asserting zero failed requests and p95 latency under
500ms on the flag endpoint.

## Phase 13 — Deploy

Deploy the frontend to Vercel, backend workers + Redis to Railway, Judge0
to its own isolated VPS via docker-compose (kept separate from the main
app server as a security boundary), and the database on Neon. Configure
environment variables and a custom domain. Do a full manual run-through on
production: login → join classroom → sync platform stats → take a
proctored test → get flagged → request retest → teacher approves →
retake — confirming every step end to end.

---

## Phase 14 — Progress-over-time analytics (extension)

Add no new tables — this phase only reads PlatformStatSnapshot history
already being written since Phase 4. Build a `/student/analytics` page
with per-platform delta-over-time charts (solved-per-week) and a
`/teacher/classrooms/[id]/analytics` page showing the whole class's
weekly solve-rate trend, so a teacher can spot students who've gone quiet
without opening each profile individually.

## Phase 15 — New platform adapter (extension template)

To add any future platform: implement one new file satisfying the
existing `PlatformAdapter` interface from Phase 4, register it in the
adapter registry, and add the enum value to `Platform` in the Prisma
schema (one migration). No other file should need to change — the sync
job, dashboards, and roster views already iterate generically over
registered platforms.
