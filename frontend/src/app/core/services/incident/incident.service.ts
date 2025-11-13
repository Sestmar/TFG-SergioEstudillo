import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Incident } from 'src/app/shared/models/models'; // <-- Import corregido

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  constructor(private apiService: ApiService) {}

  // --- ¡ARREGLO! ---
  // La función debe devolver el tipo correcto que la API entrega
  getAllIncidents(params?: any): Observable<{ incidents: Incident[]; total: number }> {
    return this.apiService.get<{ incidents: Incident[]; total: number }>('incidencia', params);
  }

  getIncidentById(id: number): Observable<Incident> {
    return this.apiService.get<Incident>(`incidencia/${id}`);
  }

  createIncident(incidentData: any): Observable<Incident> {
    return this.apiService.post<Incident>('incidencia', incidentData);
  }

  updateIncident(id: number, incidentData: Partial<Incident>): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${id}`, incidentData);
  }

  addFollowUp(incidentId: number, followUpData: any): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${incidentId}/follow-up`, followUpData);
  }

  closeIncident(incidentId: number, resolucion: string): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${incidentId}/close`, { resolucion });
  }

  reopenIncident(incidentId: number, motivo: string): Observable<Incident> {
    return this.apiService.put<Incident>(`incidencia/${incidentId}/reopen`, { motivo });
  }

  // --- ¡ARREGLO! ---
  getOpenIncidents(): Observable<{ incidents: Incident[]; total: number }> {
    return this.getAllIncidents({ estado: 'ABIERTA' });
  }

  // --- ¡ARREGLO! ---
  getPlayerIncidents(playerId: number): Observable<{ incidents: Incident[]; total: number }> {
    return this.getAllIncidents({ jugadorAfectadoId: playerId });
  }
}