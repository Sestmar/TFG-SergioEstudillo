import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { Team, Category, Liga } from '@shared/models';

/**
 * Servicio para gestión de equipos
 * Maneja operaciones CRUD relacionadas con equipos
 */
@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todos los equipos
   */
  getAllTeams(params?: { 
    categoriaId?: number; 
    ligaId?: number; 
    activo?: boolean;
    page?: number;
    size?: number;
  }): Observable<{ teams: Team[]; total: number }> {
    return this.apiService.get<{ teams: Team[]; total: number }>('equipos', params);
  }

  /**
   * Obtiene un equipo por ID
   */
  getTeamById(id: number): Observable<Team> {
    return this.apiService.get<Team>(`equipos/${id}`);
  }

  /**
   * Crea un nuevo equipo
   */
  createTeam(teamData: Partial<Team>): Observable<Team> {
    return this.apiService.post<Team>('equipos', teamData);
  }

  /**
   * Actualiza un equipo
   */
  updateTeam(id: number, teamData: Partial<Team>): Observable<Team> {
    return this.apiService.put<Team>(`equipos/${id}`, teamData);
  }

  /**
   * Desactiva un equipo
   */
  deactivateTeam(id: number): Observable<void> {
    return this.apiService.put<void>(`equipos/${id}/deactivate`, {});
  }

  /**
   * Reactiva un equipo
   */
  activateTeam(id: number): Observable<void> {
    return this.apiService.put<void>(`equipos/${id}/activate`, {});
  }

  /**
   * Obtiene todas las categorías
   */
  getAllCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>('categorias');
  }

  /**
   * Obtiene una categoría por ID
   */
  getCategoryById(id: number): Observable<Category> {
    return this.apiService.get<Category>(`categorias/${id}`);
  }

  /**
   * Obtiene todas las ligas
   */
  getAllLigas(): Observable<Liga[]> {
    return this.apiService.get<Liga[]>('ligas');
  }

  /**
   * Obtiene una liga por ID
   */
  getLigaById(id: number): Observable<Liga> {
    return this.apiService.get<Liga>(`ligas/${id}`);
  }

  /**
   * Asigna un entrenador a un equipo
   */
  assignCoach(teamId: number, coachId: number, isAssistant: boolean = false): Observable<Team> {
    return this.apiService.put<Team>(`equipos/${teamId}/coach`, {
      coachId,
      isAssistant
    });
  }

  /**
   * Obtiene los jugadores de un equipo
   */
  getTeamPlayers(teamId: number): Observable<any> {
    return this.apiService.get<any>(`equipos/${teamId}/jugadores`);
  }

  /**
   * Obtiene las estadísticas de un equipo
   */
  getTeamStats(teamId: number): Observable<any> {
    return this.apiService.get<any>(`equipos/${teamId}/stats`);
  }

  /**
   * Busca equipos por término
   */
  searchTeams(term: string, params?: { page?: number; size?: number }): Observable<{ teams: Team[]; total: number }> {
    return this.apiService.get<{ teams: Team[]; total: number }>('equipos/search', {
      term,
      ...params
    });
  }

  /**
   * Obtiene equipos destacados
   */
  getFeaturedTeams(): Observable<Team[]> {
    return this.apiService.get<Team[]>('equipos/featured');
  }
}