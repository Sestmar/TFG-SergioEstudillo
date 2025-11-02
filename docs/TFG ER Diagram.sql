CREATE TABLE `Usuario` (
  `id_usuario` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(50),
  `apellidos` varchar(70),
  `email` varchar(120) UNIQUE,
  `contraseña` varchar(255),
  `rol` varchar(20),
  `fecha_alta` date,
  `telefono` varchar(15),
  `direccion` varchar(120),
  `fecha_nacimiento` date
);

CREATE TABLE `Jugador` (
  `id_jugador` integer PRIMARY KEY AUTO_INCREMENT,
  `usuario` integer,
  `fecha_nacimiento` date,
  `estado` varchar(15),
  `telefono_contacto` varchar(15),
  `direccion` varchar(120),
  `fecha_alta` date,
  `fecha_baja` date,
  `observaciones` varchar(255),
  `equipo_principal` integer
);

CREATE TABLE `jugador_equipo` (
  `id_jugador` integer,
  `id_equipo` integer,
  `observacion` varchar(50),
  PRIMARY KEY (`id_jugador`, `id_equipo`)
);

CREATE TABLE `Categoria` (
  `id_categoria` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(30),
  `edad_min` integer,
  `edad_max` integer
);

CREATE TABLE `Equipo` (
  `id_equipo` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(50),
  `id_categoria` integer,
  `fecha_creacion` date,
  `observaciones` varchar(255)
);

CREATE TABLE `equipo_entrenador` (
  `id_equipo` integer,
  `id_entrenador` integer,
  `rol` varchar(20),
  PRIMARY KEY (`id_equipo`, `id_entrenador`)
);

CREATE TABLE `SolicitudInscripcion` (
  `id_solicitud` integer PRIMARY KEY AUTO_INCREMENT,
  `id_usuario` integer,
  `id_jugador` integer,
  `fecha_solicitud` date,
  `estado` varchar(15),
  `motivo_rechazo` varchar(255),
  `observaciones` varchar(255)
);

CREATE TABLE `Entrenador` (
  `id_entrenador` integer(pk,increment),
  `id_usuario` integer,
  `especialidad` varchar(50),
  `licencia` varchar(50),
  `telefono_contacto` varchar(15),
  `fecha_alta` date
);

CREATE TABLE `incidencia` (
  `id_incidencia` integer PRIMARY KEY AUTO_INCREMENT,
  `id_jugador` integer,
  `id_usuario` integer,
  `fecha_reporte` date,
  `tipo` varchar(30),
  `estado` varchar(15),
  `descripcion` varchar(255)
);

CREATE TABLE `Convocatoria` (
  `id_convocatoria` integer PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` integer,
  `fecha_evento` date,
  `tipo` varchar(30),
  `observaciones` varchar(50)
);

CREATE TABLE `convocatoria_jugador` (
  `id_convocatoria` integer,
  `id_jugador` integer,
  PRIMARY KEY (`id_convocatoria`, `id_jugador`)
);

ALTER TABLE `Jugador` ADD FOREIGN KEY (`usuario`) REFERENCES `Usuario` (`id_usuario`);

ALTER TABLE `jugador_equipo` ADD FOREIGN KEY (`id_jugador`) REFERENCES `Jugador` (`id_jugador`);

ALTER TABLE `jugador_equipo` ADD FOREIGN KEY (`id_equipo`) REFERENCES `Equipo` (`id_equipo`);

ALTER TABLE `Equipo` ADD FOREIGN KEY (`id_categoria`) REFERENCES `Categoria` (`id_categoria`);

ALTER TABLE `equipo_entrenador` ADD FOREIGN KEY (`id_equipo`) REFERENCES `Equipo` (`id_equipo`);

ALTER TABLE `equipo_entrenador` ADD FOREIGN KEY (`id_entrenador`) REFERENCES `Entrenador` (`id_entrenador`);

ALTER TABLE `SolicitudInscripcion` ADD FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`);

ALTER TABLE `SolicitudInscripcion` ADD FOREIGN KEY (`id_jugador`) REFERENCES `Jugador` (`id_jugador`);

ALTER TABLE `Entrenador` ADD FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`);

ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_jugador`) REFERENCES `Jugador` (`id_jugador`);

ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`);

ALTER TABLE `Convocatoria` ADD FOREIGN KEY (`id_equipo`) REFERENCES `Equipo` (`id_equipo`);

ALTER TABLE `convocatoria_jugador` ADD FOREIGN KEY (`id_convocatoria`) REFERENCES `Convocatoria` (`id_convocatoria`);

ALTER TABLE `convocatoria_jugador` ADD FOREIGN KEY (`id_jugador`) REFERENCES `Jugador` (`id_jugador`);

ALTER TABLE `Jugador` ADD FOREIGN KEY (`fecha_alta`) REFERENCES `Jugador` (`fecha_baja`);
