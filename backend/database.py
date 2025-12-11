from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import os

# Base para los modelos (forma moderna de SQLAlchemy 2.0)
# DEBE estar definido ANTES de crear el engine
class Base(DeclarativeBase):
    pass

# Leer variables de entorno para la conexión a PostgreSQL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://todouser:todopass@db:5432/tododb"
)

# Crear el motor de la base de datos
engine = create_engine(DATABASE_URL)

# Crear sesión local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

