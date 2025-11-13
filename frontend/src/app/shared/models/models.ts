// Este archivo único define todas las interfaces y enums
// Esto soluciona todos los errores "Cannot find name '...'"

// --- ENUMS (Tipos) ---

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

export type IncidentType = 'LESION' | 'SANCION' | 'BLOQUEO' | 'OTRO';
export type RequestStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';
export type ConvocationType = 'ENTRENAMIENTO' | 'PARTIDO' | 'AMISTOSO';
export type ConvocationStatus = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA'; // Lo pedía tu log

// --- INTERFACES PRINCIPALES ---

export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
  roles: string[];
}
// DTOs de User
export interface UserRegisterDto {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}
export interface UserUpdateDto {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
}

export interface Team {
  id: number;
  nombre: string;
  categoria: Category; // Arreglado
  liga: Liga; // Arreglado
  entrenadorPrincipal?: Coach;
  entrenadorAsistente?: Coach;
  jugadores: Player[];
  activo: boolean;
}
// Interfaces de Team
export interface Category {
  id: number;
  nombre: string;
}
export interface Liga {
  id: number;
  nombre: string;
}

export interface Player {
  id: number;
  usuario: User;
  equipoActual?: Team;
  posicionPrimaria: PlayerPosition;
  posicionSecundaria?: PlayerPosition;
  dorsal?: number;
  activo: boolean;
  lesionado: boolean;
}
// DTOs de Player
export interface PlayerCreateDto {
  userId: number;
  posicionPrimaria: PlayerPosition;
  // ... más campos
}

export interface Coach {
  id: number;
  usuario: User;
  equipoActual?: Team;
  licencia: string;
}

export interface Convocation {
  id: number;
  equipo: Team;
  titulo: string;
  descripcion?: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  lugar: string;
  tipo: ConvocationType;
  entrenadorPrincipal: Coach;
  jugadoresConvocados: { jugador: Player, estado: ConvocationStatus }[];
}
// DTOs de Convocation
export interface ConvocationCreateDto {
  equipoId: number;
  titulo: string;
  // ... más campos
}
export interface UpdateAttendanceDto {
  convocationId: number;
  playerId: number;
  status: ConvocationStatus;
}


export interface Incident {
  id: number;
  jugadorAfectado?: Player;
  entrenadorReporta: Coach;
  equipo: Team;
  convocatoria?: Convocation;
  tipo: IncidentType;
  descripcion: string;
  fechaIncidente: string;
  estado: 'ABIERTA' | 'CERRADA';
}

export interface InscriptionRequest {
  id: number;
  usuario: User;
  estado: RequestStatus;
  fechaSolicitud: string;
  administradorRespuesta?: User;
  datosJugador?: {
    posicionPreferida: PlayerPosition;
    posicionSecundaria?: PlayerPosition;
  };
  mensaje?: string;
  motivoRechazo?: string;
}