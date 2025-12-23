// Este archivo único define todas las interfaces y enums
// Esto soluciona todos los errores "Cannot find name '...'"


// src/app/shared/models/models.ts

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
export type ConvocationStatus = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';

// =================================================================
// ===           INTERFACES RELACIONADAS CON AUTH                ===
// =================================================================

// --- INTERFAZ PRINCIPAL DE USUARIO ---
export interface User {
  idUsuario: number;
  username?: string; // Opcional, solemos usar email
  email: string;
  nombre: string;
  apellidos: string;
  activo?: boolean;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  roles?: string[]; // Opcional, a veces viene solo 'rol'
  passwordHash?: string; // No se suele enviar al frontend por seguridad
  rol: string;
  fechaAlta?: Date;
  telefono?: string;
  direccion?: string;
  equipoFavoritoId?: number;
  fotoUrl?: string; // ✅ NUEVO: Sincronizado con Backend NeonDB
}

// --- DTOS DE AUTENTICACIÓN ---
export interface UserLoginDto {
  email: string;
  password: string;
}

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
  direccion?: string;
  fotoUrl?: string; // ✅ Permite actualizar la foto
}

// --- RESPUESTA DE AUTENTICACIÓN ---
export interface AuthResponse {
  token: string;
  refreshToken?: string; // Opcional, backend v1 no lo envía aún
  user?: User; // Opcional, lo obtenemos tras el login si no viene
}

// --- PAYLOAD DEL TOKEN JWT ---
export interface JwtPayload {
  sub: string; // Suele ser el email
  username?: string;
  roles?: string[];
  exp: number;
  iat: number;
}

// =================================================================
// ===               RESTO DE INTERFACES                         ===
// =================================================================

export interface Team {
  id: number;
  nombre: string;
  categoria: Category;
  liga: Liga;
  entrenadorPrincipal?: Coach;
  entrenadorAsistente?: Coach;
  jugadores: Player[];
  activo: boolean;
  fotoUrl?: string; // ✅ NUEVO: Escudo del equipo
}

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
  fotoUrl?: string; // ✅ NUEVO: Foto específica de jugador
}

export interface PlayerCreateDto {
  userId: number;
  posicionPrimaria: PlayerPosition;
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

export interface ConvocationCreateDto {
  equipoId: number;
  titulo: string;
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

export interface Match {
  id: number;
  fechaHora: string;
  equipoLocalId: number;
  equipoVisitanteId: number;
  golesLocal?: number;
  golesVisitante?: number;
  resultado?: string; 
  estado: string;
  lugar: string;
  tipo: string;
}

export interface News {
  id: number;
  titulo: string;
  contenido: string;
  fechaPublicacion: string;
  imagenUrl?: string;
  autorId: number;
  categoria: string;
}

export interface PlayerStats {
  partidosJugados: number;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  minutosJugados: number;
}

export interface PlayerStats {
  partidosTotales: number;
  golesTotales: number;
  asistenciasTotales: number;
  minutosJugados: number;
}

export type UserRole = 'ADMIN' | 'ENTRENADOR' | 'JUGADOR' | 'PADRE';