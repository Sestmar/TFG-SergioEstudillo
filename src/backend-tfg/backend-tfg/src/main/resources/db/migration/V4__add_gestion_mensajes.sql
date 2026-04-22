-- Migración manual V4 — Gestión de vida del mensaje (editar, eliminar, respuestas)
-- Ejecutar en PostgreSQL ANTES de arrancar el backend.

ALTER TABLE mensajes
    ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES mensajes(id),
    ADD COLUMN IF NOT EXISTS editado   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS eliminado BOOLEAN NOT NULL DEFAULT FALSE;

-- Índice útil para cargar las respuestas de un mensaje (Fase futura)
CREATE INDEX IF NOT EXISTS idx_mensajes_parent ON mensajes(parent_id);
