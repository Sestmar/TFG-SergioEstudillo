import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Team } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private apiService: ApiService) {}

  // --- MÉTODOS DE LECTURA ---

  // Obtener lista de equipos (con filtros opcionales)
  getTeams(filters: any = {}): Observable<any> { 
    let params = '';
    if (Object.keys(filters).length > 0) {
      const query = new URLSearchParams(filters).toString();
      params = `?${query}`;
    }
    // ✅ FIX: Slash Rule (barra inicial)
    return this.apiService.get<any>(`/equipos${params}`);
  }

  // ✅ NUEVO: Obtener un equipo por su ID (Crucial para ver el nombre "Primer Equipo" en vez de "23")
  getTeamById(id: number): Observable<Team> {
    return this.apiService.get<Team>(`/equipos/${id}`);
  }

  // --- MÉTODOS DE GESTIÓN (ADMIN) ---

  updateTeam(id: number, teamData: Partial<Team>): Observable<Team> {
    return this.apiService.put<Team>(`/equipos/${id}`, teamData);
  }

  deactivateTeam(id: number): Observable<void> {
    return this.apiService.put<void>(`/equipos/${id}/deactivate`, {});
  }
  
  activateTeam(id: number): Observable<void> {
    return this.apiService.put<void>(`/equipos/${id}/activate`, {});
  }
  
  assignCoach(teamId: number, coachId: number, isAssistant: boolean): Observable<Team> {
    return this.apiService.put<Team>(`/equipos/${teamId}/coach`, {
      coachId,
      isAssistant
    });
  }

  // --- MÉTODOS DE ESTADÍSTICAS ---

  // Mock para clasificación (se implementará más adelante)
  getTeamStandings(): Observable<any[]> {
    return of([]); 
  }
}