# Placement Recommendation System

Full-stack web app: React + FastAPI + MySQL

---

## Folder Structure

```
placement-system/
├── backend/          ← FastAPI (Python)
│   ├── main.py
│   ├── database.py
│   ├── .env          ← PUT YOUR DB CREDENTIALS HERE
│   ├── requirements.txt
│   └── routes/
│       ├── students.py
│       ├── companies.py
│       ├── jobs.py
│       ├── applications.py
│       └── recommendations.py
└── frontend/         ← React
    ├── package.json
    └── src/
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Students.jsx
        │   ├── Companies.jsx
        │   ├── Jobs.jsx
        │   ├── Applications.jsx
        │   └── Recommendations.jsx
        └── components/
            ├── Navbar.jsx
            └── Toast.jsx
```

---

## Setup — Backend

### Step 1: Edit your .env file
Open `backend/.env` and fill in your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=placement_db
```

### Step 2: Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Run the server
```bash
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000  
API docs (Swagger): http://localhost:8000/docs

---

## Setup — Frontend

### Step 1: Install dependencies
```bash
cd frontend
npm install
```

### Step 2: Start the app
```bash
npm start
```

Frontend runs at: http://localhost:3000

---

## Features

| Page | Features |
|---|---|
| Dashboard | Stats overview, placement rate, top companies |
| Students | View, add, edit, delete students with CGPA display |
| Companies | Manage recruiting companies |
| Job Roles | View eligibility criteria per role |
| Applications | Submit applications, update status (Pending → Selected) |
| Recommendations | Eligible jobs finder per student + recommendation log |

---

## Notes

- Applications automatically check CGPA/10th/12th eligibility before submitting
- Status can be updated to: Pending, Applied, Under Review, Shortlisted, Selected, Rejected
- The Recommendations page has an Eligible Jobs Finder — pick any student to see what they qualify for
