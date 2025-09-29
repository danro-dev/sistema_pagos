import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config(); // Carga variables de .env

// Configuración leída de variables de entorno
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, // En Docker será 'db'
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

/**
 * Obtiene un cliente para operaciones transaccionales o múltiples consultas.
 */
export const getDbClient = (): Promise<PoolClient> => {
    return pool.connect();
};

console.log('PostgreSQL Pool inicializado.');