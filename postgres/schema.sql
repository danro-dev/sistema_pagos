--
-- ESQUEMA DE BASE DE DATOS PARA EL SISTEMA DE PAGOS
--

-- Configuración de zona horaria para consistencia
SET TIME ZONE 'UTC';

-- Extensiones necesarias para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices: Acelera búsquedas comunes
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios (email);

-- Tabla de Tarjetas de Crédito (Datos Ficticios y Tokenizados)
CREATE TABLE tarjetas (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    -- Datos "sensibles" ficticios
    ultimos_cuatro VARCHAR(4) NOT NULL, -- Solo los últimos 4 dígitos visibles
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- Simula un token seguro o hash del número completo (para uso interno)
    fecha_expiracion VARCHAR(5) NOT NULL, -- MM/YY
    nombre_titular VARCHAR(100) NOT NULL,
    -- Metadatos
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Restricción de seguridad: Asegura la unicidad del token dentro del sistema.
    UNIQUE (token_hash)
);

-- Índice: Búsqueda rápida de tarjetas por usuario
CREATE INDEX idx_tarjetas_usuario_id ON tarjetas (usuario_id);

-- Tabla de Pagos
-- Estado: PENDING (antes de enviar al procesador), APPROVED, REJECTED, ERROR
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tarjeta_id INT NOT NULL REFERENCES tarjetas(id) ON DELETE RESTRICT,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(3) DEFAULT 'USD',
    estado VARCHAR(20) NOT NULL,
    transaccion_id VARCHAR(50) UNIQUE, -- ID devuelto por el procesador de pagos (puede ser NULL temporalmente)
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices: Búsqueda rápida por usuario y asegurar unicidad de transacción.
CREATE INDEX idx_pagos_usuario_id ON pagos (usuario_id);
CREATE UNIQUE INDEX idx_pagos_transaccion_id ON pagos (transaccion_id) WHERE transaccion_id IS NOT NULL;

-- Función para actualizar la columna 'actualizado_en' automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.actualizado_en = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para mantener 'actualizado_en'
CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarjetas_updated_at
BEFORE UPDATE ON tarjetas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();