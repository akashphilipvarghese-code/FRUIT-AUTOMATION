"""Seed demo users for Admin view"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database import init_db, SessionLocal, User

init_db()
db = SessionLocal()
try:
    for u in db.query(User).all():
        print(f"User exists: {u.email}")
    if db.query(User).count() == 0:
        db.add(User(email="admin@fruity.ai", name="Admin", role="admin"))
        db.add(User(email="customer@test.com", name="Jane", role="customer"))
        db.add(User(email="factory@test.com", name="Acme Corp", role="industrialist"))
        db.commit()
        print("Seeded 3 users")
finally:
    db.close()
