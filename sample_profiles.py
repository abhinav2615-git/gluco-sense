"""
Sample/filler patient profiles so the presenter can demo the app instantly
without typing values by hand. These are illustrative, not real patient records.
"""

SAMPLE_PROFILES = {
    "Select a sample profile...": None,
    "🟢 Healthy young adult": {
        "Pregnancies": 1, "Glucose": 90, "BloodPressure": 68, "SkinThickness": 20,
        "Insulin": 60, "BMI": 22.5, "DiabetesPedigreeFunction": 0.20, "Age": 24,
    },
    "🟡 Borderline / at-risk profile": {
        "Pregnancies": 2, "Glucose": 125, "BloodPressure": 78, "SkinThickness": 28,
        "Insulin": 100, "BMI": 29.8, "DiabetesPedigreeFunction": 0.45, "Age": 38,
    },
    "🔴 High-risk profile": {
        "Pregnancies": 6, "Glucose": 175, "BloodPressure": 88, "SkinThickness": 35,
        "Insulin": 210, "BMI": 36.5, "DiabetesPedigreeFunction": 0.85, "Age": 52,
    },
    "🟢 Athlete profile": {
        "Pregnancies": 0, "Glucose": 85, "BloodPressure": 62, "SkinThickness": 15,
        "Insulin": 50, "BMI": 20.1, "DiabetesPedigreeFunction": 0.15, "Age": 27,
    },
    "🔴 Senior with family history": {
        "Pregnancies": 4, "Glucose": 160, "BloodPressure": 82, "SkinThickness": 30,
        "Insulin": 180, "BMI": 31.2, "DiabetesPedigreeFunction": 1.10, "Age": 61,
    },
}
