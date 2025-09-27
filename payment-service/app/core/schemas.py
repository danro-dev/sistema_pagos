from pydantic import BaseModel, Field
from typing import Optional

class PaymentRequest(BaseModel):
    """Esquema de entrada para el procesador de pagos."""
    monto: float = Field(..., gt=0, description="Monto del pago, debe ser positivo.")
    token_hash: str = Field(..., min_length=16, description="Token seguro de la tarjeta.")
    
class PaymentResponse(BaseModel):
    """Esquema de salida del procesador de pagos."""
    estado: str = Field(..., description="'APPROVED' o 'REJECTED'.")
    transaccion_id: str = Field(..., description="ID único de la transacción generada.")
    mensaje: str = Field(..., description="Mensaje de respuesta del procesador.")