from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/resume_matcher_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    try:
        with engine.connect() as connection:
            print("Database initialized successfully ✅")
    except Exception as e:
        print("Database initialization failed ❌")
        print(e)