# INITIAL.md - Assignment Roaster Product Definition

> Automated, consistent code/project feedback for students — no more delayed, inconsistent manual reviews.

---

## PRODUCT

### Name
Assignment Roaster

### Description
Manual code reviews cause delayed, inconsistent feedback and a lack of automated project evaluation, which reduces student engagement. Assignment Roaster lets students submit assignments (code or project links) and automatically generates an AI-powered "roast" — a scored, categorized review with actionable feedback — so students get fast, consistent, and engaging evaluation without waiting on a human grader.

### Target User
Students submitting code/project assignments for evaluation.

### Type
- [x] SaaS (Software as a Service)

---

## TECH STACK

### Backend
- [x] FastAPI + Python 3.11+

### Frontend
- [x] React + Vite + TypeScript

### Database
- [x] PostgreSQL + SQLAlchemy

### Authentication
- [x] Email/Password + Google OAuth

### UI Framework
- [x] Chakra UI

### Payments
- [ ] None for MVP (no payment provider integrated)

---

## MODULES

### Module 1: Authentication (Required)

**Description:** User authentication and authorization

**Models:**
- User: id, email, hashed_password, full_name, is_active, is_verified, oauth_provider, role (student/admin), created_at
- RefreshToken: id, user_id, token, expires_at, revoked

**API Endpoints:**
- POST /auth/register - Create new account
- POST /auth/login - Login with email/password
- POST /auth/refresh - Refresh access token
- POST /auth/logout - Revoke refresh token
- GET /auth/me - Get current user profile
- PUT /auth/me - Update profile
- GET /auth/google - Initiate Google OAuth
- GET /auth/google/callback - Google OAuth callback

**Frontend Pages:**
- /login - Login page
- /register - Registration page
- /forgot-password - Forgot password page
- /profile - User profile page (protected)

---

### Module 2: Assignments

**Description:** Students create and submit assignments (code files or repo links) for automated review.

**Models:**
```
Assignment:
  - id, student_id (FK -> User)
  - title: str
  - description: str
  - language: str
  - source_type: enum(file, repo_link)
  - source_url_or_path: str
  - due_date: datetime
  - status: enum(draft, submitted, reviewed)
  - created_at, updated_at
```

**API Endpoints:**
```
GET    /api/assignments            - List current user's assignments
POST   /api/assignments            - Create a new assignment (draft)
GET    /api/assignments/{id}       - Get one assignment
PUT    /api/assignments/{id}       - Update assignment (edit before submit)
DELETE /api/assignments/{id}       - Delete assignment
POST   /api/assignments/{id}/submit   - Submit for roasting
POST   /api/assignments/{id}/resubmit - Resubmit after edits
```

**Frontend Pages:**
```
/assignments              - List view
/assignments/new          - Create/submission form
/assignments/{id}         - Detail view
/assignments/{id}/edit    - Edit form
```

---

### Module 3: Reviews / Roasts

**Description:** Automated AI-generated evaluation of a submitted assignment, producing a score and categorized feedback.

**Models:**
```
Roast:
  - id, assignment_id (FK -> Assignment)
  - score: int (0-100)
  - feedback_text: str
  - severity: enum(low, medium, high)
  - categories: json (e.g. code_quality, best_practices, performance, security)
  - generated_at: datetime
```

**Generation method:** Automated via AI/LLM analysis of the submitted code (LLM reads code/repo content and produces a scored, categorized "roast"-style review).

**API Endpoints:**
```
POST /api/assignments/{id}/roast        - Trigger roast generation
GET  /api/assignments/{id}/roast        - Get latest roast result
GET  /api/roasts                        - List roast history for current user
GET  /api/roasts/{id}                   - Get a specific roast
```

**Frontend Pages:**
```
/assignments/{id}/roast   - Roast result view (score, feedback, categories)
/roasts                   - Feedback history across all assignments
```

---

### Module 4: Dashboard

**Description:** Overview of a student's submission activity and performance.

**Frontend Pages:**
- /dashboard - Submission status, scores over time, recent roasts, leaderboard
- /settings - User settings and preferences

---

### Module 5: Admin Panel (Post-MVP)

**Description:** Admin-only management interface for overseeing students, assignments, and roast activity.

**API Endpoints:**
- GET /admin/users - List all users
- PUT /admin/users/{id} - Update user status/role
- GET /admin/stats - Platform statistics (submissions, avg scores, activity)

**Frontend Pages:**
- /admin - Admin dashboard (protected, admin only)
- /admin/users - User management

---

## MVP SCOPE

### Must Have (MVP)
- [x] User registration and login (Email/Password + Google OAuth)
- [x] Students can create and submit assignments (code file or repo link upload)
- [x] Automated AI roast generation with score, feedback, severity, and categories
- [x] Students can view their roast results and feedback history
- [x] Basic dashboard showing submission status and scores over time

### Nice to Have (Post-MVP)
- [ ] Admin panel (user management, platform stats)
- [ ] Leaderboard
- [ ] Email notifications (welcome, password reset, roast-ready)
- [ ] Analytics dashboard with charts/reports
- [ ] Resubmission workflow refinements

---

## ACCEPTANCE CRITERIA

### Authentication
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can sign in with Google OAuth
- [ ] JWT tokens work correctly with refresh
- [ ] Protected routes redirect to login

### Assignments
- [ ] Student can create, edit, delete an assignment
- [ ] Student can submit a code file or repo link
- [ ] Student can resubmit after edits
- [ ] Assignment status transitions correctly (draft -> submitted -> reviewed)

### Reviews / Roasts
- [ ] Submitting an assignment triggers automated roast generation
- [ ] Roast result includes score, feedback text, severity, and categories
- [ ] Student can view roast history across all their assignments

### Dashboard
- [ ] Dashboard shows submission status and score trends
- [ ] Dashboard shows recent roasts

### Quality
- [ ] All API endpoints documented in OpenAPI
- [ ] Backend test coverage 80%+
- [ ] Frontend TypeScript strict mode passes
- [ ] Docker builds and runs successfully

---

## SPECIAL REQUIREMENTS

### Security
- [x] Rate limiting on auth endpoints
- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS prevention
- [x] CSRF protection (state parameter) for OAuth

### Integrations
- [ ] Email service for notifications (post-MVP)
- [ ] Payment provider (not needed for MVP)
- [x] File upload service (assignment code/file submission)
- [x] LLM/AI service for automated roast generation

---

## AGENTS

> These agents build your product in parallel:

| Agent | Role | Works On |
|-------|------|----------|
| DATABASE-AGENT | Creates all models and migrations | All database models |
| BACKEND-AGENT | Builds API endpoints and services | All modules' backends |
| FRONTEND-AGENT | Creates UI pages and components | All modules' frontends |
| DEVOPS-AGENT | Sets up Docker, CI/CD, environments | Infrastructure |

---

# READY?

```bash
/generate-prp INITIAL.md
```

Then:

```bash
/execute-prp PRPs/assignment-roaster-prp.md
```
