// api-rest/src/utils/httpErrors.ts

/**
 * Clase de error personalizada para incluir un código de estado HTTP.
 * Permite manejar errores de negocio de forma estructurada.
 */
export class HttpError extends Error {
    public status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        // Establecer el prototipo explícitamente es necesario para ES5 y Babel
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}