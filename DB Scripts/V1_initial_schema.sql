-- V1__initial_schema.sql
-- Descripción: Creación de tablas para el sistema contable
-- Autor: Alan Roman

-- 1. Monedas
CREATE TABLE monedas_t (
    id SERIAL PRIMARY KEY,
    codigo_iso VARCHAR(3) NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    tasa_cambio DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tipos de Cuenta
CREATE TABLE tipos_cuenta_t (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100),
    origen VARCHAR(10) CHECK (origen IN ('Debito', 'Credito')),
    estado BOOLEAN DEFAULT TRUE
);

-- 3. Auxiliares
CREATE TABLE auxiliares_t (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100),
    estado BOOLEAN DEFAULT TRUE
);

-- 4. Cuentas Contables
CREATE TABLE cuentas_contables_t (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(100),
    permite_movimiento BOOLEAN DEFAULT TRUE,
    tipo_id INT REFERENCES tipos_cuenta_t(id),
    nivel INT,
    balance DECIMAL(12, 4) DEFAULT 0.0000,
    cuenta_mayor_id INT REFERENCES cuentas_contables_t(id),
    estado BOOLEAN DEFAULT TRUE
);

-- 5. Encabezado de Asientos
CREATE TABLE asientos_t (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    auxiliar_id INT REFERENCES auxiliares_t(id),
    fecha_asiento DATE DEFAULT CURRENT_TIMESTAMP,
    monto_total DECIMAL(18, 2) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

-- 6. Detalles del Asiento
CREATE TABLE asientos_detalle_t (
    id SERIAL PRIMARY KEY,
    asiento_id INT REFERENCES asientos_t(id) ON DELETE CASCADE,
    cuenta_id INT REFERENCES cuentas_contables_t(id),
    tipo_movimiento VARCHAR(10) CHECK (tipo_movimiento IN ('Debito', 'Credito')),
    monto DECIMAL(18, 2) NOT NULL
);
