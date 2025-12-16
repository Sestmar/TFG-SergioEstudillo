import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Team, Category, Liga } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private apiService: ApiService) {}

  // --- MÉTODOS BÁSICOS EXISTENTES ---
  
  // Modificado para aceptar filtros opcionales (entrenadorId, etc)
  getTeams(filters: any = {}): Observable<any> { 
    // NOTA: Si tu backend devuelve array directo, úsalo así. 
    // Si devuelve paginación, ajusta el tipo de retorno.
    // Aquí asumimos que pasamos query params.
    let params = '';
    if (Object.keys(filters).length > 0) {
      const query = new URLSearchParams(filters).toString();
      params = `?${query}`;
    }
    return this.apiService.get<any>(`equipos${params}`);
  }

  updateTeam(id: number, teamData: Partial<Team>): Observable<Team> {
    return this.apiService.put<Team>(`equipos/${id}`, teamData);
  }

  deactivateTeam(id: number): Observable<void> {
    return this.apiService.put<void>(`equipos/${id}/deactivate`, {});
  }
  
  activateTeam(id: number): Observable<void> {
    return this.apiService.put<void>(`equipos/${id}/activate`, {});
  }
  
  assignCoach(teamId: number, coachId: number, isAssistant: boolean): Observable<Team> {
    return this.apiService.put<Team>(`equipos/${teamId}/coach`, {
      coachId,
      isAssistant
    });
  }

  // --- ¡NUEVOS MÉTODOS QUE FALTABAN! ---

  getTeamById(id: number): Observable<Team> {
    return this.apiService.get<Team>(`equipos/${id}`);
  }

  // Si no tienes backend para esto, devuelve un array vacío o mock
  getTeamStandings(): Observable<any[]> {
    // return this.apiService.get<any[]>('standings'); // Descomenta cuando tengas API
    return new Observable(observer => {
      observer.next([]); // Mock vacío para que no falle el dashboard
      observer.complete();
    });
  }
}