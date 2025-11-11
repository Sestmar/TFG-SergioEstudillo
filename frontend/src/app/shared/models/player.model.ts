/**
 * Modelo de Jugador que extiende de Usuario
 * Representa a los jugadores del club
 */
export interface Player {
  id: number;
  usuario: User;
  equipoActual?: Team;
  dorsal?: number;
  posicion: PlayerPosition;
  altura?: number;
  peso?: number;
  pieDominante: 'IZQUIERDO' | 'DERECHO' | 'AMBIDIESTRO';
  fechaInscripcion: Date;
  historialEquipos: PlayerTeamHistory[];
  estadisticas?: PlayerStats;
  disponible: boolean;
  lesionado: boolean;
}

/**
 * Posiciones de juego
 */
export type PlayerPosition = 
  | 'PORTERO'
  | 'DEFENSA_CENTRAL'
  | 'LATERAL_DERECHO'
  | 'LATERAL_IZQUIERDO'
  | 'MEDIOCENTRO_DEFENSIVO'
  | 'MEDIOCENTRO_ORGANIZADOR'
  | 'MEDIOCENTRO_OFFENSIVO'
  | 'EXTREMO_DERECHO'
  | 'EXTREMO_IZQUIERDO'
  | 'DELANTERO_CENTRO'
  | 'SEGUNDO_DELANTERO';

/**
 * Historial de equipos del jugador
 */
export interface PlayerTeamHistory {
  id: number;
  equipo: Team;
  fechaInicio: Date;
  fechaFin?: Date;
  dorsal: number;
  partidosJugados: number;
  golesAnotados: number;
}

/**
 * Estadísticas del jugador
 */
export interface PlayerStats {
  temporadasJugadas: number;
  partidosTotales: number;
  golesTotales: number;
  asistenciasTotales: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  minutosJugados: number;
  valoracionMedia: number;
}

/**
 * DTO para crear jugador (tras aprobación de solicitud)
 */
export interface PlayerCreateDto {
  usuarioId: number;
  equipoId?: number;
  dorsal?: number;
  posicion: PlayerPosition;
  altura?: number;
  peso?: number;
  pieDominante: 'IZQUIERDO' | 'DERECHO' | 'AMBIDIESTRO';
}