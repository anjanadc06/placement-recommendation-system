from fastapi import APIRouter, HTTPException
from database import get_connection
from pydantic import BaseModel
from typing import Optional
import bcrypt

router = APIRouter(prefix="/auth", tags=["Auth"])

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"
    student_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@router.post("/register")
def register(req: RegisterRequest):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if email already exists
        cursor.execute("SELECT user_id FROM Users WHERE email = %s", (req.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check if username already exists
        cursor.execute("SELECT user_id FROM Users WHERE username = %s", (req.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already taken")

        # If student role, validate student_id exists
        if req.role == "student" and req.student_id:
            cursor.execute("SELECT student_id FROM Student WHERE student_id = %s", (req.student_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="Student ID not found in database")

        hashed = hash_password(req.password)
        cursor.execute("""
            INSERT INTO Users (username, email, password_hash, role, student_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (req.username, req.email, hashed, req.role, req.student_id))
        conn.commit()
        return {"message": "Account created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.post("/login")
def login(req: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.*, s.name as student_name, s.department
            FROM Users u
            LEFT JOIN Student s ON u.student_id = s.student_id
            WHERE u.email = %s
        """, (req.email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(req.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {
            "message": "Login successful",
            "user": {
                "user_id": user['user_id'],
                "username": user['username'],
                "email": user['email'],
                "role": user['role'],
                "student_id": user['student_id'],
                "student_name": user.get('student_name'),
                "department": user.get('department'),
            }
        }
    finally:
        conn.close()

@router.get("/students-list")
def get_students_for_register():
    """Returns student list for dropdown during registration"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT student_id, name, roll_no, department FROM Student ORDER BY name")
    data = cursor.fetchall()
    conn.close()
    return data
