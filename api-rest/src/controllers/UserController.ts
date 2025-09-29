// api-rest/src/controllers/UserController.ts - REVISIÓN FINAL

import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { HttpError } from '../utils/httpErrors'; // Asegúrate de que esta línea esté presente
import { isValidUUID } from '../utils/validation';

// Instanciar dependencias
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export class UserController {
    /**
     * POST /api/v1/usuarios - Crea un nuevo usuario.
     */
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const { nombre, email } = req.body;

            const user = await userService.create(nombre, email);
            res.status(201).json({ 
                mensaje: "Usuario creado exitosamente.", 
                usuario: user 
            });
        } catch (error: any) {
            // Capturamos el 409 de duplicidad de UserService
            if (error instanceof HttpError) {
                res.status(error.status).json({ error: error.message });
                return;
            }
            // Error general
            res.status(500).json({ error: error.message });
        }
    }
    
    /**
     * POST /api/v1/usuarios/:userId/tarjetas - Registra una tarjeta.
     */
    public async registerCard(req: Request, res: Response): Promise<void> {
        try {
            const userIdParam = req.params.userId;
            const { numero_tarjeta, fecha_expiracion, cvv, nombre_titular } = req.body;

            const normalizedUserId = userIdParam.trim();

            if (!isValidUUID(normalizedUserId)) {
                res.status(400).json({ error: "El identificador de usuario debe ser un UUID válido." });
                return;
            }

            // Validación de formato de datos
            if (!/^\d{16}$/.test(numero_tarjeta)) {
                res.status(400).json({ error: "Número de tarjeta debe ser de 16 dígitos (ficticio)." });
                return;
            }

            const card = await userService.registerCard(
                normalizedUserId,
                numero_tarjeta,
                fecha_expiracion,
                cvv,
                nombre_titular
            );

            res.status(201).json({ 
                mensaje: "Tarjeta registrada exitosamente y tokenizada (ficticiamente).", 
                tarjeta: { 
                    id: card.id, 
                    usuario_id: card.usuario_id,
                    ultimos_cuatro: card.ultimos_cuatro,
                    nombre_titular: card.nombre_titular
                } 
            });
        } catch (error: any) {
            // Capturamos el 404 de usuario no encontrado de UserService
            if (error instanceof HttpError) {
                res.status(error.status).json({ error: error.message });
                return;
            }
            // Error general 
            res.status(500).json({ error: error.message });
        }
    }
}