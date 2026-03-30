-- NOTA: Este proyecto NO usa Flyway ni Liquibase.
-- Ejecutar manualmente en PostgreSQL antes de arrancar la aplicación.
--
-- Nombres de tabla verificados en las entidades JPA:
--   - Usuario  → tabla: "usuario"  (sin @Table, nombre de clase en lowercase)
--   - Equipo   → tabla: "equipo"   (sin @Table, nombre de clase en lowercase)
--   - mensajes → tabla: "mensajes" (definido en @Table(name = "mensajes"))
--
-- PKs verificadas:
--   - usuario.id_usuario  (Integer, idUsuario con naming strategy spring)
--   - equipo.id_equipo    (Integer, @Column(name = "id_equipo"))

CREATE TABLE IF NOT EXISTS mensajes (
    id BIGSERIAL PRIMARY KEY,
    remitente_id INTEGER NOT NULL REFERENCES usuario(id_usuario),
    equipo_id INTEGER REFERENCES equipo(id_equipo),
    destinatario_id INTEGER REFERENCES usuario(id_usuario),
    contenido TEXT NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_mensajes_equipo ON mensajes(equipo_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
