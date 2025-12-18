-- Script de datos adaptado para PostgreSQL
-- Orden de inserción cuidado para respetar Foreign Keys (Categoría -> Liga -> Equipo)

BEGIN; -- Iniciamos una transacción para que si falla algo, no se guarde nada a medias

-- 1. Tabla: Categoria
INSERT INTO categoria (id_categoria, nombre, edad_min, edad_max) VALUES 
(3,'Alevín',10,11),
(4,'Infantil',12,13),
(5,'Cadete',14,15),
(6,'Juvenil',16,18),
(7,'Senior',19,40);

-- 2. Tabla: Liga
INSERT INTO liga (idliga, nombre, temporada, nivel, observaciones, id_categoria) VALUES 
(1,'Liga Alevín A','2025/2026','Preferente','',3),
(2,'Liga Cadete A','2025/2026','Preferente','',5);

-- 3. Tabla: Equipo
INSERT INTO equipo (id_equipo, nombre, id_categoria, fecha_creacion, observaciones, id_liga) VALUES 
(15,'Alevín A',3,'2025-11-03','Equipo base Alevín principal',1),
(16,'Infantil A',4,'2025-11-03','Equipo infantil primer nivel',1),
(17,'Infantil B',4,'2025-11-03','Equipo infantil segundo nivel',1),
(18,'Cadete A',5,'2025-11-03','Equipo cadete principal',2),
(19,'Cadete B',5,'2025-11-03','Equipo cadete segundo nivel',1),
(20,'Juvenil A',6,'2025-11-03','Equipo juvenil principal',1),
(21,'Juvenil B',6,'2025-11-03','Equipo juvenil segundo nivel',1),
(22,'Filial',7,'2025-11-03','Equipo filial del primer equipo',1),
(23,'Primer Equipo',7,'2025-11-03','Equipo sénior principal del club',1),
(24,'Cadete B',5,'2025-11-10','Equipo cadete segundo nivel',2);

-- 4. Tabla: Usuario
-- Nota: Postgres usa 'YYYY-MM-DD' para fechas, igual que MySQL.
INSERT INTO usuario (id_usuario, nombre, apellidos, email, password_hash, rol, fecha_alta, telefono, direccion) VALUES 
(53,'Sergio','Estudillo Marabot','sergio.estudilloo7@gmail.com','$2a$10$uIuKQMg6FdtJyqmK..5dFOxrFxPzvlwX3cLEbhHg4TFSuM67o9.AW','JUGADOR','2025-11-16',NULL,NULL),
(54,'Carlos','Duty BlackOps','Carlos@club.com','$2a$10$Lj94/8M.bFd6p9sMLyrLqO6dhLZtg/Xq.K/ch5CmtOzp.7fW7Tc5.','JUGADOR','2025-11-16',NULL,NULL),
(55,'Perico ','Palotes Pelotas','perico@cub.com','$2a$10$2belp4ZTcRMf3J1N3WLLKe8q8LFjWfHVlNpRhUngbz9yn8UaZDw9i','JUGADOR','2025-11-16',NULL,NULL),
(56,'Alvaro','Molina','Alvaro@club.com','$2a$10$0dtWvD8J7o83tPQ6QOh.Se6ni8WDJ4EeisHxpo1J6gTr/etCpxirm','JUGADOR','2025-11-16',NULL,NULL),
(57,'Antonio','Estudillo Butron','sestmar1996@gmail.com','$2a$10$uqEUvaRXlr9OE1.WUxBVq.VDelbUh/GU8BzMvkiojboxgwAkFIUSW','JUGADOR','2025-11-18','123456789',NULL),
(58,'pepe','pepardo','pepe@pepe.com','$2a$10$F9LRZXwN36Q3UUVA97Xj4.9GTRi6Lzjyo0Btb34.jX0sHr4H9LVVm','JUGADOR','2025-11-18',NULL,NULL),
(59,'Antonio','Estudillo Butrón','antonio@prueba.com','$2a$10$uPMGOqSBreAxyCM5qYwRTOA1j9wCXRDAF.vrwg8lsNuuh9hy3/gLe','JUGADOR','2025-12-17','1234567',NULL);

-- 5. Tabla: Convocatoria
INSERT INTO convocatoria (id_convocatoria, id_equipo, fecha_evento, tipo, observaciones) VALUES 
(1,16,'2025-11-15 17:00:00','entrenamiento','Entrenamiento preparatorio para el próximo partido');

-- Actualizar las secuencias (AUTO_INCREMENT)
-- Postgres no actualiza automáticamente el contador del ID al insertar manualmente IDs explícitos.
-- Hay que decirle: "Oye, el siguiente ID libre es el máximo que haya en la tabla + 1".

SELECT setval('categoria_id_categoria_seq', (SELECT MAX(id_categoria) FROM categoria));
SELECT setval('liga_idliga_seq', (SELECT MAX(idliga) FROM liga));
SELECT setval('equipo_id_equipo_seq', (SELECT MAX(id_equipo) FROM equipo));
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));
SELECT setval('convocatoria_id_convocatoria_seq', (SELECT MAX(id_convocatoria) FROM convocatoria));

COMMIT; -- Guardar cambios