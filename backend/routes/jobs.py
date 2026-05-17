from fastapi import APIRouter, HTTPException
from database import get_connection
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class JobCreate(BaseModel):
    company_id: int
    role_name: str
    job_type: Optional[str] = None
    min_cgpa: float
    min_10th: float
    min_12th: float
    openings: Optional[int] = 1

@router.get("/")
def get_all_jobs():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT j.*, c.company_name, c.location, c.package_lpa, c.category
        FROM Job_Role j
        JOIN Company c ON j.company_id = c.company_id
    """)
    data = cursor.fetchall()
    conn.close()
    return data

@router.get("/{job_id}")
def get_job(job_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT j.*, c.company_name, c.location, c.package_lpa
        FROM Job_Role j
        JOIN Company c ON j.company_id = c.company_id
        WHERE j.job_id=%s
    """, (job_id,))
    data = cursor.fetchone()
    conn.close()
    if not data:
        raise HTTPException(status_code=404, detail="Job not found")
    return data

@router.post("/")
def create_job(job: JobCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Job_Role (company_id, role_name, job_type, min_cgpa, min_10th, min_12th, openings)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (job.company_id, job.role_name, job.job_type, job.min_cgpa, job.min_10th, job.min_12th, job.openings))
        conn.commit()
        return {"message": "Job created", "id": cursor.lastrowid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.put("/{job_id}")
def update_job(job_id: int, job: JobCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE Job_Role SET company_id=%s, role_name=%s, job_type=%s,
            min_cgpa=%s, min_10th=%s, min_12th=%s, openings=%s
            WHERE job_id=%s
        """, (job.company_id, job.role_name, job.job_type, job.min_cgpa, job.min_10th, job.min_12th, job.openings, job_id))
        conn.commit()
        return {"message": "Job updated"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.delete("/{job_id}")
def delete_job(job_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Job_Role WHERE job_id=%s", (job_id,))
        conn.commit()
        return {"message": "Job deleted"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
