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
  partidosJugados?: number;
  partidosTotales?: number;
  goles?: number;
  golesTotales?: number;
  asistencias?: number;
  asistenciasTotales?: number;
  tarjetasAmarillas?: number;
  tarjetasRojas?: number;
  minutosJugados?: number;
}

// ✅ ZONA PÚBLICA
export interface PublicTeam {
    idEquipo: number;
    nombre: string;
    categoria: string;
    fotoUrl: string;
    entrenadorNombre: string;
}

export interface PublicPlayer {
    idJugador: number;
    nombre: string;
    apellidos: string;
    nombreCompleto: string;
    posicion: string;
    dorsal: number;
    fotoUrl: string;
    goles: number;
    asistencias: number;
    estado?: string;
}

export type UserRole = 'ADMIN' | 'ENTRENADOR' | 'JUGADOR' | 'PADRE';

// =================================================================
// ===        BACKEND RESPONSE DTOs (shapes reales del API)       ===
// =================================================================

export type EstadoJugador = 'ACTIVO' | 'LESIONADO' | 'BAJA';
export type EstadoPartido = 'PENDIENTE' | 'FINALIZADO' | 'CANCELADO';
export type TipoEvento = 'PARTIDO' | 'TRAINING' | 'ENTRENAMIENTO';

export interface UsuarioResumen {
  id?: number;
  idUsuario?: number;
  nombre: string;
  apellidos: string;
  email?: string;
  fotoUrl?: string;
  rol?: string;
}

export interface EquipoResumen {
  id?: number;
  idEquipo?: number;
  nombre: string;
  fotoUrl?: string;
  categoria?: string;
}

export interface Jugador {
  id?: number;
  idJugador?: number;
  usuario: UsuarioResumen;
  posicion?: string;
  dorsal?: number;
  estado?: EstadoJugador;
  equipoPrincipal?: EquipoResumen | number;
  observaciones?: string;
  fechaNacimiento?: string;
  fechaAlta?: string;
}

export interface Partido {
  idPartido?: number;
  id?: number;
  rival?: string | null;
  lugar: string;
  fechaHora: string;
  tipo: TipoEvento;
  estado: EstadoPartido;
  golesFavor: number;
  golesContra: number;
  idEquipo?: number;
  equipo?: EquipoResumen;
  escudoRivalUrl?: string | null;
  competicion?: string;
  observaciones?: string;
}

export interface LineupSlotDto {
  idJugador?: number;
  jugador?: { id?: number; idJugador?: number };
  slotId?: string;
  esTitular?: boolean;
  esCapitan?: boolean;
  esLanzadorPenaltis?: boolean;
  esLanzadorFaltas?: boolean;
  goles?: number;
  asistencias?: number;
  minutos?: number;
  minutosJugados?: number;
  minutoEntrada?: number | null;
  minutoSalida?: number | null;
  tarjetaAmarilla?: number;
  tarjetaRoja?: number;
  nombre?: string;
  apellidos?: string;
  fotoUrl?: string;
  dorsal?: number;
  posicion?: string;
}

export interface CloseMatchPayload {
  idPartido: number;
  golesFavor: number;
  golesContra: number;
  estadisticas: LineupSlotDto[];
}

export interface AdminUserDto {
  id: number;
  nombre: string;
  apellidos: string;
  nombreCompleto?: string;
  email: string;
  telefono?: string;
  rol: string;
  fotoUrl?: string;
  fechaAlta?: string;
  equipoNombre?: string;
  equipoId?: number;
  // Jugador
  jugadorId?: number;
  dorsal?: number;
  posicion?: string;
  estado?: string;
  // Entrenador
  entrenadorId?: number;
  especialidad?: string;
  licencia?: string;
}

export interface AdminEquipoDto {
  idEquipo?: number;
  id?: number;
  nombre: string;
  categoria?: string;
  activo?: boolean;
  entrenador?: { usuario?: UsuarioResumen };
  entrenadorPrincipal?: { usuario?: UsuarioResumen };
  entrenadorNombre?: string;
  fotoUrl?: string;
}

export interface TeamDetailResponse {
  equipo: AdminEquipoDto;
  jugadores: Jugador[];
  staff: UsuarioResumen[];
}

