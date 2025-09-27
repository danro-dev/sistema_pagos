from fastapi import FastAPI
from .api import endpoints

app = FastAPI(
    title="Servicio de Procesamiento de Pagos Ficticio",
    description="Microservicio en FastAPI para simular aprobaciones de pagos.",
    version="1.0.0"
)

# Incluye el router en la aplicación principal
app.include_router(endpoints.router)

@app.get("/", tags=["Salud"])
def health_check():
    return {"status": "ok", "service": "payment-processor"}