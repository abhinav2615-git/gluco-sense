from fastapi import APIRouter, HTTPException

from backend.app.schemas.patient import PredictionRequest
from backend.app.services.prediction import (
    predict_patient,
    get_artifact
)
from backend.app.services.explainability import (
    explain_prediction
)

router = APIRouter(prefix="/api", tags=["Prediction"])


@router.post("/predict")
def predict(request: PredictionRequest):
    try:
        patient = request.patient.model_dump()

        result = predict_patient(
            patient,
            threshold=request.threshold
        )

        if request.include_explanation:
            artifact = get_artifact()

            result["explanation"] = explain_prediction(
                artifact,
                patient
            )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )


@router.get("/model-info")
def model_info():
    artifact = get_artifact()

    return {
        "model_name": artifact["model_name"],
        "features": artifact["features"],
        "cross_validation": artifact["cross_validation"],
        "test_metrics": artifact["test_metrics"]
    }
