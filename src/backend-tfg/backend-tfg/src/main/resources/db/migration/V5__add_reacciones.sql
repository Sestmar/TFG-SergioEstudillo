-- Tabla de reacciones a mensajes.
-- Restricción única (mensaje_id, usuario_id): un usuario solo puede tener
-- una reacción por mensaje. Si elige otro emoji, se reemplaza (UPDATE).
-- Los tipos de columna siguen los tipos PK de las tablas referenciadas:
--   mensajes.id        → BIGINT  (BIGSERIAL)
--   usuario.id_usuario → INTEGER (SERIAL)

CREATE TABLE IF NOT EXISTS reacciones_mensaje (
    id         BIGSERIAL PRIMARY KEY,
    mensaje_id BIGINT  NOT NULL REFERENCES mensajes(id)   ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    emoji      VARCHAR(20) NOT NULL,
    CONSTRAINT uq_reaccion UNIQUE (mensaje_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_reacciones_mensaje ON reacciones_mensaje(mensaje_id);
