# PRP: Assignment Roaster

> Implementation blueprint for parallel agent execution

---

## METADATA

| Field | Value |
|-------|-------|
| **Product** | Assignment Roaster |
| **Type** | SaaS |
| **Version** | 1.0 |
| **Created** | 2026-06-20 |
| **Complexity** | Medium |

---

## PRODUCT OVERVIEW

**Description:** Assignment Roaster lets students submit code/project assignments (file upload or repo link) and automatically generates an AI-powered "roast" — a scored, categorized review with actionable feedback — replacing slow, inconsistent manual code reviews.

**Value Proposition:** Students get fast, consistent, engaging feedback on their work instead of waiting on delayed and inconsistent manual grading, increasing engagement and learning velocity.

**MVP Scope:**
- [ ] User registration and login (Email/Password + Google OAuth)
- [ ] Students can create and submit assignments (code file or repo link upload)
- [ ] Automated AI roast generation with score, feedback, severity, and categories
- [ ] Students can view their roast results and feedback history
- [ ] Basic dashboard showing submission status and scores over time

---

## TECH STACK

| Layer | Technology | Skill Reference |
|-------|------------|-----------------|
| Backend | FastAPI + Python 3.11+ | skills/BACKEND.md |
| Frontend | React + TypeScript + Vite | skills/FRONTEND.md |
| Database | PostgreSQL + SQLAlchemy | skills/DATABASE.md |
| Auth | JWT + bcrypt + Google OAuth | skills/BACKEND.md |
| UI | Chakra UI | skills/FRONTEND.md |
| Testing | pytest + RTL | skills/TESTING.md |
| Deployment | Docker + GitHub Actions | skills/DEPLOYMENT.md |

---

## DATABASE MODELS

### User Model
- id, email, hashed_password, full_name, is_active, is_verified, oauth_provider, role (student/admin), created_at

### RefreshToken Model
- id, user_id (FK -> User), token, expires_at, revoked

### Assignment Model
- id, student_id (FK -> User), title, description, language, source_type (file/repo_link), source_url_or_path, due_date, status (draft/submitted/reviewed), created_at, updated_at

### Roast Model
- id, assignment_id (FK -> Assignment), score (0-100), feedback_text, severity (low/medium/high), categories (json), generated_at

---

## MODULES

### Module 1: Authentication
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create account |
| POST | /auth/login | Get tokens |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Revoke refresh token |
| GET | /auth/me | Current user |
| PUT | /auth/me | Update profile |
| GET | /auth/google | Initiate Google OAuth |
| GET | /auth/google/callback | Google OAuth callback |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /login | LoginPage | LoginForm, GoogleSignInButton |
| /register | RegisterPage | RegisterForm |
| /forgot-password | ForgotPasswordPage | ForgotPasswordForm |
| /profile | ProfilePage | ProfileForm |

---

### Module 2: Assignments
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/assignments | List current user's assignments |
| POST | /api/assignments | Create a new assignment (draft) |
| GET | /api/assignments/{id} | Get one assignment |
| PUT | /api/assignments/{id} | Update assignment |
| DELETE | /api/assignments/{id} | Delete assignment |
| POST | /api/assignments/{id}/submit | Submit for roasting |
| POST | /api/assignments/{id}/resubmit | Resubmit after edits |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /assignments | AssignmentListPage | AssignmentCard, StatusBadge |
| /assignments/new | AssignmentCreatePage | AssignmentForm, FileUpload |
| /assignments/{id} | AssignmentDetailPage | AssignmentDetail, SubmitButton |
| /assignments/{id}/edit | AssignmentEditPage | AssignmentForm |

---

### Module 3: Reviews / Roasts
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/assignments/{id}/roast | Trigger roast generation |
| GET | /api/assignments/{id}/roast | Get latest roast result |
| GET | /api/roasts | List roast history for current user |
| GET | /api/roasts/{id} | Get a specific roast |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /assignments/{id}/roast | RoastResultPage | ScoreGauge, FeedbackPanel, CategoryTags |
| /roasts | RoastHistoryPage | RoastHistoryList |

---

### Module 4: Dashboard
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/summary | Submission status + score trend summary |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /dashboard | DashboardPage | ScoreTrendChart, RecentRoastsList, SubmissionStatusWidget |
| /settings | SettingsPage | SettingsForm |

---

## PHASE EXECUTION PLAN

**Phase 1: Foundation (4 agents in parallel)**
- DATABASE-AGENT: User, RefreshToken, Assignment, Roast models + migrations, database.py
- BACKEND-AGENT: main.py, config.py, project structure
- FRONTEND-AGENT: Vite setup, folder structure, base components
- DEVOPS-AGENT: Docker, CI/CD, env files

**Validation Gate 1:** pip install, alembic upgrade, npm install, docker-compose config

**Phase 2: Modules (backend + frontend parallel per module)**
- Auth Module: JWT + Google OAuth endpoints + Login/Register/Profile pages
- Assignments Module: CRUD + submit/resubmit endpoints + list/create/detail/edit pages
- Reviews/Roasts Module: roast generation (LLM service) + roast result/history pages
- Dashboard Module: summary endpoint + dashboard/settings pages

**Validation Gate 2:** ruff check, mypy, npm lint, npm type-check

**Phase 3: Quality (3 agents in parallel)**
- TEST-AGENT: pytest + RTL tests, 80%+ coverage
- REVIEW-AGENT: Security audit (auth, file upload, LLM input handling), performance review
- RESEARCH-AGENT: Best practices validation for LLM-based code review generation

**Final Validation:** Full test suite, docker build, health checks

---

## VALIDATION GATES

| Gate | Commands |
|------|----------|
| 1 | `alembic upgrade head`, `npm install`, `docker-compose config` |
| 2 | `ruff check backend/`, `npm run type-check` |
| 3 | `pytest --cov --cov-fail-under=80`, `npm test` |
| Final | `docker-compose up -d`, `curl localhost:8000/health` |

---

## ENVIRONMENT VARIABLES

```env
DATABASE_URL=postgresql://user:password@localhost:5432/assignment_roaster
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
LLM_API_KEY=your-llm-api-key
VITE_API_URL=http://localhost:8000
```

---

## NEXT STEP

Execute with parallel agents:
/execute-prp PRPs/assignment-roaster-prp.md
