import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { router as userRoutes } from './routes/v1/userRoutes';
import { router as paymentRoutes } from './routes/v1/paymentRoutes';
// Importar errorHandler si se crea

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());

// Documentación interactiva
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Rutas de la API (versión 1)
app.use('/api/v1', userRoutes);
app.use('/api/v1', paymentRoutes);

// Manejo de errores (Placeholder para el errorHandler.ts)
// app.use(errorHandler);

// Redirección de raíz a la documentación
app.get('/', (_req: Request, res: Response) => {
    res.redirect('/docs');
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'api-rest' });
});

app.listen(PORT, () => {
    console.log(`🚀 API REST corriendo en http://localhost:${PORT}`);
});