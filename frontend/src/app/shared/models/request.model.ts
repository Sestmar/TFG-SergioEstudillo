/**
 * Modelo de Solicitud de Inscripción según API REST
 * Representa las solicitudes para convertirse en jugador del club
 */
export interface InscriptionRequest {
  id: number;
  usuario: User;
  fechaSolicitud: Date;
  estado: RequestStatus;
  fechaRespuesta?: Date;
  administradorRespuesta?: User;
  mensajeSolicitud?: string;
  mensajeRespuesta?: string;
  documentosAdjuntos: RequestDocument[];
  datosJugador: PlayerRequestData;
  historialDeportivo: SportHistory[];
}

/**
 * Estados de solicitud
 */
export type RequestStatus = 'PENDIENTE' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

/**
 * Datos específicos del jugador en la solicitud
 */
export interface PlayerRequestData {
  posicionPreferida: PlayerPosition;
  posicionSecundaria?: PlayerPosition;
  altura?: number;
  peso?: number;
  pieDominante: 'IZQUIERDO' | 'DERECHO' | 'AMBIDIESTRO';
  anosExperiencia: number;
  nivelActual: SkillLevel;
  disponibilidad: boolean;
  lesionesActuales?: string;
  medicamentos?: string;
  alergias?: string;
  contactoEmergencia: EmergencyContact;
}

/**
 * Niveles de habilidad
 */
export type SkillLevel = 'PRINCIPIANTE' | 'AFICIONADO' | 'SEMI_PROFESIONAL' | 'PROFESIONAL';

/**
 * Contacto de emergencia
 */
export interface EmergencyContact {
  nombre: string;
  relacion: string;
  telefono: string;
  email?: string;
}

/**
 * Historial deportivo del solicitante
 */
export interface SportHistory {
  id: number;
  club: string;
  temporada: string;
  categoria: string;
  posicion: string;
  partidosJugados: number;
  golesAnotados: number;
  logros?: string[];
}

/**
 * Documentos adjuntos a la solicitud
 */
export interface RequestDocument {
  id: number;
  tipo: DocumentType;
  nombre: string;
  url: string;
  fechaSubida: Date;
}

/**
 * Tipos de documentos
 */
export type DocumentType = 'DNI' | 'FICHA_MEDICA' | 'CERTIFICADO_MEDICO' | 'AUTORIZACION_MENOR' | 'OTRO';

/**
 * DTO para crear solicitud de inscripción
 */
export interface InscriptionRequestCreateDto {
  usuarioId: number;
  mensajeSolicitud?: string;
  datosJugador: PlayerRequestData;
  historialDeportivo: SportHistory[];
}