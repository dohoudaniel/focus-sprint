# FocusSprint API Documentation 📑

This document provides a detailed technical overview of the FocusSprint backend API, including request parameters, response structures, and security considerations.

## 🔒 Security Overview

- **Authentication**: JWT-based. Protected routes require `Authorization: Bearer <token>`.
- **CORS**: Enforced via `FRONTEND_URL` environment variable.
- **Rate Limiting**: Specifically applied to AI endpoints to prevent abuse.
- **AI Safety**: Prompts are isolated via system instructions to mitigate injection attacks.

---

## 🔑 Authentication Routes

### 1. Register User
`POST /api/auth/register`

Creates a new user account with strict password validation.

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "Daniel Favour"
}
```

**Success Response (201):**
```json
{ "msg": "Account created successfully" }
```

### 2. Login
`POST /api/auth/login`

Authenticates a user and issues a JWT token.

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbG...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Daniel Favour"
  }
}
```

---

## 📂 Session Management

### 1. Get All Sessions
`GET /api/sessions` (Auth Required)

Retrieves a list of all logged sessions for the current user, sorted by date.

**Success Response (200):**
`Array<SessionObject>`

### 2. Create Session
`POST /api/sessions` (Auth Required)

Logs a new focus session.

**Body (JSON):**
```json
{
  "duration": 25,
  "startTime": "09:00",
  "endTime": "09:25",
  "date": "2026-03-18",
  "note": "Deep work on backend docs",
  "status": "completed"
}
```

---

## 🧠 AI & Productivity Insights

All AI routes are rate-limited and require a valid JWT.

### 1. AI Focus Coach
`GET /api/ai/coach`

Provides 5 data-driven insights based on the last 60 sessions.

**Response Schema:**
```json
{
  "insights": [
    { "type": "warning", "text": "Pattern: **Avoidance** on Wednesdays detected." },
    { "type": "win", "text": "You excel at **90-minute** deep work sprints." }
  ],
  "session_count": 60,
  "completion_rate": 85.5
}
```

### 2. Burnout Detection
`GET /api/ai/burnout`

Analyses fatigue signals and provides a recovery plan.

**Response Schema:**
```json
{
  "level": "moderate",
  "score": 45,
  "signals": ["Session length dropped 20% recently"],
  "message": "Caution: Your energy is dipping.",
  "recommendation": "Try a **light 25m focus** day tomorrow.",
  "metrics": { ... }
}
```

### 3. Optimal Schedule
`GET /api/ai/schedule`

Identifies peak performance windows based on historical completion rates.

**Response Schema:**
```json
{
  "peak_hours": [ { "hour": 9, "label": "09:00 – 10:00", "session_count": 12, "avg_duration": 45 } ],
  "peak_days": [ { "day": "Tuesday", "session_count": 20, "avg_duration": 50 } ],
  "heatmap": { "Monday": { "9": 5, "10": 2 }, ... }
}
```

### 4. Daily Focus Plan
`GET /api/ai/daily-plan`

Generates a personalised schedule for the current day.

**Response Schema:**
```json
{
  "greeting": "Focus hard, **Daniel**.",
  "status": "on_track",
  "daily_word": "RELENTLESS",
  "sprints": [ { "time": "14:00", "duration": 25, "task": "Finish API Docs", "priority": "high" } ],
  "tip": "The first 5 minutes are the hardest."
}
```

### 5. AI Coach Chat
`POST /api/ai/chat`

Advanced conversational interface with the AI coach.

**Body (JSON):**
```json
{
  "message": "Why am I struggling to focus today?",
  "history": [ { "role": "user", "content": "..." } ]
}
```

**Response Schema:**
```json
{ "reply": "Based on your data, you usually struggle after **3 sessions** without a break..." }
```

---

## 🛠 Generic Endpoints

### Health Check
`GET /health`

**Response:** `{ "status": "healthy", "version": "1.0.0" }`

### Index
`GET /`

**Response:** `{ "project": "FocusSprint", ... }`
