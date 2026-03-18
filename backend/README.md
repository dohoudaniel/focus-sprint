# FocusSprint Backend 🐍

A robust Flask API designed to power real-time productivity analysis and AI coaching.

## 🚀 Key Features

- **AI-Driven Analytics**: Integrates with Google Gemini for coaching, daily planning, and burnout detection.
- **Persistent AI Chat**: Full database-backed chat history (ChatMessage model) with cross-device sync.
- **Long-term AI Memory**: Context-aware coaching that retrieves and analyzes previous user interactions for personalized advice.
- **JWT Authorization**: Secure, role-based access for all user sessions and data.
- **Dynamic Scoring**: On-the-fly burnout risk scores and focus grade calculation.

## 🔒 Security Implementation

The backend is built with hardened security measures to ensure stable and safe AI operations:

### 1. Rate Limiting (Brute Force Protection)
- **Implemented with Flask-Limiter**: Specifically throttles AI endpoints to prevent abuse and manage API quota effectively.
- **Dynamic Limits**: 10 requests/min for daily plans, 5 requests/min for burnout checks, and 20 requests/min for real-time chat.

### 2. Prompt Injection Mitigation
- **System Instruction Isolation**: All Gemini calls use the `system_instruction` parameter to isolate the core behavioral rules and project logic from user-provided inputs (like session notes).
- **Data Sanitization**: User context is treated as passive data during the LLM conversation, preventing context-hijacking.

### 3. Strict CORS Policies
- **FRONTEND_URL Enforcement**: CORS only allows cross-origin requests from the designated frontend URL set in the `.env` file.

## 📍 API Routes (Summary)

| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | User registration with password validation |
| `/api/auth/login` | POST | Login and JWT token issuance |
| `/api/sessions` | GET/POST | Fetch or log user focus sessions |
| `/api/ai/chat` | POST/DELETE | Real-time chat with the AI Coach (stores to DB) |
| `/api/ai/chat/history` | GET | Retrieve full synchronized chat history |
| `/api/ai/coach` | GET | Scientific insights based on last 60 sessions |
| `/api/ai/burnout` | GET | Burnout risk analysis and recovery advice |
| `/api/ai/daily-plan` | GET | Personalised focus schedule for the day |
| `/api/ai/recommendations` | GET | Data-driven article recommendations |

## 🛠 Setup

1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Environment Variables**: Copy `.env.example` to `.env` and fill in:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `FRONTEND_URL`: The URL of your React frontend for CORS security
   - `SUPABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET_KEY`: A complex secret key for signing tokens
   - `DEBUG`: Set to `True` for development, `False` for production.
3. **Run Database Migrations**: `flask db upgrade` (or run `python3 init_db.py` for fresh setup)
4. **Start the server**: `python3 app.py`

Recommended: Use a virtual environment (`python -m venv venv`) before installing dependencies.
