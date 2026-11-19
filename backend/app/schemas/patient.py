from pydantic import BaseModel, Field, ConfigDict


class PatientInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    Pregnancies: int = Field(ge=0, le=20)
    Glucose: float = Field(gt=0, le=300)
    BloodPressure: float = Field(gt=0, le=200)
    SkinThickness: float = Field(ge=0, le=100)
    Insulin: float = Field(ge=0, le=1000)
    BMI: float = Field(gt=0, le=100)
    DiabetesPedigreeFunction: float = Field(ge=0, le=3)
    Age: int = Field(ge=18, le=120)


class PredictionRequest(BaseModel):
    patient: PatientInput
    threshold: float = Field(default=0.5, gt=0, lt=1)
    include_explanation: bool = True
