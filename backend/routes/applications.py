from fastapi import APIRouter, HTTPException
from database import get_connection
from pydantic import BaseModel
from typing import Optional
from datetime import date

router = APIRouter(prefix="/applications", tags=["Applications"])

class ApplicationCreate(BaseModel):
    student_id: int
    job_id: int
    status: Optional[str] = "Pending"
    apply_date: Optional[date] = None
    resume_link: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
    result: Optional[str] = None
    round_no: Optional[int] = None

@router.get("/")
def get_all_applications():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ap.*, s.name as student_name, s.department,
               j.role_name, c.company_name, c.package_lpa
        FROM Application ap
        JOIN Student s ON ap.student_id = s.student_id
        JOIN Job_Role j ON ap.job_id = j.job_id
        JOIN Company c ON j.company_id = c.company_id
        ORDER BY ap.application_id DESC
    """)
    data = cursor.fetchall()
    conn.close()
    return data

@router.get("/{application_id}")
def get_application(application_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ap.*, s.name as student_name, j.role_name, c.company_name
        FROM Application ap
        JOIN Student s ON ap.student_id = s.student_id
        JOIN Job_Role j ON ap.job_id = j.job_id
        JOIN Company c ON j.company_id = c.company_id
        WHERE ap.application_id = %s
    """, (application_id,))
    data = cursor.fetchone()
    conn.close()
    if not data:
        raise HTTPException(status_code=404, detail="Application not found")
    return data

@router.post("/")
def create_application(app: ApplicationCreate):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check eligibility
        cursor.execute("""
            SELECT a.cgpa, a.tenth_percentage, a.twelfth_percentage,
                   j.min_cgpa, j.min_10th, j.min_12th
            FROM Academics a, Job_Role j
            WHERE a.student_id = %s AND j.job_id = %s
        """, (app.student_id, app.job_id))
        check = cursor.fetchone()
        if check:
            if (check['cgpa'] < check['min_cgpa'] or
                check['tenth_percentage'] < check['min_10th'] or
                check['twelfth_percentage'] < check['min_12th']):
                raise HTTPException(status_code=400, detail="Student does not meet eligibility criteria")

        cursor.execute("""
            INSERT INTO Application (student_id, job_id, status, apply_date, resume_link)
            VALUES (%s, %s, %s, %s, %s)
        """, (app.student_id, app.job_id, app.status, app.apply_date or date.today(), app.resume_link))
        conn.commit()
        return {"message": "Application submitted", "id": cursor.lastrowid}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.patch("/{application_id}/status")
def update_status(application_id: int, update: StatusUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE Application SET status=%s, result=%s, round_no=%s
            WHERE application_id=%s
        """, (update.status, update.result, update.round_no, application_id))
        conn.commit()
        return {"message": "Status updated"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.delete("/{application_id}")
def delete_application(application_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Application WHERE application_id=%s", (application_id,))
        conn.commit()
        return {"message": "Application deleted"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
