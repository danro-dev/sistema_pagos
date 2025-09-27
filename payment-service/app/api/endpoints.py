from fastapi import APIRouter
from ..core.schemas import PaymentRequest, PaymentResponse
from ..core.service import process_payment_simulation

# Crea un router para modularizar los endpoints
router = APIRouter(prefix="/process", tags=["Pagos"])

@router.post("/", response_model=PaymentResponse, status_code=200)
def process_payment(request: PaymentRequest):
    """
    Endpoint principal para simular el procesamiento de un pago.
    Recibe el monto y el token de la tarjeta.
    """
    # Delega la lógica de negocio al servicio
    return process_payment_simulation(request)