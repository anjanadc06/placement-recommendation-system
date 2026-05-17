from fastapi import APIRouter, HTTPException
from database import get_connection
from pydantic import BaseModel
from typing import Optional
from datetime import date

router = APIRouter(prefix="/students", tags=["Students"])

class Student(BaseModel):
    student_id: int
    roll_no: str
    name: str
    department: str
    email: str
    dob: Optional[date] = None

class StudentCreate(BaseModel):
    roll_no: str
    name: str
    department: str
    email: str
    dob: Optional[date] = None

@router.get("/")
def get_all_students():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.*, a.cgpa, a.tenth_percentage, a.twelfth_percentage, a.backlogs
        FROM Student s
        LEFT JOIN Academics a ON s.student_id = a.student_id
    """)
    data = cursor.fetchall()
    conn.close()
    return data

@router.get("/{student_id}")
def get_student(student_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.*, a.cgpa, a.tenth_percentage, a.twelfth_percentage, a.backlogs
        FROM Student s
        LEFT JOIN Academics a ON s.student_id = a.student_id
        WHERE s.student_id = %s
    """, (student_id,))
    data = cursor.fetchone()
    conn.close()
    if not data:
        raise HTTPException(status_code=404, detail="Student not found")
    return data

@router.post("/")
def create_student(student: StudentCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Student (roll_no, name, department, email, dob)
            VALUES (%s, %s, %s, %s, %s)
        """, (student.roll_no, student.name, student.department, student.email, student.dob))
        conn.commit()
        return {"message": "Student created", "id": cursor.lastrowid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.put("/{student_id}")
def update_student(student_id: int, student: StudentCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE Student SET roll_no=%s, name=%s, department=%s, email=%s, dob=%s
            WHERE student_id=%s
        """, (student.roll_no, student.name, student.department, student.email, student.dob, student_id))
        conn.commit()
        return {"message": "Student updated"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.delete("/{student_id}")
def delete_student(student_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Student WHERE student_id=%s", (student_id,))
        conn.commit()
        return {"message": "Student deleted"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
