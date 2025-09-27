import random
import uuid
import time
import logging
from .schemas import PaymentRequest, PaymentResponse
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def process_payment_simulation(request: PaymentRequest) -> PaymentResponse:
    """Simula la lógica de procesamiento de pagos (80% aprobado, 20% rechazado)."""
    
    # 1. Simulación de latencia
    delay = random.uniform(0.1, 0.5)
    time.sleep(delay)
    
    # 2. Lógica 80/20
    if random.random() < 0.8:
        estado = "APPROVED"
        mensaje = "Pago aprobado."
    else:
        estado = "REJECTED"
        mensaje = "Pago rechazado (Simulación de fallo 20%)."

    transaccion_id = str(uuid.uuid4())
    
    logger.info(f"Transacción simulada. Monto: {request.monto}, Resultado: {estado}")
    
    return PaymentResponse(
        estado=estado,
        transaccion_id=transaccion_id,
        mensaje=mensaje
    )