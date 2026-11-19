from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.base import clone
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_validate
)
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = ROOT / "diabetes.csv"
ARTIFACT_DIR = ROOT / "backend" / "artifacts"

INVALID_ZERO_COLUMNS = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI"
]


def load_dataset():
    df = pd.read_csv(DATA_PATH)

    required = INVALID_ZERO_COLUMNS + [
        "Pregnancies",
        "DiabetesPedigreeFunction",
        "Age",
        "Outcome"
    ]

    if not set(required).issubset(df.columns):
        raise ValueError("Dataset is missing required columns.")

    X = df.drop(columns=["Outcome"]).copy()
    y = df["Outcome"].copy()

    for column in INVALID_ZERO_COLUMNS:
        X[column] = X[column].replace(0, np.nan)

    return X, y


def build_models():
    return {
        "Logistic Regression": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(
                max_iter=2000,
                class_weight="balanced",
                random_state=42
            ))
        ]),

        "Random Forest": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", RandomForestClassifier(
                n_estimators=300,
                max_depth=6,
                min_samples_leaf=3,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1
            ))
        ]),

        "Gradient Boosting": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.05,
                max_depth=2,
                random_state=42
            ))
        ])
    }


def train():
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    X, y = load_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42
    )

    scoring = {
        "accuracy": "accuracy",
        "precision": "precision",
        "recall": "recall",
        "f1": "f1",
        "roc_auc": "roc_auc"
    }

    results = []
    models = build_models()

    print("\nGLUCOSENSE MODEL TRAINING")
    print("=" * 55)

    for name, model in models.items():
        scores = cross_validate(
            model,
            X_train,
            y_train,
            cv=cv,
            scoring=scoring,
            n_jobs=-1
        )

        result = {
            "model": name,
            **{
                metric: round(float(np.mean(scores[f"test_{metric}"]),), 4)
                for metric in scoring
            }
        }

        results.append(result)

        print(f"\n{name}")
        for metric, value in result.items():
            if metric != "model":
                print(f"{metric}: {value}")

    best_result = max(results, key=lambda item: item["f1"])
    best_name = best_result["model"]

    best_model = clone(models[best_name])
    best_model.fit(X_train, y_train)

    predictions = best_model.predict(X_test)
    probabilities = best_model.predict_proba(X_test)[:, 1]

    test_metrics = {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision": float(precision_score(
            y_test, predictions, zero_division=0
        )),
        "recall": float(recall_score(
            y_test, predictions, zero_division=0
        )),
        "f1": float(f1_score(
            y_test, predictions, zero_division=0
        )),
        "roc_auc": float(roc_auc_score(y_test, probabilities)),
        "confusion_matrix": confusion_matrix(
            y_test, predictions
        ).tolist(),
        "classification_report": classification_report(
            y_test,
            predictions,
            output_dict=True,
            zero_division=0
        ),
        "test_samples": int(len(y_test)),
        "positive_samples": int(y_test.sum()),
        "negative_samples": int((y_test == 0).sum())
    }

    artifact = {
        "model": best_model,
        "model_name": best_name,
        "features": list(X.columns),
        "cross_validation": results,
        "test_metrics": test_metrics
    }

    joblib.dump(
        artifact,
        ARTIFACT_DIR / "glucosense_model.joblib"
    )

    with open(ARTIFACT_DIR / "metrics.json", "w") as file:
        json.dump(artifact, file, indent=2, default=str)

    print("\n" + "=" * 55)
    print(f"SELECTED MODEL: {best_name}")
    print("HELD-OUT TEST PERFORMANCE")

    for metric, value in test_metrics.items():
        if isinstance(value, float):
            print(f"{metric}: {value:.4f}")

    print("\nConfusion Matrix:")
    print(np.array(test_metrics["confusion_matrix"]))

    print("\nModel saved successfully.")
    print(ARTIFACT_DIR / "glucosense_model.joblib")


if __name__ == "__main__":
    train()
