import pandas as pd
import numpy as np

def get_training_data():
    """
    Returns a DataFrame with 60 dummy student records for training.
    placed = 1 means student got placed, 0 means not placed.
    Logic:
      - High CGPA (>8) + no backlogs + good 10th/12th → likely placed
      - Low CGPA (<6.5) + backlogs → likely not placed
    """
    np.random.seed(42)

    data = [
        # CGPA, tenth, twelfth, backlogs, dept_encoded, placed
        # Strong students - placed
        (9.2, 95, 92, 0, 0, 1),
        (8.9, 90, 88, 0, 1, 1),
        (8.7, 88, 91, 0, 2, 1),
        (9.0, 92, 89, 0, 0, 1),
        (8.5, 85, 87, 0, 1, 1),
        (8.8, 91, 93, 0, 3, 1),
        (9.1, 94, 90, 0, 2, 1),
        (8.6, 87, 86, 0, 0, 1),
        (9.3, 96, 95, 0, 1, 1),
        (8.4, 83, 85, 0, 4, 1),
        (8.2, 80, 82, 0, 0, 1),
        (8.0, 78, 80, 0, 2, 1),
        (8.3, 82, 84, 0, 1, 1),
        (7.9, 79, 81, 0, 3, 1),
        (8.1, 81, 83, 0, 0, 1),

        # Good students - mostly placed
        (7.8, 76, 78, 0, 1, 1),
        (7.5, 74, 76, 0, 2, 1),
        (7.7, 77, 79, 0, 0, 1),
        (7.6, 75, 77, 1, 1, 1),
        (7.4, 73, 75, 0, 3, 1),
        (7.3, 72, 74, 1, 0, 0),
        (7.2, 71, 73, 0, 2, 1),
        (7.0, 70, 72, 1, 1, 0),
        (7.1, 70, 71, 0, 4, 1),
        (6.9, 69, 70, 1, 0, 0),

        # Average students - mixed
        (6.8, 68, 69, 1, 1, 0),
        (6.7, 67, 68, 0, 2, 1),
        (6.6, 66, 67, 2, 0, 0),
        (6.5, 65, 66, 1, 3, 0),
        (6.4, 64, 65, 2, 1, 0),
        (6.3, 63, 64, 1, 0, 0),
        (6.8, 70, 72, 0, 2, 1),
        (6.9, 71, 73, 0, 1, 1),
        (6.5, 68, 70, 1, 0, 0),
        (6.7, 69, 71, 2, 3, 0),

        # Weak students - not placed
        (6.2, 62, 63, 2, 0, 0),
        (6.0, 60, 61, 3, 1, 0),
        (5.9, 59, 60, 2, 2, 0),
        (5.8, 58, 59, 3, 0, 0),
        (5.7, 57, 58, 4, 1, 0),
        (5.6, 56, 57, 3, 3, 0),
        (5.5, 55, 56, 2, 0, 0),
        (6.1, 61, 62, 3, 2, 0),
        (5.4, 54, 55, 4, 1, 0),
        (5.3, 53, 54, 3, 0, 0),

        # More varied data
        (8.5, 75, 70, 0, 1, 1),
        (7.8, 95, 92, 0, 2, 1),
        (9.0, 65, 68, 0, 0, 1),
        (6.5, 90, 88, 2, 3, 0),
        (7.5, 80, 82, 1, 1, 1),
        (8.2, 72, 74, 0, 2, 1),
        (6.8, 85, 87, 1, 0, 0),
        (7.0, 76, 78, 2, 4, 0),
        (8.8, 88, 90, 0, 1, 1),
        (5.5, 70, 72, 3, 2, 0),
        (9.2, 91, 93, 0, 0, 1),
        (6.3, 65, 67, 2, 3, 0),
        (7.6, 83, 85, 0, 1, 1),
        (8.0, 79, 81, 0, 2, 1),
        (5.8, 88, 90, 4, 0, 0),
    ]

    df = pd.DataFrame(data, columns=[
        'cgpa', 'tenth_percentage', 'twelfth_percentage',
        'backlogs', 'dept_encoded', 'placed'
    ])
    return df

DEPT_ENCODING = {
    'CSE': 0,
    'IT': 1,
    'ECE': 2,
    'EEE': 3,
    'MECH': 4,
    'CIVIL': 5,
    'OTHER': 6
}

def encode_department(dept: str) -> int:
    return DEPT_ENCODING.get(dept.upper(), 6)
