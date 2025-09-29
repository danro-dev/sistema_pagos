import path from 'path';
import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const routesGlobTs = path.resolve(__dirname, '../routes/v1/*.ts');
const routesGlobJs = path.resolve(__dirname, '../routes/v1/*.js');
const controllersGlobTs = path.resolve(__dirname, '../controllers/*.ts');
const controllersGlobJs = path.resolve(__dirname, '../controllers/*.js');

const options: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Sistema de Pagos - API REST',
      version: '1.0.0',
      description:
        'Documentación interactiva de la API REST del sistema de pagos. Incluye creación de usuarios, registro de tarjetas y procesamiento de pagos.',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Versión 1 de la API REST del sistema de pagos',
      },
    ],
    tags: [
      {
        name: 'Usuarios',
        description: 'Endpoints para la administración de usuarios y tarjetas asociadas.',
      },
      {
        name: 'Pagos',
        description: 'Endpoints para el procesamiento de pagos y la consulta de historiales.',
      },
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'f6d7f8b0-1234-4c3e-9abc-1d2e3f456789' },
            nombre: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan.perez@example.com' },
          },
        },
        UsuarioCreateInput: {
          type: 'object',
          required: ['nombre', 'email'],
          properties: {
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario.',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único del usuario.',
              example: 'juan.perez@example.com',
            },
          },
        },
        UsuarioCreateResponse: {
          type: 'object',
          properties: {
            mensaje: { type: 'string', example: 'Usuario creado exitosamente.' },
            usuario: { $ref: '#/components/schemas/Usuario' },
          },
        },
        Tarjeta: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 15 },
            usuario_id: { type: 'string', format: 'uuid', example: 'f6d7f8b0-1234-4c3e-9abc-1d2e3f456789' },
            ultimos_cuatro: { type: 'string', example: '1234' },
            nombre_titular: { type: 'string', example: 'Juan Pérez' },
          },
        },
        TarjetaRegistroInput: {
          type: 'object',
          required: ['numero_tarjeta', 'fecha_expiracion', 'cvv', 'nombre_titular'],
          properties: {
            numero_tarjeta: {
              type: 'string',
              pattern: '^\\d{16}$',
              description: 'Número ficticio de tarjeta de 16 dígitos.',
              example: '4111111111111111',
            },
            fecha_expiracion: {
              type: 'string',
              description: 'Fecha de expiración en formato MM/AA.',
              example: '12/28',
            },
            cvv: {
              type: 'string',
              description: 'Código de verificación de 3 dígitos.',
              example: '123',
            },
            nombre_titular: {
              type: 'string',
              description: 'Nombre impreso en la tarjeta.',
              example: 'Juan Pérez',
            },
          },
        },
        TarjetaRegistroResponse: {
          type: 'object',
          properties: {
            mensaje: { type: 'string', example: 'Tarjeta registrada exitosamente y tokenizada (ficticiamente).' },
            tarjeta: { $ref: '#/components/schemas/Tarjeta' },
          },
        },
        Pago: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 27 },
            usuario_id: { type: 'string', format: 'uuid', example: 'f6d7f8b0-1234-4c3e-9abc-1d2e3f456789' },
            tarjeta_id: { type: 'integer', example: 15 },
            monto: { type: 'number', format: 'float', example: 1500.75 },
            estado: { type: 'string', example: 'APPROVED' },
            transaccion_id: { type: 'string', nullable: true, example: 'TXN-1234567890' },
            fecha_pago: { type: 'string', format: 'date-time', example: '2024-05-01T18:34:12.123Z' },
          },
        },
        PagoCreateInput: {
          type: 'object',
          required: ['usuario_id', 'tarjeta_id', 'monto'],
          properties: {
            usuario_id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador del usuario que realiza el pago.',
              example: 'f6d7f8b0-1234-4c3e-9abc-1d2e3f456789',
            },
            tarjeta_id: {
              type: 'integer',
              description: 'Identificador de la tarjeta registrada que se usará en el pago.',
              example: 15,
            },
            monto: {
              type: 'number',
              format: 'float',
              description: 'Monto total del pago en moneda local.',
              example: 1500.75,
            },
          },
        },
        PagoProcesadoResponse: {
          type: 'object',
          properties: {
            mensaje: {
              type: 'string',
              example: 'Pago autorizado por el procesador externo.',
            },
            pago: { $ref: '#/components/schemas/Pago' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Detalle del error.' },
            details: { type: 'string', nullable: true, example: 'Información adicional del error.' },
          },
        },
      },
      responses: {
        Error400: {
          description: 'Solicitud inválida.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Error404: {
          description: 'Recurso no encontrado.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Error409: {
          description: 'Conflicto por datos duplicados.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Error500: {
          description: 'Error interno del servidor.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  apis: [routesGlobTs, controllersGlobTs, routesGlobJs, controllersGlobJs],
};

export const swaggerSpec = swaggerJsdoc(options);