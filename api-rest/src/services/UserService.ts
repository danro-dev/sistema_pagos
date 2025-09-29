// api-rest/src/services/UserService.ts - CORREGIDO

import { UserRepository, User, Card } from '../repositories/UserRepository';
import * as crypto from 'crypto'; 
import { HttpError } from '../utils/httpErrors'; // Importación necesaria

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Crea un usuario verificando que no exista un email duplicado.
     */
    public async create(nombre: string, email: string): Promise<User> {
        try {
            return await this.userRepository.createUser(nombre, email);
        } catch (error: any) {
            // Manejo específico de error de duplicidad de PostgreSQL (código '23505')
            if (error.code === '23505' && error.constraint === 'idx_usuarios_email') {
                // Usamos 409 Conflict para duplicidad
                throw new HttpError('El email proporcionado ya está registrado.', 409); 
            }
            throw error;
        }
    }

    /**
     * Registra una tarjeta ficticia para un usuario, generando un token hash simulado.
     */
    public async registerCard(
        userId: string,
        cardNumber: string,
        expDate: string,
        cvv: string,
        holderName: string
    ): Promise<Card> {
        // 1. Verificar que el usuario exista
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            // USAMOS HttpError para el 404
            throw new HttpError(`Usuario con ID ${userId} no encontrado.`, 404);
        }

        // 2. Lógica de "tokenización" simulada
        const ultimosCuatro = cardNumber.slice(-4);
        const tokenHash = crypto.createHash('sha256').update(cardNumber).digest('hex').slice(0, 32); 

        // 3. Persistir en el repositorio
        return await this.userRepository.createCard(
            userId, 
            ultimosCuatro, 
            tokenHash, 
            expDate, 
            holderName
        );
    }
}