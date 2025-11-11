import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Team } from '@shared/models';
import { TeamService } from '../team/team.service';

/**
 * Servicio de estado para gestión centralizada de datos de equipos
 */
@Injectable({
  providedIn: 'root'
})
export class TeamStateService {
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsSubject.asObservable();

  private currentTeamSubject = new BehaviorSubject<Team | null>(null);
  public currentTeam$ = this.currentTeamSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private teamService: TeamService) {}

  /**
   * Carga todos los equipos
   */
  loadAllTeams(params?: { 
    categoriaId?: number; 
    ligaId?: number; 
    activo?: boolean;
  }): Observable<{ teams: Team[]; total: number }> {
    this.loadingSubject.next(true);
    
    return this.teamService.getAllTeams(params).pipe(
      map(response => {
        this.teamsSubject.next(response.teams);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
        return response;
      })
    );
  }

  /**
   * Carga un equipo específico
   */
  loadTeam(id: number): Observable<Team> {
    this.loadingSubject.next(true);
    
    return this.teamService.getTeamById(id).pipe(
      map(team => {
        this.currentTeamSubject.next(team);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
        return team;
      })
    );
  }

  /**
   * Establece el equipo actual
   */
  setCurrentTeam(team: Team | null): void {
    this.currentTeamSubject.next(team);
  }

  /**
   * Obtiene el equipo actual
   */
  getCurrentTeam(): Team | null {
    return this.currentTeamSubject.value;
  }

  /**
   * Obtiene todos los equipos
   */
  getTeams(): Team[] {
    return this.teamsSubject.value;
  }

  /**
   * Actualiza un equipo en la lista
   */
  updateTeamInList(updatedTeam: Team): void {
    const teams = this.teamsSubject.value.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    );
    this.teamsSubject.next(teams);
  }

  /**
   * Añade un nuevo equipo a la lista
   */
  addTeamToList(newTeam: Team): void {
    const teams = [...this.teamsSubject.value, newTeam];
    this.teamsSubject.next(teams);
  }

  /**
   * Elimina un equipo de la lista
   */
  removeTeamFromList(teamId: number): void {
    const teams = this.teamsSubject.value.filter(team => team.id !== teamId);
    this.teamsSubject.next(teams);
  }

  /**
   * Obtiene equipos destacados
   */
  getFeaturedTeams(): Observable<Team[]> {
    return this.teamService.getFeaturedTeams().pipe(
      map(teams => {
        this.teamsSubject.next(teams);
        return teams;
      })
    );
  }

  /**
   * Busca equipos por término
   */
  searchTeams(term: string): Observable<Team[]> {
    return this.teamService.searchTeams(term).pipe(
      map(response => response.teams)
    );
  }

  /**
   * Limpia el estado de equipos
   */
  clearTeamState(): void {
    this.teamsSubject.next([]);
    this.currentTeamSubject.next(null);
    this.errorSubject.next(null);
  }

  /**
   * Establece un error
   */
  setError(error: string): void {
    this.errorSubject.next(error);
    this.loadingSubject.next(false);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}