/**
 * Modelo de Incidencia según API REST
 * Representa incidencias, lesiones y eventos adversos
 */
export interface Incident {
  id: number;
  tipo: IncidentType;
  gravedad: IncidentSeverity;
  titulo: string;
  descripcion: string;
  jugadorAfectado?: Player;
  entrenadorReporta: Coach;
  equipo: Team;
  convocatoria?: Convocation;
  fechaOcurrencia: Date;
  lugar: string;
  testigo?: string;
  accionesTomadas: string[];
  recomendaciones?: string;
  estado: IncidentStatus;
  seguimiento: IncidentFollowUp[];
  documentos: IncidentDocument[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipos de incidencia
 */
export type IncidentType = 
  | 'LESION'
  | 'ACCIDENTE'
  | 'INCIDENTE_DISCIPLINARIO'
  | 'PROBLEMA_MEDICO'
  | 'EQUIPAMIENTO_DAÑADO'
  | 'CLIMA_ADVERSO'
  | 'OTRO';

/**
 * Niveles de gravedad
 */
export type IncidentSeverity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO';

/**
 * Estados de incidencia
 */
export type IncidentStatus = 'ABIERTA' | 'EN_SEGUIMIENTO' | 'RESUELTA' | 'CERRADA';

/**
 * Seguimiento de incidencia
 */
export interface IncidentFollowUp {
  id: number;
  fecha: Date;
  descripcion: string;
  profesional?: string;
  accionesRealizadas: string[];
  estadoPaciente?: string;
  proximaRevision?: Date;
}

/**
 * Documentos relacionados con la incidencia
 */
export interface IncidentDocument {
  id: number;
  tipo: IncidentDocumentType;
  nombre: string;
  url: string;
  fecha: Date;
  profesional?: string;
}

/**
 * Tipos de documentos de incidencia
 */
export type IncidentDocumentType = 
  | 'INFORME_MEDICO'
  | 'FOTOGRAFIA'
  | 'VIDEO'
  | 'RECETA_MEDICA'
  | 'INFORME_FISIOTERAPIA'
  | 'PARTE_MEDICO';

/**
 * DTO para crear incidencia
 */
export interface IncidentCreateDto {
  tipo: IncidentType;
  gravedad: IncidentSeverity;
  titulo: string;
  descripcion: string;
  jugadorAfectadoId?: number;
  equipoId: number;
  convocatoriaId?: number;
  fechaOcurrencia: Date;
  lugar: string;
  testigo?: string;
  accionesTomadas: string[];
  recomendaciones?: string;
}