export interface CoachDashboardResponse {
  equipo?: EquipoResumen;
  rol?: string;
  entrenadorId?: number;
}

export interface PlayerSeasonStat {
  idJugador?: number;
  nombre?: string;
  apellidos?: string;
  fotoUrl?: string;
  dorsal?: number;
  posicion?: string;
  goles?: number;
  asistencias?: number;
  minutos?: number;
  asistenciaPct?: number;
  golesTemporada?: number;
}

export interface TeamStatsResponse {
  jugadores: PlayerSeasonStat[];
}

export interface AsistenciaPayload {
  idEntrenamiento: number;
  asistencias: { idJugador: number; estado: string }[];
}

export interface AttendanceSavedDto {
  idJugador: number;
  estado: string;
}

export interface CoachProfileDto {
  idEntrenador?: number;
  especialidad?: string;
  licencia?: string;
  telefonoContacto?: string;
  fechaAlta?: string;
  usuario: UsuarioResumen;
}

export interface CoachProfileUpdateDto {
  idUsuario?: number;
  especialidad?: string;
  licencia?: string;
  telefonoContacto?: string;
  fechaAlta?: string;
}

export interface PlayerHistoryPartido {
  idPartido: number;
  fechaHora: string;
  rival: string | null;
  escudoRivalUrl: string | null;
  competicion: string | null;
  golesFavor: number;
  golesContra: number;
  estado: EstadoPartido;
  esTitular: boolean;
  golesJugador: number;
  asistenciasJugador: number;
  minutosJugados: number;
  minutoEntrada: number | null;
  minutoSalida: number | null;
  esCapitan: boolean;
  tarjetaAmarilla: number;
  tarjetaRoja: number;
}

export interface PlayerHistoryConvocatoria {
  idConvocatoria: number;
  fechaEvento: string;
  tipo: TipoEvento;
  observaciones: string | null;
}

export interface PlayerHistoryIncidencia {
  idIncidencia: number;
  fechaReporte: string;
  tipo: IncidentType;
  estado: string;
  descripcion: string;
}

export interface PlayerHistory {
  idJugador: number;
  nombreCompleto: string;
  posicion: string;
  dorsal: number;
  estado: EstadoJugador;
  equipoActual: string;
  partidosTotales: number;
  minutosJugados: number;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  partidos: PlayerHistoryPartido[];
  convocatorias: PlayerHistoryConvocatoria[];
  incidencias: PlayerHistoryIncidencia[];
}

export interface MatchSummary {
  idPartido: number;
  rival: string;
  escudoRivalUrl: string | null;
  fechaHora: string;
  golesFavor: number;
  golesContra: number;
  resultado: string;       // "V" | "E" | "D"
  puntos: number;          // 3 | 1 | 0
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  asistenciasTotales: number;
}

export interface SeasonStats {
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  puntos: number;
  puntosObjetivo: number | null;
  categoriaNombre: string | null;
  racha: string[];
  // Season Intelligence (opcionales: ausentes en contextos legacy)
  historialCompleto?: MatchSummary[];
  cleanSheets?: number;
  promedioGolesFavor?: number;
  promedioGolesContra?: number;
  mayorRachaVictorias?: number;
  tarjetasAmarillasTotal?: number;
  tarjetasRojasTotal?: number;
  asistenciasTotal?: number;
}

// =================================================================
// ===         DTOs DE CHAT                                       ===
// =================================================================

/** Payload para enviar un mensaje por STOMP (/app/chat.enviar) */
export interface EnviarMensajeDto {
  contenido: string;
  equipoId?: number | null;
  destinatarioId?: number | null;
}

/** Mensaje recibido del servidor (respuesta de historial y broadcast STOMP) */
export interface MensajeDto {
  id: number;
  remitenteId: number;
  remitenteNombre: string;
  remitenteApellidos: string;
  remitenteFotoUrl: string | null;
  equipoId: number | null;
  destinatarioId: number | null;
  contenido: string;
  fechaHora: string;
  leido: boolean;
}

/** Respuesta de GET /api/chat/no-leidos */
export interface NoLeidosDto {
  count: number;
}