import os
import json
from collections import defaultdict
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Session, User, ChatMessage
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


from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Rate limiting to prevent brute AI abuse
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

def call_gemini(user_prompt: str, system_instruction: str = "") -> str:
    """Call Gemini with strict system instruction to prevent prompt injection."""
    try:
        # Use system_instruction parameter if available 
        # (gemini-3.1-pro-preview supports this as a core security feature)
        model = genai.GenerativeModel(
            model_name="gemini-3.1-pro-preview",
            system_instruction=system_instruction
        )
        response = model.generate_content(user_prompt)
        return response.text.strip()
    except Exception as e:
        # Raise exception so the calling route can handle its own fallback
        raise e


# ---------------------------------------------------------------------------
# 1. AI Focus Coach
# ---------------------------------------------------------------------------
@ai_bp.route('/coach', methods=['GET'])
@jwt_required()
@limiter.limit("10 per minute")
def ai_coach():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    user_name = user.name if user and user.name else "Focus Warrior"
    
    sessions = get_user_sessions(user_id, limit=60)
    context = build_session_context(sessions)
    
    total = len(sessions)
    completed = [s for s in sessions if s['status'] == 'completed']
    completed_count = len(completed)
    
    # Calculate more stats for the prompt
    today_str = datetime.now().strftime("%Y-%m-%d")
    sessions_today = [s for s in completed if s['date'] == today_str]
    total_focus_today = sum(s['duration'] for s in sessions_today)
    avg_session_length = round(sum(s['duration'] for s in completed) / completed_count, 1) if completed_count > 0 else 0
    
    system_instruction = f"""You are a high-performance productivity coach. 
Analyse the user's focus session data and provide exactly 5 data-driven insights.

RULES:
1. Address the user directly as "{user_name}".
2. Be scientific, data-driven, and "brutally" direct. No generic motivation.
3. Identify patterns: "Every Wednesday you fail 50%", "Your notes are shorter when you work after 9pm," etc.
4. Each insight must be 1 sentence. Use Markdown (e.g., **bold**) for key metrics or warnings.
5. Format as a JSON array of objects with keys "type" (one of: "warning", "insight", "win", "action") and "text" (the insight sentence).
6. Return ONLY valid JSON.
"""

    user_prompt = f"""USER PROFILE & METRICS:
- Name: {user_name}
- Total sessions analysed: {total}
- Overall Completion Rate: {round((completed_count / total * 100) if total > 0 else 0, 1)}%
- Average Fokus Duration: {avg_session_length} minutes
- Total focus time today: {total_focus_today} minutes

SESSION DATA HISTORY (last 60):
{context}"""

    raw = call_gemini(user_prompt, system_instruction)
    
    try:
        clean = raw.strip().lstrip('```json').lstrip('```').rstrip('```').strip()
        insights = json.loads(clean)
        if not isinstance(insights, list):
            raise ValueError("Expected list")
        return jsonify({
            "insights": insights, 
            "session_count": total, 
            "completion_rate": round((completed_count / total * 100) if total > 0 else 0, 1),
            "user_name": user_name
        })
    except Exception:
        return jsonify({
            "insights": [{"type": "insight", "text": f"Focus harder, {user_name}."}], 
            "session_count": total, 
            "completion_rate": 0
        })


