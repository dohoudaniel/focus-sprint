import os
import re
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from datetime import timedelta
from extensions import db, migrate, jwt

# Load environment variables
load_dotenv()

# Import models to ensure they are registered with SQLAlchemy
from models import User, Session
from ai_routes import ai_bp

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SUPABASE_URL', 'sqlite:///focus_sprint.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # CORS setup
    CORS(app, resources={r"/*": {"origins": os.getenv('FRONTEND_URL', 'http://localhost:5173').split(',')}})

    # Register Blueprints
    app.register_blueprint(ai_bp)

    # Auth Routes
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"msg": "Email and password are required"}), 400
        
        email = data['email']
        password = data['password']
        name = data.get('name')

        # Email validation
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({"msg": "Invalid email format"}), 400

        # Password strength validation
        # Minimum 8 characters, at least one uppercase, one lowercase, and one number
        if len(password) < 8:
            return jsonify({"msg": "Password must be at least 8 characters long"}), 400
        if not any(char.isupper() for char in password):
            return jsonify({"msg": "Password must contain at least one uppercase letter"}), 400
        if not any(char.islower() for char in password):
            return jsonify({"msg": "Password must contain at least one lowercase letter"}), 400
        if not any(char.isdigit() for char in password):
            return jsonify({"msg": "Password must contain at least one digit"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "An account with this email already exists"}), 400
        
        user = User(email=email, name=name)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        return jsonify({"msg": "Account created successfully"}), 201

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()
        
        if user and user.check_password(data.get('password')):
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token, user=user.to_dict()), 200
        
        return jsonify({"msg": "Bad email or password"}), 401

    # Session Routes
    @app.route('/api/sessions', methods=['GET'])
    @jwt_required()
    def get_sessions():
        user_id = get_jwt_identity()
        sessions = Session.query.filter_by(user_id=user_id).order_by(Session.created_at.desc()).all()
        return jsonify([s.to_dict() for s in sessions]), 200

    @app.route('/api/sessions', methods=['POST'])
    @jwt_required()
    def create_session():
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'duration' not in data:
            return jsonify({"msg": "Missing session data"}), 400

        # Validate duration
        try:
            duration = int(data['duration'])
            if duration <= 0 or duration > 1440:
                return jsonify({"msg": "Invalid duration. Must be 1-1440 minutes."}), 400
        except (ValueError, TypeError):
            return jsonify({"msg": "Duration must be an integer."}), 400

        new_session = Session(
            user_id=user_id,
            duration=duration,
            start_time=data['startTime'],
            end_time=data['endTime'],
            date=data['date'],
            note=data.get('note', ''),
            status=data.get('status', 'completed')
        )
        db.session.add(new_session)
        db.session.commit()
        
        return jsonify(new_session.to_dict()), 201

    # Health Check
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "FocusSprint Backend is operational",
            "version": "1.0.0"
        }), 200

    # Index route
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            "project": "FocusSprint",
            "description": "API for Focused Remote Work"
        }), 200

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
