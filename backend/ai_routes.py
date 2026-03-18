import os
import json
from collections import defaultdict
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Session
import google.generativeai as genai

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY', ''))


def get_user_sessions(user_id: str, limit: int = 60):
    """Fetch the last N sessions for a user."""
    sessions = (
        Session.query
        .filter_by(user_id=user_id)
        .order_by(Session.created_at.desc())
        .limit(limit)
        .all()
    )
    return [s.to_dict() for s in sessions]


def build_session_context(sessions: list) -> str:
    """Format session list into a compact LLM-readable string."""
    if not sessions:
        return "No sessions recorded yet."
    lines = []
    for s in sessions:
        note = s.get("note") or "—"
        lines.append(
            f"- Date: {s['date']}, Start: {s['startTime']}, End: {s['endTime']}, "
            f"Duration: {s['duration']}min, Status: {s['status']}, Note: \"{note}\""
        )
    return "\n".join(lines)


def call_gemini(prompt: str) -> str:
    """Call Gemini Flash and return the response text."""
    try:
        model = genai.GenerativeModel("gemini-3.1-pro-preview")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"AI unavailable: {str(e)}"


# ---------------------------------------------------------------------------
# 1. AI Focus Coach
# ---------------------------------------------------------------------------
@ai_bp.route('/coach', methods=['GET'])
@jwt_required()
def ai_coach():
    user_id = get_jwt_identity()
    sessions = get_user_sessions(user_id, limit=60)
    context = build_session_context(sessions)
    total = len(sessions)
    completed = len([s for s in sessions if s['status'] == 'completed'])
    
    prompt = f"""You are a brutally honest, data-driven focus performance coach.
A user has given you their last {total} focus sprint sessions. Analyse the data and deliver exactly 5 sharp, personalised, actionable insights.

SESSION DATA:
{context}

RULES:
- Be direct. No fluff. No motivational clichés.
- Reference specific patterns you see in the data (times, durations, completion rates, note themes).
- Each insight should be a single sentence that either reveals a truth or prescribes a specific action.
- Format as a JSON array of objects with keys "type" (one of: "warning", "insight", "win", "action") and "text" (the insight sentence).
- Return ONLY valid JSON. No markdown, no explanation.

Example format:
[
  {{"type": "warning", "text": "Your completion rate drops to 12% after 4pm — stop scheduling deep work in the afternoon."}},
  {{"type": "win", "text": "Tuesday mornings are your superpower — you complete 94% of sessions before noon."}}
]"""

    raw = call_gemini(prompt)
    
    try:
        # Strip any markdown code fences if present
        clean = raw.strip().lstrip('```json').lstrip('```').rstrip('```').strip()
        insights = json.loads(clean)
        return jsonify({"insights": insights, "session_count": total, "completion_rate": round((completed / total * 100) if total > 0 else 0, 1)})
    except Exception:
        return jsonify({"insights": [{"type": "insight", "text": raw}], "session_count": total, "completion_rate": 0})


