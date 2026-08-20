"""
Diabetes Prediction Model - Training Script
Trains a Random Forest classifier on the Pima Indians Diabetes Dataset
and saves the model + scaler for use in the Streamlit app.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report
)
import joblib

# ---------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------
df = pd.read_csv("diabetes.csv")
print("Dataset shape:", df.shape)
print(df.head())

# ---------------------------------------------------------
# 2. Clean data
# Columns where 0 is biologically impossible -> treat as missing, impute with median
# ---------------------------------------------------------
cols_with_invalid_zero = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
for col in cols_with_invalid_zero:
    df[col] = df[col].replace(0, np.nan)
    df[col] = df[col].fillna(df[col].median())

# ---------------------------------------------------------
# 3. Split features/target
# ---------------------------------------------------------
X = df.drop("Outcome", axis=1)
y = df["Outcome"]
feature_names = X.columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ---------------------------------------------------------
# 4. Scale features
# ---------------------------------------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ---------------------------------------------------------
# 5. Train models and compare
# ---------------------------------------------------------
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42)
}

best_model = None
best_score = 0
best_name = ""

for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    preds = model.predict(X_test_scaled)
    probs = model.predict_proba(X_test_scaled)[:, 1]

    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds)
    rec = recall_score(y_test, preds)
    f1 = f1_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)

    print(f"\n--- {name} ---")
    print(f"Accuracy : {acc:.3f}")
    print(f"Precision: {prec:.3f}")
    print(f"Recall   : {rec:.3f}")
    print(f"F1 Score : {f1:.3f}")
    print(f"ROC-AUC  : {auc:.3f}")
    print(confusion_matrix(y_test, preds))

    if f1 > best_score:
        best_score = f1
        best_model = model
        best_name = name

print(f"\nBest model: {best_name} (F1 = {best_score:.3f})")

# ---------------------------------------------------------
# 6. Save best model, scaler, and feature names
# ---------------------------------------------------------
joblib.dump(best_model, "diabetes_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(feature_names, "feature_names.pkl")

print("\nSaved: diabetes_model.pkl, scaler.pkl, feature_names.pkl")
