import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { Player, PlayerCreateDto, PlayerPosition } from '@shared/models';

/**
 * Servicio para gestión de jugadores
 * Maneja operaciones CRUD relacionadas con jugadores
 */
@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todos los jugadores
   */
  getAllPlayers(params?: { 
    equipoId?: number; 
    posicion?: PlayerPosition; 
    disponible?: boolean;
    lesionado?: boolean;
    page?: number;
    size?: number;
  }): Observable<{ players: Player[]; total: number }> {
    return this.apiService.get<{ players: Player[]; total: number }>('jugadores', params);
  }

  /**
   * Obtiene un jugador por ID
   */
  getPlayerById(id: number): Observable<Player> {
    return this.apiService.get<Player>(`jugadores/${id}`);
  }

  /**
   * Crea un nuevo jugador
   */
  createPlayer(playerData: PlayerCreateDto): Observable<Player> {
    return this.apiService.post<Player>('jugadores', playerData);
  }

  /**
   * Actualiza un jugador
   */
  updatePlayer(id: number, playerData: Partial<Player>): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${id}`, playerData);
  }

  /**
   * Asigna un jugador a un equipo
   */
  assignToTeam(playerId: number, teamId: number, dorsal?: number): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${playerId}/team`, {
      teamId,
      dorsal
    });
  }

  /**
   * Actualiza la disponibilidad de un jugador
   */
  updateAvailability(playerId: number, disponible: boolean): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${playerId}/availability`, {
      disponible
    });
  }

  /**
   * Reporta una lesión de un jugador
   */
  reportInjury(playerId: number, lesionado: boolean, descripcion?: string): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${playerId}/injury`, {
      lesionado,
      descripcion
    });
  }

  /**
   * Obtiene las estadísticas de un jugador
   */
  getPlayerStats(playerId: number): Observable<any> {
    return this.apiService.get<any>(`jugadores/${playerId}/stats`);
  }

  /**
   * Obtiene el historial de equipos de un jugador
   */
  getPlayerHistory(playerId: number): Observable<any> {
    return this.apiService.get<any>(`jugadores/${playerId}/history`);
  }

  /**
   * Busca jugadores por término
   */
  searchPlayers(term: string, params?: { page?: number; size?: number }): Observable<{ players: Player[]; total: number }> {
    return this.apiService.get<{ players: Player[]; total: number }>('jugadores/search', {
      term,
      ...params
    });
  }

  /**
   * Obtiene jugadores disponibles para convocatoria
   */
  getAvailablePlayers(teamId?: number): Observable<Player[]> {
    return this.apiService.get<Player[]>('jugadores/available', {
      teamId
    });
  }

  /**
   * Obtiene las posiciones disponibles
   */
  getPlayerPositions(): PlayerPosition[] {
    return [
      'PORTERO',
      'DEFENSA_CENTRAL',
      'LATERAL_DERECHO',
      'LATERAL_IZQUIERDO',
      'MEDIOCENTRO_DEFENSIVO',
      'MEDIOCENTRO_ORGANIZADOR',
      'MEDIOCENTRO_OFFENSIVO',
      'EXTREMO_DERECHO',
      'EXTREMO_IZQUIERDO',
      'DELANTERO_CENTRO',
      'SEGUNDO_DELANTERO'
    ];
  }
}