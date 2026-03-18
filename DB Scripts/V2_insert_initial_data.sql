
INSERT INTO auxiliares_t (id, nombre, descripcion, estado) VALUES
(1, 'Contabilidad', 'Módulo de Contabilidad General', TRUE),
(2, 'Nomina', 'Módulo de Gestión de Nómina', TRUE),
(3, 'Facturacion', 'Módulo de Facturación y Ventas', TRUE),
(4, 'Inventario', 'Control de Inventarios y Almacén', TRUE),
(5, 'Cuentas x Cobrar', 'Gestión de Cuentas por Cobrar', TRUE),
(6, 'Cuentas x Pagar', 'Gestión de Cuentas por Pagar', TRUE),
(7, 'Compras', 'Gestión de Compras y Suministros', TRUE),
(8, 'Activos Fijos', 'Control de Activos Fijos', TRUE),
(9, 'Cheques', 'Emisión y Control de Cheques', TRUE);

INSERT INTO monedas_t (codigo_iso, simbolo, descripcion, tasa_cambio, estado)
VALUES 
    ('USD', '$', 'Dólar Estadounidense', 1.0000, TRUE),
    ('EUR', '€', 'Euro (Zona Euro)', 0.9245, TRUE),
    ('GBP', '£', 'Libra Esterlina', 0.7890, TRUE),
    ('JPY', '¥', 'Yen Japonés', 150.1200, TRUE);

INSERT INTO tipos_cuenta_t (nombre, descripcion, origen, estado)
VALUES
    ('Activo', 'Recursos y bienes de la entidad', 'Debito', TRUE),
    ('Pasivo', 'Obligaciones y deudas de la entidad', 'Credito', TRUE),
    ('Patrimonio', 'Capital y reservas de la entidad', 'Credito', TRUE),
    ('Ingreso', 'Entradas económicas por operaciones', 'Credito', TRUE),
    ('Costo', 'Costos directos de operación o venta', 'Debito', TRUE),
    ('Gasto', 'Erogaciones operativas y administrativas', 'Debito', TRUE);

INSERT INTO cuentas_contables_t (
    nombre,
    descripcion,
    permite_movimiento,
    tipo_id,
    nivel,
    balance,
    cuenta_mayor_id,
    estado
)
VALUES
    ('Caja General', 'Disponibilidad en efectivo', TRUE, (SELECT id FROM tipos_cuenta_t WHERE nombre = 'Activo' LIMIT 1), 1, 0.0000, NULL, TRUE),
    ('Banco Popular Cuenta Corriente', 'Fondos depositados en banco', TRUE, (SELECT id FROM tipos_cuenta_t WHERE nombre = 'Activo' LIMIT 1), 1, 0.0000, NULL, TRUE),
    ('Cuentas por Pagar Proveedores', 'Obligaciones pendientes con suplidores', TRUE, (SELECT id FROM tipos_cuenta_t WHERE nombre = 'Pasivo' LIMIT 1), 1, 0.0000, NULL, TRUE),
    ('Capital Social', 'Aportes de los socios', TRUE, (SELECT id FROM tipos_cuenta_t WHERE nombre = 'Patrimonio' LIMIT 1), 1, 0.0000, NULL, TRUE),
    ('Gastos Administrativos', 'Gastos operativos del período', TRUE, (SELECT id FROM tipos_cuenta_t WHERE nombre = 'Gasto' LIMIT 1), 1, 0.0000, NULL, TRUE);
