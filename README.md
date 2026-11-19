# GlucoSense — Diabetes Risk Screening Demonstration

GlucoSense is an academic machine-learning demonstration that estimates a diabetes-related class probability from eight input features and explains an individual model output with SHAP.

**Important:** GlucoSense is not clinically validated. It is not a medical device and must not be used to diagnose, treat, or make healthcare decisions.

## Active application architecture

- **Frontend:** React + Vite (`frontend/`)
- **Backend:** FastAPI (`backend/`)
- **Machine learning:** scikit-learn pipelines
- **Explainability:** SHAP TreeExplainer
- **Dataset:** `diabetes.csv` (Pima Indians Diabetes Dataset)

The active application is the React + FastAPI version. The root-level `app.py`, `train_model.py`, `diabetes_model.pkl`, `scaler.pkl`, and `feature_names.pkl` belong to an earlier Streamlit implementation and are retained as legacy files. They are not used by the current React + FastAPI application.

## Project structure

```text
Glucosense/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/predict.py
│   │   ├── schemas/patient.py
│   │   └── services/
│   │       ├── model_training.py
│   │       ├── prediction.py
│   │       └── explainability.py
│   ├── artifacts/
│   │   ├── glucosense_model.joblib
│   │   └── metrics.json
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── diabetes.csv
└── README.md
```

## Run locally

### 1. Backend

From the project root:

```bash
# Activate your Python environment first, if you use Conda.
pip install -r backend/requirements.txt

# Start the API
uvicorn backend.app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Useful endpoints:
- `GET /` — API status
- `GET /health` — health check
- `GET /api/model-info` — model and evaluation information
- `POST /api/predict` — patient prediction and optional SHAP explanation

Interactive API documentation: `http://127.0.0.1:8000/docs`.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Retrain the model

From the project root, with backend dependencies installed:

```bash
python -m backend.app.services.model_training
```

This creates/updates:
- `backend/artifacts/glucosense_model.joblib`
- `backend/artifacts/metrics.json`

The training workflow uses a stratified held-out test split, preprocessing pipelines, and stratified cross-validation on the training partition. Candidate models are selected using cross-validation F1, and final metrics are calculated on the held-out test partition.

**Dependency compatibility:** the saved scikit-learn artifact was generated with scikit-learn 1.9.1. The backend requirements pin that version because scikit-learn does not guarantee that serialized estimators are compatible across versions. If you retrain with a different scikit-learn version, regenerate the artifact in that same environment and keep the runtime version aligned.

## Model inputs

1. Pregnancies
2. Glucose
3. BloodPressure
4. SkinThickness
5. Insulin
6. BMI
7. DiabetesPedigreeFunction
8. Age

The training and inference pipelines treat zero values in Glucose, BloodPressure, SkinThickness, Insulin, and BMI as missing and impute them using the training-fitted median imputer.

## Evaluation

The application displays:
- Cross-validation results for Logistic Regression, Random Forest, and Gradient Boosting
- Held-out test accuracy, precision, recall, F1 score, and ROC-AUC
- Held-out test confusion matrix
- Individual SHAP feature contributions

Cross-validation results and held-out test results are different evaluation stages and should be reported separately. Metrics describe performance on this dataset and do not establish clinical validity.

## Limitations and future work

- Evaluate on broader, independently sourced datasets.
- Assess calibration, subgroup performance, and fairness.
- Validate explanations and model stability.
- Conduct appropriate clinical validation before any real-world healthcare use.
- Add secure, consent-based assessment history only if persistence is introduced.
