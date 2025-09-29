import { Router } from 'express';
import { UserController } from '../../controllers/UserController';

export const router = Router();
const userController = new UserController();

/**
* @openapi
* /usuarios:
*   post:
*     tags:
*       - Usuarios
*     summary: Crea un nuevo usuario.
*     description: Registra un usuario en el sistema de pagos.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/UsuarioCreateInput'
*     responses:
*       '201':
*         description: Usuario creado exitosamente.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/UsuarioCreateResponse'
*       '400':
*         $ref: '#/components/responses/Error400'
*       '409':
*         $ref: '#/components/responses/Error409'
*       '500':
*         $ref: '#/components/responses/Error500'
*/
router.post('/usuarios', userController.create);

/**
* @openapi
* /usuarios/{userId}/tarjetas:
*   post:
*     tags:
*       - Usuarios
*     summary: Registra una tarjeta para un usuario.
*     description: Almacena los datos tokenizados de una tarjeta ficticia asociada a un usuario existente.
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: string
*           format: uuid
*         description: Identificador del usuario.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/TarjetaRegistroInput'
*     responses:
*       '201':
*         description: Tarjeta registrada y tokenizada exitosamente.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/TarjetaRegistroResponse'
*       '400':
*         $ref: '#/components/responses/Error400'
*       '404':
*         $ref: '#/components/responses/Error404'
*       '500':
*         $ref: '#/components/responses/Error500'
*/
router.post('/usuarios/:userId/tarjetas', userController.registerCard);