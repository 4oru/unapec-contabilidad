-- Agregar moneda y tasa de cambio al encabezado del asiento
ALTER TABLE asientos_t ADD COLUMN moneda_id INT REFERENCES monedas_t(id);
ALTER TABLE asientos_t ADD COLUMN tasa_cambio DECIMAL(12, 4) NOT NULL DEFAULT 1.0000;
ALTER TABLE asientos_t ADD COLUMN monto_total_dop DECIMAL(18, 2);

-- Actualizar registros existentes asumiendo DOP (id=1, tasa=1)
UPDATE asientos_t SET moneda_id = 1, tasa_cambio = 1.0000, monto_total_dop = monto_total;