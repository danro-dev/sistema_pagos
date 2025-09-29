// api-rest/src/services/PaymentService.ts - CORRECCIÓN PARA 'error: unknown'

import axios, { AxiosError } from 'axios';
import { PaymentRepository, PaymentRecord } from '../repositories/PaymentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { PoolClient } from 'pg';
import { HttpError } from '../utils/httpErrors'; // Importación de la clase de error personalizada

const PAYMENT_PROCESSOR_URL = process.env.PAYMENT_PROCESSOR_URL || 'http://localhost:8001';

interface PaymentRequestInput {
    usuarioId: string;
    tarjetaId: number;
    monto: number;
}

/**
 * Servicio de Negocio para orquestar la creación y el procesamiento de un pago.
 * Implementa la lógica de la transacción (BEGIN/COMMIT/ROLLBACK) y la comunicación entre servicios.
 */
export class PaymentService {
    private paymentRepository: PaymentRepository;
    private userRepository: UserRepository;

    constructor(paymentRepository: PaymentRepository, userRepository: UserRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    public async createPayment({ usuarioId, tarjetaId, monto }: PaymentRequestInput): Promise<PaymentRecord & { mensaje_procesador: string }> {
        const normalizedUserId = usuarioId.trim();

        // 1. Obtener la tarjeta y el token_hash (debe existir y pertenecer al usuario)
        const card = await this.userRepository.getCardByUserIdAndCardId(normalizedUserId, tarjetaId);
        if (!card) {
            throw new HttpError(`Tarjeta con ID ${tarjetaId} no encontrada o no pertenece al usuario ${usuarioId}.`, 404);
        }

        let newPaymentId: number | undefined;
        // 2. Obtener un cliente de DB para manejar la transacción de forma explícita
        const client: PoolClient = await this.paymentRepository.getDbClient(); 

        try {
            await client.query('BEGIN');
            
            // 3. Crear un registro de pago inicial en estado 'PENDING'
            const initialPayment = await this.paymentRepository.createInitialPayment(client, {
                usuarioId: normalizedUserId,
                tarjetaId,
                monto,
                estado: 'PENDING'
            });
            newPaymentId = initialPayment.id;
            
            // 4. Llamar al procesador de pagos (FastAPI)
            const processorPayload = { monto, token_hash: card.token_hash };
            const processorResponse = await axios.post<{ estado: string, transaccion_id: string, mensaje: string }>(
                `${PAYMENT_PROCESSOR_URL}/process/`, 
                processorPayload
            );

            const { estado, transaccion_id, mensaje } = processorResponse.data;

            // 5. Actualizar el pago con la respuesta del procesador
            const finalPayment = await this.paymentRepository.updatePaymentStatus(client, newPaymentId, estado, transaccion_id);

            await client.query('COMMIT'); // Commit si todo fue exitoso

            // 6. Devolver el resultado final
            return {
                ...finalPayment,
                mensaje_procesador: mensaje
            };

        } catch (error: unknown) { // 👈 TIPADO EXPLÍCITO DE CATCH
            await client.query('ROLLBACK'); 

            // Manejo de errores de comunicación con el microservicio
            if (axios.isAxiosError(error)) {
                const status = error.response?.status || 503; 
                const message = error.response 
                    ? `[Python Processor] ${error.response.data.mensaje || JSON.stringify(error.response.data)}` 
                    : error.message;
                    
                throw new HttpError(`Fallo de comunicación con el procesador de pagos: ${message}`, status);
            }
            
            // Aseguramos que el error lanzado es un Error o HttpError (es buena práctica envolver 'unknown' errors)
            if (error instanceof HttpError) {
                throw error;
            }
            
            // Verificamos si es un error general de JS (como un error de pg) y lo relanzamos
            if (error instanceof Error) {
                 throw error;
            }
            
            // Si es algo completamente desconocido (ej. un string o número), lo envolvemos
            throw new Error(`Error desconocido durante la transacción: ${JSON.stringify(error)}`); 
        } finally {
            client.release();
        }
    }
    
    /**
     * Lista el historial de pagos de un usuario.
     */
    public async getPaymentsByUserId(usuarioId: string): Promise<PaymentRecord[]> {
        // 1. Validación de existencia de usuario
        const userExists = await this.userRepository.getUserById(usuarioId);
        if (!userExists) {
            throw new HttpError(`Usuario ${usuarioId} no encontrado.`, 404);
        }
        
        // 2. Obtener pagos del repositorio
        return this.paymentRepository.findByUserId(usuarioId.trim());
    }
}