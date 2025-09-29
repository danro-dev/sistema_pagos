import { Router } from 'express';
import { PaymentController } from '../../controllers/PaymentController';

export const router = Router();
const paymentController = new PaymentController();

/**
* @openapi
* /pagos:
*   post:
*     tags:
*       - Pagos
*     summary: Crea y procesa un pago.
*     description: Registra un pago en el sistema y lo envía al procesador externo para su autorización.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/PagoCreateInput'
*     responses:
*       '200':
*         description: Pago procesado exitosamente.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/PagoProcesadoResponse'
*       '400':
*         $ref: '#/components/responses/Error400'
*       '404':
*         $ref: '#/components/responses/Error404'
*       '500':
*         $ref: '#/components/responses/Error500'
*/
router.post('/pagos', paymentController.createPayment);

/**
* @openapi
* /usuarios/{userId}/pagos:
*   get:
*     tags:
*       - Pagos
*     summary: Obtiene el historial de pagos de un usuario.
*     description: Devuelve la lista de pagos ordenada por fecha de creación (descendente).
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: string
*           format: uuid
*         description: Identificador del usuario.
*     responses:
*       '200':
*         description: Listado de pagos del usuario.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Pago'
*       '404':
*         $ref: '#/components/responses/Error404'
*       '500':
*         $ref: '#/components/responses/Error500'
*/
router.get('/usuarios/:userId/pagos', paymentController.getPaymentHistory);