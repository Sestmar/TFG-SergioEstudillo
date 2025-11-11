import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { 
  Incident, 
  IncidentCreateDto, 
  IncidentType, 
  IncidentSeverity,
  IncidentStatus 
} from '@shared/models';

/**
 * Servicio para gestión de incidencias
 * Maneja operaciones CRUD relacionadas con incidencias
 */
@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  constructor(private apiService: ApiService) {}

  /**
   * Crea una nueva incidencia
   */
  createIncident(incidentData: IncidentCreateDto): Observable<Incident> {
    return this.apiService.post<Incident>('incidencia', incidentData);
  }

  /**
   * Obtiene todas las incidencias
   */
  getAllIncidents(params?: { 
    tipo?: IncidentType; 
    gravedad?: IncidentSeverity;
    estado?: IncidentStatus;
    equipoId?: number;
    jugadorId?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
    page?: number;
    size?: number;
  }): Observable<{ incidents: Incident[]; total: number }> {
    return this.apiService.get<{ incidents: Incident[]; total: number }>('incidencia', params);
  }

  /**
   * Obtiene una incidencia por ID
   */
  getIncidentById(id: number): Observable<Incident> {
    return this.apiService.get<Incident>(`incidencia/${id}`);
  }

  /**
   * Actualiza una incidencia
   */
  updateIncident(id: number, incidentData: Partial<Incident>): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${id}`, incidentData);
  }

  /**
   * Añade seguimiento a una incidencia
   */
  addFollowUp(incidentId: number, followUpData: any): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${incidentId}/follow-up`, followUpData);
  }

  /**
   * Cierra una incidencia
   */
  closeIncident(incidentId: number, resolucion: string): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${incidentId}/close`, {
      resolucion
    });
  }

  /**
   * Reabre una incidencia cerrada
   */
  reopenIncident(incidentId: number, motivo: string): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${incidentId}/reopen`, {
      motivo
    });
  }

  /**
   * Obtiene las incidencias de un equipo
   */
  getTeamIncidents(teamId: number, params?: { 
    tipo?: IncidentType;
    estado?: IncidentStatus;
  }): Observable<Incident[]> {
    return this.apiService.get<Incident[]>(`incidencia/equipo/${teamId}`, params);
  }

  /**
   * Obtiene las incidencias de un jugador
   */
  getPlayerIncidents(playerId: number): Observable<Incident[]> {
    return this.apiService.get<Incident[]>(`incidencia/jugador/${playerId}`);
  }

  /**
   * Obtiene las incidencias abiertas
   */
  getOpenIncidents(): Observable<Incident[]> {
    return this.getAllIncidents({ estado: 'ABIERTA' });
  }

  /**
   * Obtiene las incidencias graves o críticas
   */
  getCriticalIncidents(): Observable<Incident[]> {
    return this.getAllIncidents({ 
      gravedad: 'GRAVE',
      estado: 'ABIERTA'
    });
  }

  /**
   * Obtiene las estadísticas de incidencias
   */
  getIncidentStats(): Observable<{
    totalIncidents: number;
    openIncidents: number;
    incidentsByType: { [key: string]: number };
    incidentsBySeverity: { [key: string]: number };
    incidentsThisMonth: number;
  }> {
    return this.apiService.get<any>('incidencia/stats');
  }

  /**
   * Obtiene los tipos de incidencia
   */
  getIncidentTypes(): IncidentType[] {
    return [
      'LESION',
      'ACCIDENTE',
      'INCIDENTE_DISCIPLINARIO',
      'PROBLEMA_MEDICO',
      'EQUIPAMIENTO_DAÑADO',
      'CLIMA_ADVERSO',
      'OTRO'
    ];
  }

  /**
   * Obtiene los niveles de gravedad
   */
  getIncidentSeverities(): IncidentSeverity[] {
    return ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO'];
  }

  /**
   * Obtiene los estados de incidencia
   */
  getIncidentStatuses(): IncidentStatus[] {
    return ['ABIERTA', 'EN_SEGUIMIENTO', 'RESUELTA', 'CERRADA'];
  }
}