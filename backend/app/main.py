
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.predict import router as predict_router

app = FastAPI(
    title="GlucoSense API",
    description=(
        "Machine learning-based diabetes risk "
        "assessment and explainability API."
    ),
    version="2.0.0",
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)


@app.get("/")
def root():
    return {
        "application": "GlucoSense",
        "version": "2.0.0",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