# ---------------------------------------------------------------------------
# 2. Burnout Detection
# ---------------------------------------------------------------------------
@ai_bp.route('/burnout', methods=['GET'])
@jwt_required()
def burnout_check():
    user_id = get_jwt_identity()
    sessions = get_user_sessions(user_id, limit=30)
    completed = [s for s in sessions if s['status'] == 'completed']

    if len(completed) < 5:
        return jsonify({
            "level": "unknown",
            "score": 0,
            "signals": [],
            "message": "Not enough data yet. Complete at least 5 sessions.",
            "recommendation": "Keep going — you're building the habit."
        })

    # Split sessions into two halves: older vs recent
    half = len(completed) // 2
    older = completed[half:]
    recent = completed[:half]

    def avg_duration(s_list):
        return sum(s['duration'] for s in s_list) / len(s_list) if s_list else 0

    avg_old = avg_duration(older)
    avg_new = avg_duration(recent)
    duration_drop = ((avg_old - avg_new) / avg_old * 100) if avg_old > 0 else 0

    # Gap analysis: max gap between sessions
    dates = sorted(set(s['date'] for s in completed))
    gaps = []
    for i in range(1, len(dates)):
        d1 = datetime.strptime(dates[i-1], "%Y-%m-%d")
        d2 = datetime.strptime(dates[i], "%Y-%m-%d")
        gaps.append((d2 - d1).days)
    avg_gap = sum(gaps) / len(gaps) if gaps else 0

    # Note length analysis
    recent_notes = [s.get('note') or '' for s in recent]
    avg_note_len = sum(len(n) for n in recent_notes) / len(recent_notes) if recent_notes else 0

    # Score burn out risk 0–100
    score = 0
    signals = []

    if duration_drop > 20:
        score += 35
        signals.append(f"Session length dropped {round(duration_drop)}% recently — fatigue signal.")
    if avg_gap > 2:
        score += 30
        signals.append(f"Average {round(avg_gap, 1)} days between sessions — avoidance pattern detected.")
    if avg_note_len < 10 and len(recent) > 3:
        score += 20
        signals.append("Very short or absent session notes — possible disengagement.")
    if len(recent) < len(older) * 0.6:
        score += 15
        signals.append("Fewer sessions in the last period compared to before.")

    # Classify level
    if score >= 60:
        level = "high"
        message = "You are showing strong burnout signals. Your output is degrading."
        rec = "Take 1–2 full rest days. Then restart with one 15-minute sprint, no pressure. Do not aim for peak output this week."
    elif score >= 30:
        level = "moderate"
        message = "Warning signs present. You're not burned out yet, but you're trending that way."
        rec = "Reduce session length by 30% for 3 days. Prioritise sleep. One sprint in the morning only."
    else:
        level = "low"
        message = "No burnout risk detected. Your patterns look sustainable."
        rec = "Stay consistent. Your current rhythm is working."

    return jsonify({
        "level": level,
        "score": min(score, 100),
        "signals": signals,
        "message": message,
        "recommendation": rec,
        "metrics": {
            "avg_duration_old": round(avg_old, 1),
            "avg_duration_recent": round(avg_new, 1),
            "avg_gap_days": round(avg_gap, 1),
            "avg_note_length": round(avg_note_len, 1)
        }
    })


# ---------------------------------------------------------------------------
# 3. Optimal Schedule
# ---------------------------------------------------------------------------
@ai_bp.route('/schedule', methods=['GET'])
@jwt_required()
def optimal_schedule():
    user_id = get_jwt_identity()
    sessions = get_user_sessions(user_id, limit=90)
    completed = [s for s in sessions if s['status'] == 'completed']

    if len(completed) < 5:
        return jsonify({
            "peak_hours": [],
            "peak_days": [],
            "heatmap": {},
            "message": "Need at least 5 sessions to identify patterns."
        })

    # Build hour-of-day completion map
    hour_stats = defaultdict(lambda: {"count": 0, "total_duration": 0})
    day_stats = defaultdict(lambda: {"count": 0, "total_duration": 0})
    heatmap = defaultdict(lambda: defaultdict(int))  # day -> hour -> count

    for s in completed:
        try:
            hour = int(s['startTime'].split(':')[0])
            dt = datetime.strptime(s['date'], "%Y-%m-%d")
            day_name = dt.strftime("%A")

            hour_stats[hour]["count"] += 1
            hour_stats[hour]["total_duration"] += s['duration']
            day_stats[day_name]["count"] += 1
            day_stats[day_name]["total_duration"] += s['duration']
            heatmap[day_name][hour] += 1
        except Exception:
            continue

    # Sort by count
    sorted_hours = sorted(hour_stats.items(), key=lambda x: x[1]["count"], reverse=True)
    sorted_days = sorted(day_stats.items(), key=lambda x: x[1]["count"], reverse=True)

    peak_hours = [
        {
            "hour": h,
            "label": f"{h:02d}:00 – {h+1:02d}:00",
            "session_count": stats["count"],
            "avg_duration": round(stats["total_duration"] / stats["count"], 1)
        }
        for h, stats in sorted_hours[:5]
    ]

    peak_days = [
        {
            "day": d,
            "session_count": stats["count"],
            "avg_duration": round(stats["total_duration"] / stats["count"], 1)
        }
        for d, stats in sorted_days[:3]
    ]

    # Format heatmap for frontend
    heatmap_formatted = {
        day: dict(hours) for day, hours in heatmap.items()
    }

    return jsonify({
        "peak_hours": peak_hours,
        "peak_days": peak_days,
        "heatmap": heatmap_formatted,
        "message": f"Based on {len(completed)} completed sessions."
    })


