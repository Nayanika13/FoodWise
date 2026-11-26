from fastapi import FastAPI

app = FastAPI(
    title="FoodWise AI Service",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "FoodWise AI",
        "model": "not_loaded"
    }