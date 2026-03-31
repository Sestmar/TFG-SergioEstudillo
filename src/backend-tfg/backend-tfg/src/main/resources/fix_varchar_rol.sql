-- Fix: ampliar columnas VARCHAR(20) -> VARCHAR(50) para el campo 'rol'
-- Ejecutar manualmente en PostgreSQL antes de reiniciar el backend.
--
-- Contexto del error:
--   SQLSTATE 22001: "value too long for type character varying(20)"
--   El campo 'rol' en 'usuario' almacena valores como 'ROLE_ENTRENADOR' (16 chars)
--   y puede recibir valores arbitrarios vía AdminService.
--   El campo 'rol' en 'equipo_entrenador' almacena strings como 'Entrenador Principal'
--   (exactamente 20 chars, al limite) y puede recibir valores mas largos del frontend.

ALTER TABLE usuario
    ALTER COLUMN rol TYPE VARCHAR(50);

ALTER TABLE equipo_entrenador
    ALTER COLUMN rol TYPE VARCHAR(50);
