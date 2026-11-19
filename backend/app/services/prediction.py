
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ARTIFACT_PATH = (
    Path(__file__).resolve().parents[3]
    / "backend"
    / "artifacts"
    / "glucosense_model.joblib"
)

INVALID_ZERO_COLUMNS = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
]

_artifact = None


def get_artifact():
    global _artifact

    if _artifact is None:
        if not ARTIFACT_PATH.exists():
            raise FileNotFoundError(
                "Train the model before starting the API."
            )

        _artifact = joblib.load(ARTIFACT_PATH)

    return _artifact


def prepare_patient_frame(patient_data, features):
    """Apply the same zero-as-missing rule used during training."""
    patient = pd.DataFrame(
        [[patient_data[name] for name in features]],
        columns=features,
    )

    for column in INVALID_ZERO_COLUMNS:
        if column in patient.columns:
            patient[column] = patient[column].replace(0, np.nan)

    return patient


def predict_patient(patient_data, threshold=0.5):
    artifact = get_artifact()

    features = artifact["features"]
    patient = prepare_patient_frame(patient_data, features)

    model = artifact["model"]

    score = float(model.predict_proba(patient)[0, 1])
    prediction = int(score >= threshold)

    return {
        "prediction": prediction,
        "prediction_label": (
            "Higher model-estimated risk"
            if prediction == 1
            else "Lower model-estimated risk"
        ),
        "model_score": round(score, 4),
        "threshold": threshold,
        "model_name": artifact["model_name"],
    }
