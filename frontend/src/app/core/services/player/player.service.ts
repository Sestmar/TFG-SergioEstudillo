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

  // ✅ CORREGIDO: Añadida la barra '/' al principio ('/jugadores')
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

  // ✅ CORREGIDO: Añadida la barra '/'
  getPlayerById(id: number): Observable<Player> {
    return this.apiService.get<Player>(`/jugadores/${id}`);
  }

  // ✅ CORREGIDO: Añadida la barra '/'
  createPlayer(playerData: PlayerCreateDto): Observable<Player> {
    return this.apiService.post<Player>('/jugadores', playerData);
  }

  // ✅ CORREGIDO: Añadida la barra '/'
  updatePlayer(id: number, playerData: Partial<Player>): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${id}`, playerData);
  }

  // ✅ CORREGIDO: Añadida la barra '/'
  assignToTeam(playerId: number, teamId: number, dorsal?: number): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${playerId}/team`, {
      teamId,
      dorsal
    });
  }

  // ✅ CORREGIDO: Añadida la barra '/'
  updateAvailability(playerId: number, disponible: boolean): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${playerId}/availability`, {
      disponible
    });
  }

  // ✅ CORREGIDO: Añadida la barra '/'
  reportInjury(playerId: number, lesionado: boolean, descripcion?: string): Observable<Player> {
    return this.apiService.put<Player>(`/jugadores/${playerId}/injury`, {
      lesionado,
      descripcion
    });
  }
  
  // ✅ CORREGIDO: Añadida la barra '/'
  getStats(playerId: number): Observable<any> {
    return this.apiService.get<any>(`/jugadores/${playerId}/stats`);
  }

  getPlayerStats(playerId: number): Observable<any> {
    return this.getStats(playerId);
  }

  // ✅ CORREGIDO: Añadida la barra '/'
  getPlayerHistory(playerId: number): Observable<any> {
    return this.apiService.get<any>(`/jugadores/${playerId}/history`);
  }

  // ✅ CORREGIDO: Añadida la barra '/'
  searchPlayers(term: string, params?: { page?: number; size?: number }): Observable<{ players: Player[]; total: number }> {
    return this.apiService.get<{ players: Player[]; total: number }>('/jugadores/search', {
      term,
      ...params
    });
  }

  // ✅ CORREGIDO: Añadida la barra '/'
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