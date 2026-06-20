# CLAUDE.md - Assignment Roaster Project Rules

> Project-specific rules for Claude Code. This file is read automatically.

---

## Project Overview

**Project Name:** Assignment Roaster
**Description:** Automated, AI-powered evaluation ("roasting") of student code/project submissions — replacing slow, inconsistent manual reviews with fast, consistent, engaging feedback.
**Tech Stack:**
- Backend: FastAPI + Python 3.11+
- Frontend: React + Vite + TypeScript
- Database: PostgreSQL + SQLAlchemy
- Auth: JWT + Email/Password + Google OAuth
- UI: Chakra UI

---

## Project Structure

```
assignment-roaster/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── assignment.py
│   │   │   └── roast.py
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   │   └── roast_engine.py   # LLM-based roast generation
│   │   └── auth/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── types/
│   └── package.json
├── .claude/
│   └── commands/
├── skills/
├── agents/
└── PRPs/
```

---

## Code Standards

### Python (Backend)
```python
# ALWAYS use type hints
def get_assignment(db: Session, assignment_id: int) -> Assignment:
    pass

# ALWAYS add docstrings for public functions
def create_roast(db: Session, assignment: Assignment) -> Roast:
    """
    Generate and persist an AI roast for a submitted assignment.

    Args:
        db: Database session
        assignment: The submitted Assignment object

    Returns:
        Created Roast object
    """
    pass
```

### TypeScript (Frontend)
```typescript
// ALWAYS define interfaces for props and data
interface RoastProps {
  id: number;
  score: number;
  feedbackText: string;
  severity: "low" | "medium" | "high";
  categories: string[];
}

// NO any types allowed
const fetchRoast = async (assignmentId: number): Promise<RoastProps> => {
  // ...
};
```

---

## Forbidden Patterns

### Backend
- ❌ Never use `print()` - use `logging` module
- ❌ Never store passwords in plain text
- ❌ Never hardcode secrets - use environment variables
- ❌ Never use `SELECT *` - specify columns
- ❌ Never skip input validation
- ❌ Never execute or `eval()` submitted student code directly - analyze statically/via LLM only

### Frontend
- ❌ Never use `any` type
- ❌ Never leave console.log in production
- ❌ Never skip error handling in async operations
- ❌ Never use inline styles - use Chakra UI

---

## Module-Specific Rules

### Assignments Module
- Every assignment must belong to a student (`student_id` foreign key)
- Assignment status must be one of: `draft`, `submitted`, `reviewed`
- Only the owning student (or an admin) can view/edit/delete an assignment
- Submission requires either a file upload or a repo link, not both

### Reviews/Roasts Module
- A roast is only generated for assignments with status `submitted`
- Roast score must be an integer 0-100
- Roast severity must be one of: `low`, `medium`, `high`
- Roast generation must never execute submitted code — analysis is static/LLM-based only
- Each roast is tied to exactly one assignment (`assignment_id` foreign key)

### Dashboard Module
- Dashboard data must be scoped to the current user (no cross-student data leakage) unless the user is an admin

---

## API Conventions

- All endpoints prefixed with `/api/v1/`
- Use plural nouns for resources: `/assignments`, `/roasts`
- Return appropriate HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 404: Not Found
  - 409: Conflict

---

## Authentication

### JWT Configuration
- Access token expires: 30 minutes
- Refresh token expires: 7 days
- Algorithm: HS256

### OAuth Providers
- Google OAuth 2.0 enabled
- Always verify state parameter for CSRF protection

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/assignment_roaster

# Auth
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# LLM / Roast Generation
LLM_API_KEY=your-llm-api-key

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## Development Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d

# Tests
pytest backend/tests -v
cd frontend && npm test

# Linting
ruff check backend/
cd frontend && npm run lint
```

---

## Commit Message Format

```
feat(assignments): add [feature]
fix(roasts): fix [bug]
refactor(dashboard): refactor [component]
test(auth): add tests for [feature]
docs: update [documentation]
```

---

## Skills Reference

| Task | Skill to Read |
|------|---------------|
| Database models | skills/DATABASE.md |
| API + Auth | skills/BACKEND.md |
| React + UI | skills/FRONTEND.md |
| Testing | skills/TESTING.md |
| Deployment | skills/DEPLOYMENT.md |

---

## Agent Coordination

For complex tasks, the ORCHESTRATOR coordinates:
- DATABASE-AGENT → Backend models
- BACKEND-AGENT → API development
- FRONTEND-AGENT → UI components
- DEVOPS-AGENT → Deployment

Read agent definitions in `/agents/` folder.
