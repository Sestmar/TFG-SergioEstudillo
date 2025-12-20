import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

// Importamos modelos desde la ruta segura
import { Player, PlayerCreateDto, PlayerPosition } from 'src/app/shared/models/models'; 

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private apiService: ApiService) {}

  getPlayers(params?: { 
    equipoId?: number; 
    usuarioId?: number;
    posicion?: PlayerPosition; 
    disponible?: boolean;
    lesionado?: boolean;
    page?: number;
    size?: number;
  }): Observable<{ players: Player[]; total: number } | any> { 
    return this.apiService.get<any>('/jugadores', params);
  }

  getAllPlayers(params?: any) {
    return this.getPlayers(params);
  }

  getPlayerById(id: number): Observable<Player> {
    return this.apiService.get<Player>(`/jugadores/${id}`);
  }

  createPlayer(playerData: PlayerCreateDto): Observable<Player> {
    return this.apiService.post<Player>('/jugadores', playerData);
  }

  updatePlayer(id: number, playerData: Partial<Player>): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${id}`, playerData);
  }

  assignToTeam(playerId: number, teamId: number, dorsal?: number): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${playerId}/team`, {
      teamId,
      dorsal
    });
  }

  updateAvailability(playerId: number, disponible: boolean): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${playerId}/availability`, {
      disponible
    });
  }

  reportInjury(playerId: number, lesionado: boolean, descripcion?: string): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${playerId}/injury`, {
      lesionado,
      descripcion
    });
  }
  
  getStats(playerId: number): Observable<any> {
    return this.apiService.get<any>(`/jugadores/${playerId}/stats`);
  }

  // ✅ Este es el método que usa tu dashboard ahora
  getPlayerStats(playerId: number): Observable<any> {
    return this.getStats(playerId);
  }

  getPlayerHistory(playerId: number): Observable<any> {
    return this.apiService.get<any>(`/jugadores/${playerId}/history`);
  }

  searchPlayers(term: string, params?: { page?: number; size?: number }): Observable<{ players: Player[]; total: number }> {
    return this.apiService.get<{ players: Player[]; total: number }>('/jugadores/search', {
      term,
      ...params
    });
  }

  getAvailablePlayers(teamId?: number): Observable<Player[]> {
    return this.apiService.get<Player[]>('/jugadores/available', {
      teamId
    });
  }

  getPlayerPositions(): PlayerPosition[] {
    return [
      'PORTERO', 'DEFENSA_CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO',
      'MEDIOCENTRO_DEFENSIVO', 'MEDIOCENTRO_ORGANIZADOR', 'MEDIOCENTRO_OFFENSIVO',
      'EXTREMO_DERECHO', 'EXTREMO_IZQUIERDO', 'DELANTERO_CENTRO', 'SEGUNDO_DELANTERO'
    ];
  }
}