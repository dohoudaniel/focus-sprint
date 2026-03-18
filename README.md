# FocusSprint 🚀

A high-performance deep work and productivity ecosystem designed for the Remote Hustle Program. FocusSprint combines precision timing with data-driven AI coaching to help users master their flow state and prevent burnout.

## ✨ Key Features

- **AI Productivity Coach**: Personalised, "brutally" direct feedback based on real session data using Google Gemini.
- **Dynamic Daily Sprint Plan**: AI-generated schedules that adapt to your morning/evening energy and recent work notes.
- **Precision Focus Timer**: A customisable timer with a "Zen Bowl" harmonic chime to transition out of deep work gracefully.
- **Burnout Detector**: Scientific analysis of your focus patterns to identify fatigue before it becomes a problem.
- **Performance Analytics**: Real-time focus scores, completion rates, and historical session logs.
- **Secure by Design**: Integrated rate limiting and prompt injection protection for all AI features.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **State & Logic**: TanStack Query (Data fetching) & Framer Motion (Animations)
- **UI Components**: Shadcn UI

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL (via Supabase) / SQLite
- **AI Engine**: Google Gemini 1.5 Flash / 3.1 Pro Preview
- **Security**: Flask-Limiter, JWT Authentication, CORS enforcement

## 📁 Repository Structure

```
.
├── backend/            # Flask API, AI logic, and Database models
└── frontend/           # React application and UI components
```

## 🚀 Getting Started

1. **Clone the repository**
2. **Setup Backend**: Follow instructions in `backend/README.md`
3. **Setup Frontend**: Follow instructions in `frontend/README.md`

Built with ❤️ for remote high-performers.