# ---------------------------------------------------------------------------
# 2. Burnout Detection
# ---------------------------------------------------------------------------
@ai_bp.route('/burnout', methods=['GET'])
@jwt_required()
@limiter.limit("5 per minute")
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
    elif score >= 30:
        level = "moderate"
    else:
        level = "low"

    # AI Recommendation Generation
    system_instruction = """You are a productivity wellness expert. 
Analyse burnout signals for a worker and provide a direct message and a specific actionable recommendation.
Use Markdown (e.g. **bold**) for emphasis on critical findings.
Return ONLY a JSON object:
{
  "message": "A 1-sentence summary of their current state",
  "recommendation": "A 1-2 sentence recovery or optimization plan"
}"""
    
    user_prompt = f"""DATA:
- Burnout Risk Score: {score}/100
- Detected Level: {level}
- Signals: {", ".join(signals) if signals else "No negative signals detected."}"""

    raw = call_gemini(user_prompt, system_instruction)
    try:
        clean = raw.strip().lstrip('```json').lstrip('```').rstrip('```').strip()
        ai_res = json.loads(clean)
        if not isinstance(ai_res, dict):
            raise ValueError("Expected object")
        message = ai_res.get("message", "Stay focused.")
        rec = ai_res.get("recommendation", "Your patterns look sustainable.")
    except:
        message = "Patterns detected. Adjusting pace recommended."
        rec = "Focus on consistency rather than intensity today."

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
@limiter.limit("10 per minute")
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
@limiter.limit("10 per minute")
def daily_plan():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    user_name = user.name if user and user.name else "Focus Warrior"

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
    
    system_instruction = f"""You are a precision focus coach generating a personalised daily sprint plan for {user_name}.
Generate a focused, practical sprint plan. Return ONLY valid JSON:
{{
  "greeting": "One sharp, personalised greeting sentence addressing {user_name}. Use Markdown (e.g., **bold**) for emphasis.",
  "status": "on_track" | "behind" | "great_day" | "rest_recommended",
  "sprints": [
    {{"time": "HH:MM", "duration": 25, "task": "suggested task or focus area", "priority": "high" | "medium" | "low"}}
  ],
  "tip": "one ultra-specific tip for {user_name} based on their patterns. Use Markdown for emphasis.",
  "daily_word": "one word that captures the focus energy for today"
}}
Rules:
- Max 4 sprints. Only suggest times after {hour:02d}:00.
- Tasks should reference user's recent notes if possible.
- If it is late (after 20:00), recommend rest or wind-down only.
- Return ONLY valid JSON and use clear Markdown formatting in string fields.
"""

    user_prompt = f"""CURRENT CONTEXT:
- Day: {day_name}
- Current time: {hour:02d}:00
- Focus time logged today: {focus_today} minutes
- Recent work notes: {notes_context}

RELEVANT SESSIONS:
{context}"""

    raw = call_gemini(user_prompt, system_instruction)
    
    try:
        clean = raw.strip().lstrip('```json').lstrip('```').rstrip('```').strip()
        plan = json.loads(clean)
        if not isinstance(plan, dict):
            raise ValueError("Expected object")
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
@limiter.limit("20 per minute")
def ai_chat():
    user_id = get_jwt_identity()
    data = request.json or {}
    message = data.get("message")
    history = data.get("history", []) # List of { "role": "user" | "bot", "text": "..." }

    if not message:
        return jsonify({"error": "Message required"}), 400

    sessions = get_user_sessions(user_id, limit=30)
    context = build_session_context(sessions)

    # Long-term memory: Fetch last 20 messages from DB for deep context
    db_messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.desc()).limit(20).all()
    db_messages.reverse() # Order chronologically for the LLM
    
    history_str = ""
    for m in db_messages:
        role = "User" if m.role == "user" else "Coach"
        history_str += f"{role}: {m.content}\n"

    system_instruction = f"""You are the FocusSprint AI Productivity Coach. 
Your primary purpose is to help the user master their productivity using FocusSprint.

CORE PRINCIPLES:
1. ONLY discuss productivity, habits, deep work, and session history.
2. If the user wanders off-topic, politely and firmly redirect them to focus. 
3. Use their data and PREVIOUS CONVERSATIONS to give highly specific, high-impact feedback.
4. If you notice patterns mentioned in older messages, reference them (e.g., "Last time we talked about X, how is that going?").
5. Keep replies crisp and professional.
"""

    user_prompt = f"""USER DATA (Last 30 sessions):
{context}

CHAT HISTORY:
{history_str}
User: {message}"""

    # Store user message
    user_msg = ChatMessage(user_id=user_id, role="user", content=message)
    db.session.add(user_msg)
    
    # Get reply
    reply = call_gemini(user_prompt, system_instruction)
    
    # Store bot message
    bot_msg = ChatMessage(user_id=user_id, role="bot", content=reply)
    db.session.add(bot_msg)
    db.session.commit()
    
    return jsonify({"reply": reply})


@ai_bp.route('/chat/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    user_id = get_jwt_identity()
    messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).all()
    return jsonify([m.to_dict() for m in messages])


@ai_bp.route('/chat', methods=['DELETE'])
@jwt_required()
def clear_chat_history():
    user_id = get_jwt_identity()
    ChatMessage.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({"msg": "Chat history cleared"}), 200


@ai_bp.route('/recommendations', methods=['GET'])
@jwt_required()
@limiter.limit("5 per minute")
def ai_recommendations():
    user_id = get_jwt_identity()
    sessions = get_user_sessions(user_id, limit=30)
    context = build_session_context(sessions)

    system_instruction = """Recommend 4 highly relevant articles or topics for the user.
Return ONLY a JSON list of objects:
[{"title": "Title", "description": "Desc", "topic": "Category", "url": "HTTPS URL"}]
Rules:
- Return ONLY valid JSON.
"""
    user_prompt = f"USER PERFORMANCE DATA:\n{context}"

    raw = call_gemini(user_prompt, system_instruction)
    try:
        clean = raw.strip().lstrip('```json').lstrip('```').rstrip('```').strip()
        recommendations = json.loads(clean)
        if not isinstance(recommendations, list):
            raise ValueError("AI should return a JSON list of objects.")
        return jsonify(recommendations)
    except Exception:
        return jsonify([
            { "title": "The Art of Deep Work", "description": "James Clear's guide to mastering focus.", "topic": "Focus", "url": "https://jamesclear.com/deep-work" },
            { "title": "Atomic Habits", "description": "How to build systems that last.", "topic": "Habits", "url": "https://jamesclear.com/atomic-habits" },
            { "title": "Getting Things Done", "description": "The science of stress-free productivity.", "topic": "Mindset", "url": "https://gettingthingsdone.com/what-is-gtd/" }
        ])
