// api-rest/src/controllers/PaymentController.ts

import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HttpError } from '../utils/httpErrors'; // Importamos el error personalizado
import { isValidUUID } from '../utils/validation';

// Instanciar dependencias (Fuera de la clase para singleton, mejor práctica)
const paymentRepository = new PaymentRepository();
const userRepository = new UserRepository();
const paymentService = new PaymentService(paymentRepository, userRepository);

export class PaymentController {
    /**
     * POST /api/v1/pagos - Crea y procesa un pago.
     */
    public async createPayment(req: Request, res: Response): Promise<void> {
        try {
            const { usuario_id, tarjeta_id, monto } = req.body;

            if (typeof usuario_id !== 'string') {
                res.status(400).json({ error: "El identificador de usuario debe ser una cadena UUID." });
                return;
            }

            const normalizedUserId = usuario_id.trim();

            if (!isValidUUID(normalizedUserId)) {
                res.status(400).json({ error: "El identificador de usuario debe ser un UUID válido." });
                return;
            }

            if (typeof tarjeta_id !== 'string') {
                res.status(400).json({ error: "El identificador de la tarjeta debe ser una cadena UUID." });
                return;
            }

            const normalizedCardId = tarjeta_id.trim();

            if (!isValidUUID(normalizedCardId)) {
                res.status(400).json({ error: "El identificador de la tarjeta debe ser un UUID válido." });
                return;
            }
            
            if (typeof monto !== 'number' || monto <= 0) {
                res.status(400).json({ error: "El monto debe ser un número positivo." });
                return;
            }

            const result = await paymentService.createPayment({
                usuarioId: normalizedUserId,
                tarjetaId: normalizedCardId,
                monto
            });

            // Respuesta exitosa (no necesita return)
            res.status(200).json({
                mensaje: result.mensaje_procesador,
                pago: {
                    id: result.id,
                    monto: result.monto,
                    estado: result.estado,
                    transaccion_id: result.transaccion_id,
                    fecha_pago: result.fecha_pago
                }
            });

        } catch (error: any) {
            // Manejo de HttpError lanzado desde el Service
            if (error instanceof HttpError) {
                res.status(error.status).json({ error: error.message });
                return;
            }
            // Error interno o desconocido
            res.status(500).json({ error: 'Error interno del servidor al procesar el pago.', details: error.message });
        }
    }

    /**
     * GET /api/v1/usuarios/:userId/pagos - Lista el historial de pagos.
     */
    public async getPaymentHistory(req: Request, res: Response): Promise<void> {
        try {
            const userIdParam = req.params.userId;
            const normalizedUserId = userIdParam.trim();

            if (!isValidUUID(normalizedUserId)) {
                res.status(400).json({ error: "El identificador de usuario debe ser un UUID válido." });
                return;
            }
            
            const payments = await paymentService.getPaymentsByUserId(normalizedUserId);

            res.status(200).json(payments);

        } catch (error: any) {
            // Manejo de HttpError (ej. 404 si el usuario no existe)
            if (error instanceof HttpError) {
                res.status(error.status).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Error interno del servidor al obtener el historial de pagos.' });
        }
    }
}