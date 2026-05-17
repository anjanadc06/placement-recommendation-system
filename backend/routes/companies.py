from fastapi import APIRouter, HTTPException
from database import get_connection
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/companies", tags=["Companies"])

class CompanyCreate(BaseModel):
    company_name: str
    location: Optional[str] = None
    industry: Optional[str] = None
    category: str
    package_lpa: float

@router.get("/")
def get_all_companies():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Company")
    data = cursor.fetchall()
    conn.close()
    return data

@router.get("/{company_id}")
def get_company(company_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Company WHERE company_id=%s", (company_id,))
    data = cursor.fetchone()
    conn.close()
    if not data:
        raise HTTPException(status_code=404, detail="Company not found")
    return data

@router.post("/")
def create_company(company: CompanyCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Company (company_name, location, industry, category, package_lpa)
            VALUES (%s, %s, %s, %s, %s)
        """, (company.company_name, company.location, company.industry, company.category, company.package_lpa))
        conn.commit()
        return {"message": "Company created", "id": cursor.lastrowid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.put("/{company_id}")
def update_company(company_id: int, company: CompanyCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE Company SET company_name=%s, location=%s, industry=%s, category=%s, package_lpa=%s
            WHERE company_id=%s
        """, (company.company_name, company.location, company.industry, company.category, company.package_lpa, company_id))
        conn.commit()
        return {"message": "Company updated"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.delete("/{company_id}")
def delete_company(company_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Company WHERE company_id=%s", (company_id,))
        conn.commit()
        return {"message": "Company deleted"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
