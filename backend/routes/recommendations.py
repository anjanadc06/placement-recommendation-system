from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/")
def get_all_recommendations():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.*, s.name as student_name, s.department,
               c.company_name, j.role_name, c.package_lpa
        FROM Recommendation r
        JOIN Application ap ON r.application_id = ap.application_id
        JOIN Student s ON ap.student_id = s.student_id
        JOIN Job_Role j ON ap.job_id = j.job_id
        JOIN Company c ON j.company_id = c.company_id
        ORDER BY r.rec_date DESC
    """)
    data = cursor.fetchall()
    conn.close()
    return data

@router.get("/student/{student_id}")
def get_recommendations_for_student(student_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.*, c.company_name, j.role_name, c.package_lpa, ap.status
        FROM Recommendation r
        JOIN Application ap ON r.application_id = ap.application_id
        JOIN Job_Role j ON ap.job_id = j.job_id
        JOIN Company c ON j.company_id = c.company_id
        WHERE ap.student_id = %s
        ORDER BY r.priority DESC
    """, (student_id,))
    data = cursor.fetchall()
    conn.close()
    return data

@router.get("/eligible/{student_id}")
def get_eligible_jobs(student_id: int):
    """Returns all jobs the student is eligible for based on academic criteria"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT j.*, c.company_name, c.location, c.package_lpa, c.category
        FROM Job_Role j
        JOIN Company c ON j.company_id = c.company_id
        JOIN Academics a ON a.student_id = %s
        WHERE a.cgpa >= j.min_cgpa
          AND a.tenth_percentage >= j.min_10th
          AND a.twelfth_percentage >= j.min_12th
        ORDER BY c.package_lpa DESC
    """, (student_id,))
    data = cursor.fetchall()
    conn.close()
    return data
