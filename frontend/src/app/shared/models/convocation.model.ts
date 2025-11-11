/**
 * Modelo de Convocatoria según API REST
 * Representa las convocatorias para partidos y entrenamientos
 */
export interface Convocation {
  id: number;
  equipo: Team;
  tipo: ConvocationType;
  titulo: string;
  descripcion?: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  lugar: string;
  jugadoresConvocados: ConvokedPlayer[];
  entrenadorPrincipal: Coach;
  estado: ConvocationStatus;
  notasTacticas?: string;
  resultado?: MatchResult;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipos de convocatoria
 */
export type ConvocationType = 'PARTIDO_OFICIAL' | 'PARTIDO_AMISTOSO' | 'ENTRENAMIENTO' | 'CONCENTRACION';

/**
 * Estados de convocatoria
 */
export type ConvocationStatus = 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA' | 'SUSPENDIDA';

/**
 * Jugador convocado con su estado de asistencia
 */
export interface ConvokedPlayer {
  id: number;
  jugador: Player;
  convocatoria: Convocation;
  estadoAsistencia: AttendanceStatus;
  fechaConfirmacion?: Date;
  notas?: string;
  titular: boolean;
  minutosJugados?: number;
  goles?: number;
  asistencias?: number;
  tarjetasAmarillas?: number;
  tarjetasRojas?: number;
  valoracion?: number;
}

/**
 * Estados de asistencia del jugador
 */
export type AttendanceStatus = 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO' | 'AUSENTE' | 'LESIONADO';

/**
 * Resultado del partido
 */
export interface MatchResult {
  golesFavor: number;
  golesContra: number;
  resultado: 'VICTORIA' | 'DERROTA' | 'EMPATE';
  resumen?: string;
}

/**
 * DTO para crear convocatoria
 */
export interface ConvocationCreateDto {
  equipoId: number;
  tipo: ConvocationType;
  titulo: string;
  descripcion?: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  lugar: string;
  jugadoresIds: number[];
  notasTacticas?: string;
}

/**
 * DTO para actualizar estado de asistencia
 */
export interface UpdateAttendanceDto {
  convokedPlayerId: number;
  estadoAsistencia: AttendanceStatus;
  notas?: string;
}