# FocusSprint Frontend ⚛️

A high-performance React application designed for peak productivity and deep work mastery.

## ✨ Features & User Experience

- **Interactive Deep Work Timer**: A precision-engineered timer with custom presets (25m, 50m, 90m) and manual duration control.
- **Harmonious Audio Engineering**: Features a custom "Zen Bowl" chime that leverages layered harmonics to notify you of session completion without breaking your mental flow.
- **AI-Powered Dashboard**: Integrated with real-time backend analytics to provide:
  - **Dynamic Daily Focus Plan**: AI-suggested sprints based on your current time and work notes.
  - **AI Coach Insights**: Scientific feedback on your focus patterns.
  - **Article Recommendations**: Personalized reading list to optimize your habits.
- **Performance Grading**: Real-time Focus Score and Grade based on consistency and deep work volume.
- **Modern UI Architecture**: Built with a sleek dark-mode aesthetic, utilizing Framer Motion for micro-interactions and Shadcn UI for accessible, premium components.

## 🛠️ Technology Stack

- **React 18 + TypeScript**: State-of-the-art UI development.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Utility-first styling with custom "Iosevka Charon" typography.
- **TanStack Query (v5)**: Efficient data fetching and real-time state synchronization using query invalidation.
- **Web Audio API**: Real-time sound synthesis for the Zen Bowl experience.

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Environment Variables**: Use `.env.example` as a template:
   - `VITE_API_URL`: The URL of your backend API.
3. **Start Development Server**: `npm run dev`

## 📁 Key Components

| Component | Purpose |
|---|---|
| `TimerCard` | The core focus engine with interactive controls and Zen sound. |
| `DailyFocusPlan` | Displays AI-generated schedules and greetings. |
| `FocusScore` | Real-time grading and consistency analytics. |
| `AIRecommendations` | Personalized article suggestions. |

Optimized for high-performers. Developed with React & ❤️.
