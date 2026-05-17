from fastapi import APIRouter, HTTPException
from database import get_connection
from ml_model import predict_placement, recommend_jobs

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.get("/predict/{student_id}")
def get_placement_prediction(student_id: int):
    """
    Predicts placement probability for a student
    using Random Forest Classifier.
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get student academic data
        cursor.execute("""
            SELECT s.name, s.department,
                   a.cgpa, a.tenth_percentage, a.twelfth_percentage, a.backlogs
            FROM Student s
            JOIN Academics a ON s.student_id = a.student_id
            WHERE s.student_id = %s
        """, (student_id,))
        student = cursor.fetchone()

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        result = predict_placement(
            cgpa=float(student['cgpa']),
            tenth=float(student['tenth_percentage']),
            twelfth=float(student['twelfth_percentage']),
            backlogs=int(student['backlogs']),
            department=student['department']
        )

        return {
            "student_name": student['name'],
            "department": student['department'],
            "academics": {
                "cgpa": float(student['cgpa']),
                "tenth": float(student['tenth_percentage']),
                "twelfth": float(student['twelfth_percentage']),
                "backlogs": int(student['backlogs'])
            },
            **result
        }
    finally:
        conn.close()

@router.get("/recommend/{student_id}")
def get_job_recommendations(student_id: int):
    """
    Recommends and ranks jobs for a student using
    Cosine Similarity between student profile and job requirements.
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get student profile
        cursor.execute("""
            SELECT s.name, s.department,
                   a.cgpa, a.tenth_percentage, a.twelfth_percentage, a.backlogs
            FROM Student s
            JOIN Academics a ON s.student_id = a.student_id
            WHERE s.student_id = %s
        """, (student_id,))
        student = cursor.fetchone()

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Get all jobs
        cursor.execute("""
            SELECT j.job_id, j.role_name, j.job_type,
                   j.min_cgpa, j.min_10th, j.min_12th, j.openings,
                   c.company_name, c.location, c.package_lpa, c.category
            FROM job_role j
            JOIN company c ON j.company_id = c.company_id
        """)
        jobs = cursor.fetchall()

        # Convert decimals to float for numpy
        student_data = {
            'cgpa': float(student['cgpa']),
            'tenth_percentage': float(student['tenth_percentage']),
            'twelfth_percentage': float(student['twelfth_percentage']),
            'backlogs': int(student['backlogs'])
        }

        jobs_data = []
        for j in jobs:
            jobs_data.append({
                **j,
                'min_cgpa': float(j['min_cgpa']),
                'min_10th': float(j['min_10th']),
                'min_12th': float(j['min_12th']),
                'package_lpa': float(j['package_lpa'])
            })

        ranked = recommend_jobs(student_data, jobs_data)

        return {
            "student_name": student['name'],
            "department": student['department'],
            "recommendations": ranked
        }
    finally:
        conn.close()

@router.get("/dashboard")
def get_ml_dashboard():
    """Returns ML predictions for all students — for the dashboard view."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT s.student_id, s.name, s.department,
                   a.cgpa, a.tenth_percentage, a.twelfth_percentage, a.backlogs
            FROM Student s
            JOIN Academics a ON s.student_id = a.student_id
        """)
        students = cursor.fetchall()

        results = []
        for s in students:
            pred = predict_placement(
                cgpa=float(s['cgpa']),
                tenth=float(s['tenth_percentage']),
                twelfth=float(s['twelfth_percentage']),
                backlogs=int(s['backlogs']),
                department=s['department']
            )
            results.append({
                "student_id": s['student_id'],
                "name": s['name'],
                "department": s['department'],
                "cgpa": float(s['cgpa']),
                "placement_probability": pred['placement_probability'],
                "confidence": pred['confidence'],
                "message": pred['message']
            })

        # Sort by probability descending
        results.sort(key=lambda x: x['placement_probability'], reverse=True)
        return results
    finally:
        conn.close()
