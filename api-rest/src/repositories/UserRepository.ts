// Definiciones de Tipos
export interface User {
    id: string;
    nombre: string;
    email: string;
}

export interface Card {
    id: number;
    usuario_id: string;
    ultimos_cuatro: string;
    token_hash: string;
    fecha_expiracion: string;
    nombre_titular: string;
}

import { getDbClient } from '../config/db';
import { PoolClient } from 'pg';

export class UserRepository {

    /**
     * Crea un nuevo usuario en la tabla 'usuarios'.
     * @param nombre - Nombre del usuario.
     * @param email - Email único del usuario.
     * @returns El objeto de usuario creado.
     */
    public async createUser(nombre: string, email: string): Promise<User> {
        const client = await getDbClient();
        try {
            const query = `
                INSERT INTO usuarios (nombre, email)
                VALUES ($1, $2)
                RETURNING id, nombre, email;
            `;
            const result = await client.query(query, [nombre, email]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }
    
    /**
     * Obtiene un usuario por su ID.
     */
    public async getUserById(id: string): Promise<User | null> {
        const client = await getDbClient();
        try {
            const result = await client.query('SELECT id, nombre, email FROM usuarios WHERE id = $1', [id]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    /**
     * Registra una tarjeta (tokenizada) asociada a un usuario.
     */
    public async createCard(
        userId: string,
        ultimosCuatro: string, 
        tokenHash: string, 
        expDate: string, 
        holderName: string
    ): Promise<Card> {
        const client = await getDbClient();
        try {
            const query = `
                INSERT INTO tarjetas (usuario_id, ultimos_cuatro, token_hash, fecha_expiracion, nombre_titular)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, usuario_id, ultimos_cuatro, token_hash, fecha_expiracion, nombre_titular;
            `;
            const result = await client.query(query, [userId, ultimosCuatro, tokenHash, expDate, holderName]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    /**
     * Obtiene una tarjeta por ID y verifica que pertenezca al usuario.
     */
    public async getCardByUserIdAndCardId(userId: string, cardId: number): Promise<Card | null> {
        const client = await getDbClient();
        try {
            const query = `
                SELECT id, usuario_id, ultimos_cuatro, token_hash, fecha_expiracion, nombre_titular
                FROM tarjetas 
                WHERE id = $1 AND usuario_id = $2
            `;
            const result = await client.query(query, [cardId, userId]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }
}