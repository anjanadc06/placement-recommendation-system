import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from training_data import get_training_data, encode_department

# ─── Global model objects (loaded once at startup) ───────────────────────────
_placement_model = None
_scaler = None

def _train_placement_model():
    """Train Random Forest on dummy + any real data."""
    global _placement_model, _scaler

    df = get_training_data()
    features = ['cgpa', 'tenth_percentage', 'twelfth_percentage', 'backlogs', 'dept_encoded']
    X = df[features].values
    y = df['placed'].values

    _scaler = MinMaxScaler()
    X_scaled = _scaler.fit_transform(X)

    _placement_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42
    )
    _placement_model.fit(X_scaled, y)
    print("✅ Placement prediction model trained successfully!")

def get_model():
    global _placement_model, _scaler
    if _placement_model is None:
        _train_placement_model()
    return _placement_model, _scaler

# ─── Placement Prediction ─────────────────────────────────────────────────────
def predict_placement(cgpa: float, tenth: float, twelfth: float,
                      backlogs: int, department: str) -> dict:
    """
    Predicts placement probability for a student using Random Forest.
    Returns probability and a confidence label.
    """
    model, scaler = get_model()
    dept_encoded = encode_department(department)

    features = np.array([[cgpa, tenth, twelfth, backlogs, dept_encoded]])
    features_scaled = scaler.transform(features)

    prob = model.predict_proba(features_scaled)[0]
    placed_prob = round(float(prob[1]) * 100, 1)

    # Feature importances for explanation
    importances = model.feature_importances_
    feature_names = ['CGPA', '10th %', '12th %', 'Backlogs', 'Department']
    top_factor = feature_names[np.argmax(importances)]

    # Confidence label
    if placed_prob >= 75:
        label = "High"
        message = f"Strong placement prospect! {top_factor} is your biggest advantage."
    elif placed_prob >= 50:
        label = "Medium"
        message = f"Moderate placement chances. Focus on improving {top_factor}."
    else:
        label = "Low"
        message = f"Work on improving your profile. {top_factor} needs attention."

    return {
        "placement_probability": placed_prob,
        "confidence": label,
        "message": message,
        "feature_importances": {
            name: round(float(imp) * 100, 1)
            for name, imp in zip(feature_names, importances)
        }
    }

# ─── Job Recommendation via Cosine Similarity ────────────────────────────────
def recommend_jobs(student: dict, jobs: list) -> list:
    """
    Ranks jobs for a student using cosine similarity between
    student profile vector and job requirement vector.

    Student vector: [cgpa, tenth, twelfth, 1-backlogs_norm]
    Job vector:     [min_cgpa, min_10th, min_12th, 1.0]
    """
    if not jobs:
        return []

    # Normalize backlogs: 0 backlogs = 1.0 (best), 5+ backlogs = 0.0
    backlog_score = max(0.0, 1.0 - (student.get('backlogs', 0) / 5.0))

    student_vector = np.array([[
        student.get('cgpa', 0) / 10.0,
        student.get('tenth_percentage', 0) / 100.0,
        student.get('twelfth_percentage', 0) / 100.0,
        backlog_score
    ]])

    scored_jobs = []
    for job in jobs:
        job_vector = np.array([[
            job.get('min_cgpa', 0) / 10.0,
            job.get('min_10th', 0) / 100.0,
            job.get('min_12th', 0) / 100.0,
            1.0  # jobs don't have backlog requirements beyond eligibility
        ]])

        similarity = cosine_similarity(student_vector, job_vector)[0][0]

        # Check hard eligibility
        eligible = (
            student.get('cgpa', 0) >= job.get('min_cgpa', 0) and
            student.get('tenth_percentage', 0) >= job.get('min_10th', 0) and
            student.get('twelfth_percentage', 0) >= job.get('min_12th', 0)
        )

        # Boost score for eligible jobs
        final_score = similarity * (1.2 if eligible else 0.6)

        # Package bonus: higher paying jobs get a slight boost
        package_bonus = min(job.get('package_lpa', 0) / 50.0, 0.1)
        final_score += package_bonus

        scored_jobs.append({
            **job,
            'match_score': round(float(final_score) * 100, 1),
            'eligible': eligible,
            'similarity': round(float(similarity) * 100, 1)
        })

    # Sort by match score descending
    scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)
    return scored_jobs
