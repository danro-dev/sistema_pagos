# Sistema Distribuido de Pagos Ficticios

## 💳 Prueba Técnica de Desarrollador Backend

Este proyecto implementa un sistema básico de pagos, cumpliendo con los requisitos de la prueba técnica al utilizar una **API RESTful** principal en **Node.js/TypeScript** que se comunica con un **Microservicio** en **Python/FastAPI** para la simulación del procesamiento transaccional, todo respaldado por **PostgreSQL**.

### 🎯 Enfoque de Arquitectura

El proyecto se diseñó con una **Arquitectura de Microservicios** ligera y una estricta **Arquitectura por Capas** en el _backend_ principal para garantizar la **escalabilidad**, la **mantenibilidad** y la **claridad del código**:

- **API REST (Node.js/TS):** Orquestador y capa de acceso público, implementando las capas de **Controller** $\rightarrow$ **Service** $\rightarrow$ **Repository**.
- **Servicio de Pagos (Python/FastAPI):** Microservicio separado que simula una pasarela de pago externa, promoviendo la **separación de responsabilidades**.
- **Transaccionalidad:** El proceso de pago es atómico gracias al uso de **transacciones explícitas** de PostgreSQL, asegurando la integridad de los datos.

## 🛠️ Stack Tecnológico

| Componente            | Tecnología             | Lenguaje / Framework | Versión |
| :-------------------- | :--------------------- | :------------------- | :------ |
| **Backend Principal** | Node.js con Express    | TypeScript           | v20+    |
| **Servicio de Pagos** | Microservicio HTTP     | Python / FastAPI     | v3.11+  |
| **Base de Datos**     | PostgreSQL             | SQL                  | v14+    |
| **Orquestación**      | Docker Compose         | YAML                 | v3.8    |
| **Acceso a DB**       | `node-postgres` (`pg`) |                      |         |
| **Validación**        | Pydantic (Python)      |                      |         |

## ⚙️ Instalación y Ejecución con Docker Compose (Recomendado)

La solución está completamente contenedorizada para facilitar el _setup_ en cualquier entorno.

### Prerrequisitos

- **Git**
- **Docker** y **Docker Compose**

### Pasos de Ejecución

1.  **Clonar el Repositorio**

    ```bash
    git clone [LINK_A_TU_REPOSITORIO]
    cd backend-payment-system
    ```

2.  **Configurar Variables de Entorno**

    Crea un archivo `.env` en la raíz del proyecto copiando el contenido de `.env.example`. Asegúrate de que las credenciales de PostgreSQL estén definidas.

    ```bash
    cp .env.example .env
    ```

3.  **Levantar el Sistema Completo**

    El comando construirá las imágenes, iniciará los contenedores (DB, Python, Node.js) y ejecutará automáticamente el script `./postgres/schema.sql` para crear las tablas.

    ```bash
    docker-compose up --build -d
    ```

4.  **Verificar el Estado de los Servicios**

    ```bash
    docker-compose ps
    ```

| Servicio                    | Puerto Local | URL                     |
| :-------------------------- | :----------- | :---------------------- |
| **API REST (Node.js)**      | `3000`       | `http://localhost:3000` |
| **Servicio Pagos (Python)** | `8001`       | `http://localhost:8001` |
| **PostgreSQL (DB)**         | `5432`       | `localhost:5432`        |

### 📘 Documentación OpenAPI (Swagger)

La API REST expone documentación interactiva con **Swagger UI** en la ruta `/docs`.

- **Ejecución con Docker Compose (recomendado):** luego de `docker-compose up --build -d`, visita `http://localhost:3000/docs`.
- **Ejecución local sin contenedores:** en caso de desarrollar fuera de Docker, ejecuta:

  ```bash
  cd api-rest
  npm install
  npm run dev
  ```

  y luego ingresa a `http://localhost:3000/docs`.

La API base permanece disponible en `http://localhost:3000/api/v1`.

---

## 🚀 Endpoints del API REST (`/api/v1`) y Flujo de Prueba

### Colección de Postman

Se adjunta el archivo **`Payments_Collection.json`** en la raíz del repositorio. Se recomienda usar esta colección para seguir el flujo de prueba a continuación.

### Flujo de Prueba Detallado

| Paso                     | Método | Endpoint                             | Descripción                                                                                                                                                                      | Ejemplo de Body                                                                                                          |
| :----------------------- | :----- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **1. Crear Usuario**     | `POST` | `/api/v1/usuarios`                   | Registra el usuario que realizará los pagos.                                                                                                                                     | `{"nombre": "DanRo Pruebas", "email": "danro.dev@example.com"}`                                                          |
| **2. Registrar Tarjeta** | `POST` | `/api/v1/usuarios/{userId}/tarjetas` | Asocia una tarjeta **ficticia**. El API almacena los últimos 4 dígitos y genera un `token_hash` simulado para el procesamiento. **Use el `id` del usuario creado en el paso 1.** | `{"numero_tarjeta": "4111111111114444", "fecha_expiracion": "12/26", "cvv": "123", "nombre_titular": "DanRo Developer"}` |
| **3. Crear Pago**        | `POST` | `/api/v1/pagos`                      | Orquesta la transacción: registra `PENDING` en DB, llama a Python (80% Aprobado), actualiza a `APPROVED/REJECTED`.                                                               | `{"usuario_id": 1, "tarjeta_id": 1, "monto": 45.50}`                                                                     |
| **4. Listar Pagos**      | `GET`  | `/api/v1/usuarios/{userId}/pagos`    | Muestra el historial de pagos del usuario.                                                                                                                                       | (No requiere body)                                                                                                       |

### 🛑 Simulación del Procesador de Pagos

El servicio en **FastAPI** (`http://localhost:8001/process/`) tiene una lógica de simulación:

- **80% de probabilidad** de responder con el estado `APPROVED`.
- **20% de probabilidad** de responder con el estado `REJECTED`.

Ejecute la petición de _Crear Pago_ múltiples veces para probar ambos escenarios.

## 📁 Estructura del Proyecto

```
backend-payment-system/
├── api-rest/                  # Proyecto Node.js/TypeScript (API Principal)
│   ├── src/
│   │   ├── config/            # Conexión DB
│   │   ├── controllers/       # Lógica de respuesta HTTP
│   │   ├── repositories/      # Abstracción de acceso a DB (SQL)
│   │   ├── services/          # Lógica de Negocio y Orquestación de Pagos
│   │   └── routes/v1/         # Definición de Endpoints
├── payment-service/           # Proyecto Python/FastAPI (Microservicio de Pagos)
│   ├── app/
│   │   ├── api/               # Router/Endpoints
│   │   └── core/              # Lógica de Simulación
├── postgres/
│   └── schema.sql             # Diseño de Tablas con Índices y Restricciones
├── docker-compose.yml         # Orquestación de los 3 servicios
└── README.md
```
