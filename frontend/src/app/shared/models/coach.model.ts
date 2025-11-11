/**
 * Modelo de Entrenador que extiende de Usuario
 * Representa a los cuerpos técnicos del club
 */
export interface Coach {
  id: number;
  usuario: User;
  especializacion: CoachSpecialization;
  certificaciones: string[];
  anosExperiencia: number;
  equipoActual?: Team;
  historialEquipos: CoachTeamHistory[];
  formacionAcademica?: string;
  biografia?: string;
  activo: boolean;
}

/**
 * Especializaciones de entrenador
 */
export type CoachSpecialization = 
  | 'FUTBOL_11'
  | 'FUTBOL_SALA'
  | 'PORTEROS'
  | 'PREPARADOR_FISICO'
  | 'PSICOLOGO_DEPORTIVO'
  | 'NUTRICIONISTA'
  | 'FISIOTERAPEUTA'
  | 'ANALISTA_TACTICO';

/**
 * Historial de equipos como entrenador
 */
export interface CoachTeamHistory {
  id: number;
  equipo: Team;
  fechaInicio: Date;
  fechaFin?: Date;
  titulosConseguidos: string[];
  partidosDirigidos: number;
  victorias: number;
  derrotas: number;
  empates: number;
}

/**
 * DTO para crear entrenador
 */
export interface CoachCreateDto {
  usuarioId: number;
  especializacion: CoachSpecialization;
  certificaciones: string[];
  anosExperiencia: number;
  formacionAcademica?: string;
  biografia?: string;
}