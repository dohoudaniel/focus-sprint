from app import create_app
from extensions import db
from models import User, Session, ChatMessage

app = create_app()

with app.app_context():
    db.create_all()
    print("Database created successfully!")