# ---------------------------------------------------------------------------
# 4. Daily Focus Plan
# ---------------------------------------------------------------------------
@ai_bp.route('/daily-plan', methods=['GET'])
@jwt_required()
def daily_plan():
    user_id = get_jwt_identity()
    sessions = get_user_sessions(user_id, limit=20)
    
    now = datetime.now()
    hour = now.hour
    day_name = now.strftime("%A")
    
    # Sessions today
    today_str = now.strftime("%Y-%m-%d")
    sessions_today = [s for s in sessions if s['date'] == today_str]
    focus_today = sum(s['duration'] for s in sessions_today if s['status'] == 'completed')
    
    # Recent session notes for context
    recent_notes = [s.get('note') or '' for s in sessions[:5] if s.get('note')]
    notes_context = ", ".join(recent_notes) if recent_notes else "no recent notes"

    context = build_session_context(sessions[:10])
    
    prompt = f"""You are a precision focus coach generating a personalised daily sprint plan.

CURRENT CONTEXT:
- Day: {day_name}
- Current time: {hour:02d}:00
- Focus time logged today: {focus_today} minutes
- Recent work notes: {notes_context}

RECENT SESSIONS:
{context}

Generate a focused, practical sprint plan for the rest of today. Return ONLY valid JSON (no markdown):
{{
  "greeting": "one sharp, personalised greeting sentence",
  "status": "on_track" | "behind" | "great_day" | "rest_recommended",
  "sprints": [
    {{"time": "HH:MM", "duration": 25, "task": "suggested task or focus area", "priority": "high" | "medium" | "low"}}
  ],
  "tip": "one ultra-specific tip for this user based on their patterns",
  "daily_word": "one word that captures the focus energy for today"
}}

Rules:
- Max 4 sprints. Only suggest times after {hour:02d}:00.
- Tasks should reference user's recent notes if possible.
- If it is late (after 20:00), recommend rest or wind-down only.
- Be concise and direct."""

    raw = call_gemini(prompt)
    
    try:
        clean = raw.strip().lstrip('```json').lstrip('```').rstrip('```').strip()
        plan = json.loads(clean)
        plan['focus_today_min'] = focus_today
        plan['sessions_today'] = len(sessions_today)
        return jsonify(plan)
    except Exception:
        return jsonify({
            "greeting": f"Good {'morning' if hour < 12 else 'afternoon' if hour < 17 else 'evening'}. Let's make this count.",
            "status": "on_track",
            "sprints": [{"time": f"{hour+1:02d}:00", "duration": 25, "task": "Deep work — your most important task", "priority": "high"}],
            "tip": "The first sprint is always the hardest. Start it anyway.",
            "daily_word": "EXECUTE",
            "focus_today_min": focus_today,
            "sessions_today": len(sessions_today)
        })


@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    user_id = get_jwt_identity()
    data = request.json or {}
    message = data.get("message")
    history = data.get("history", []) # List of { "role": "user" | "bot", "text": "..." }

    if not message:
        return jsonify({"error": "Message required"}), 400

    sessions = get_user_sessions(user_id, limit=30)
    context = build_session_context(sessions)

    # Format history for prompt
    history_str = ""
    for turn in history[-10:]: # Keep only last 10 exchanges
        role = "User" if turn["role"] == "user" else "Coach"
        history_str += f"{role}: {turn['content']}\n"

    system_prompt = f"""You are the FocusSprint AI Productivity Coach. 
Your primary purpose is to help the user master their productivity using FocusSprint.

USER DATA (Last 30 sessions):
{context}

CORE PRINCIPLES:
1. ONLY discuss productivity, habits, deep work, and session history.
2. If the user wanders off-topic (news, code, entertainment), politely and firmly redirect them to focus. 
3. Use their data (like completed vs failed sessions or session notes) to give specific, "brutal" but helpful feedback.
4. Keep replies crisp and high-impact.

CHAT HISTORY:
{history_str}
User: {message}
Coach:"""

    reply = call_gemini(system_prompt)
    return jsonify({"reply": reply})
