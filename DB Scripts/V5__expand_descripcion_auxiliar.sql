ALTER TABLE auxiliares_t ALTER COLUMN descripcion TYPE VARCHAR(500);

UPDATE auxiliares_t SET descripcion = 'Integrantes: Ver documentación del proyecto' WHERE id = 8;