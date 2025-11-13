import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
// ¡ARREGLO! Importamos desde 'models.ts'
import { Team, Category, Liga } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private apiService: ApiService) {}

  getTeams(): Observable<Team[]> {
    return this.apiService.get<Team[]>('equipos');
  }
  
  // (Asumo que el resto de tu servicio es así)
  
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
}