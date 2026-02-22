"""
Test database connection
"""
from app.database import init_db, engine
from sqlalchemy import text

def test_connection():
    """Test connection"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def create_tables():
    """Create tables"""
    try:
        init_db()
        print("✅ All tables created!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing database...")
    if test_connection():
        print("\nCreating tables...")
        create_tables()
        print("\n✅ Database setup complete!")