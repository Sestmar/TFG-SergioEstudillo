-- Migración manual V3 — Soporte de adjuntos en mensajes
-- Ejecutar en PostgreSQL ANTES de arrancar el backend.
--
-- 1. Añade columnas de adjunto (nullable: un mensaje puede ser solo texto o solo adjunto).
-- 2. Relaja la restricción NOT NULL de contenido para permitir mensajes solo-imagen.

ALTER TABLE mensajes
    ADD COLUMN IF NOT EXISTS url_adjunto  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS tipo_adjunto VARCHAR(20);

-- Permitir mensajes con adjunto sin texto
ALTER TABLE mensajes
    ALTER COLUMN contenido DROP NOT NULL;
