import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Import models
from models import User, Session

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
    CORS(app, resources={r"/*": {"origins": os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')}})

    # Auth Routes
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"msg": "Missing email or password"}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "User already exists"}), 400
        
        user = User(email=data['email'], name=data.get('name'))
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        return jsonify({"msg": "User created successfully"}), 201

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
        
        new_session = Session(
            user_id=user_id,
            duration=data['duration'],
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
