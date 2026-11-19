import numpy as np
import shap
from sklearn.model_selection import train_test_split

from backend.app.services.model_training import load_dataset
from backend.app.services.prediction import prepare_patient_frame


def explain_prediction(artifact, patient_data):
    """Explain the positive-class probability using training-only background data."""
    model = artifact["model"]
    features = artifact["features"]

    # Keep inference preprocessing identical to the prediction endpoint.
    patient = prepare_patient_frame(patient_data, features)
    imputer = model.named_steps["imputer"]
    classifier = model.named_steps["classifier"]
    patient_processed = imputer.transform(patient)

    # Recreate the exact stratified split used by model_training.py.
    # This prevents held-out test records from entering the SHAP background.
    X, y = load_dataset()
    X_train, _, _, _ = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    background = X_train.sample(
        n=min(100, len(X_train)),
        random_state=42,
    )
    background_processed = imputer.transform(background)

    # The currently selected artifact is a Random Forest classifier.
    explainer = shap.TreeExplainer(
        classifier,
        data=background_processed,
        feature_perturbation="interventional",
        model_output="probability",
    )
    explanation = explainer(
        patient_processed,
        check_additivity=False,
    )

    values = np.asarray(explanation.values)
    if values.ndim == 3:
        contributions = values[0, :, 1]
    else:
        contributions = values[0]

    base_values = np.asarray(explanation.base_values)
    if base_values.ndim == 2:
        base_value = float(base_values[0, 1])
    else:
        base_value = float(base_values.reshape(-1)[0])

    feature_contributions = [
        {"feature": feature, "value": float(value)}
        for feature, value in zip(features, contributions)
    ]
    feature_contributions.sort(
        key=lambda item: abs(item["value"]),
        reverse=True,
    )

    return {
        "base_value": base_value,
        "contributions": feature_contributions,
        "explanation_method": "SHAP TreeExplainer",
        "explained_output": "Class 1 probability",
    }
