from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import students, companies, jobs, applications, recommendations, auth, ml
from ml_model import get_model

app = FastAPI(
    title="Placement Recommendation System API",
    description="Backend API with ML-powered placement prediction",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-train model on startup
@app.on_event("startup")
def startup_event():
    get_model()
    print("🚀 ML model ready!")

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(companies.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(recommendations.router)
app.include_router(ml.router)

@app.get("/")
def root():
    return {"message": "Placement Recommendation System API v2.0 with ML"}

@app.get("/dashboard/stats")
def get_stats():
    from database import get_connection
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) as total FROM student")
    students_count = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM company")
    companies_count = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM job_role")
    jobs_count = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM application")
    apps_count = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM application WHERE status='Selected'")
    placed_count = cursor.fetchone()['total']

    cursor.execute("""
        SELECT c.company_name, COUNT(ap.application_id) as applicants
        FROM company c
        JOIN job_role j ON c.company_id = j.company_id
        JOIN application ap ON j.job_id = ap.job_id
        GROUP BY c.company_id
        ORDER BY applicants DESC
        LIMIT 5
    """)
    top_companies = cursor.fetchall()
    conn.close()

    return {
        "students": students_count,
        "companies": companies_count,
        "jobs": jobs_count,
        "applications": apps_count,
        "placed": placed_count,
        "top_companies": top_companies
    }
