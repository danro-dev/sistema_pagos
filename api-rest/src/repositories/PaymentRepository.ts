import { getDbClient } from '../config/db';
import { PoolClient } from 'pg';

export interface PaymentInputDB {
    usuarioId: string;
    tarjetaId: string;
    monto: number;
    estado: string;
}

export interface PaymentRecord {
    id: number;
    usuario_id: string;
    tarjeta_id: string;
    monto: number;
    estado: string;
    transaccion_id: string | null;
    fecha_pago: Date;
}

export class PaymentRepository {

    /** Expone el cliente de DB para el manejo de Transacciones en el Service. */
    public getDbClient(): Promise<PoolClient> {
        return getDbClient();
    }
    
    /**
     * Crea un registro de pago inicial (normalmente en estado PENDING).
     */
    public async createInitialPayment(client: PoolClient, data: PaymentInputDB): Promise<PaymentRecord> {
        const query = `
            INSERT INTO pagos (usuario_id, tarjeta_id, monto, estado)
            VALUES ($1, $2, $3, $4)
            RETURNING id, usuario_id, tarjeta_id, monto, estado, transaccion_id, fecha_pago;
        `;
        const result = await client.query(query, [data.usuarioId, data.tarjetaId, data.monto, data.estado]);
        return result.rows[0];
    }

    /**
     * Actualiza el estado del pago después de la respuesta del procesador.
     */
    public async updatePaymentStatus(client: PoolClient, paymentId: number, estado: string, transaccionId: string): Promise<PaymentRecord> {
        const query = `
            UPDATE pagos
            SET estado = $1, transaccion_id = $2
            WHERE id = $3
            RETURNING id, usuario_id, tarjeta_id, monto, estado, transaccion_id, fecha_pago;
        `;
        const result = await client.query(query, [estado, transaccionId, paymentId]);
        
        if (result.rowCount === 0) {
            throw new Error(`Payment with ID ${paymentId} not found.`);
        }
        return result.rows[0];
    }

    /**
     * Obtiene el historial de pagos para un usuario específico.
     */
    public async findByUserId(userId: string): Promise<PaymentRecord[]> {
        const client = await getDbClient();
        try {
            const query = `
                SELECT id, usuario_id, tarjeta_id, monto, estado, transaccion_id, fecha_pago
                FROM pagos 
                WHERE usuario_id = $1 
                ORDER BY fecha_pago DESC;
            `;
            const result = await client.query(query, [userId]);
            return result.rows;
        } finally {
            client.release();
        }
    }
}