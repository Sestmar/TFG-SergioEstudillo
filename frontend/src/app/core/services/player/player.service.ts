import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

// ¡ARREGLO! Importamos todo desde el nuevo archivo maestro de modelos
import { Player, PlayerCreateDto, PlayerPosition } from 'src/app/shared/models/models'; 

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private apiService: ApiService) {}

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

  getPlayerById(id: number): Observable<Player> {
    return this.apiService.get<Player>(`jugadores/${id}`);
  }

  createPlayer(playerData: PlayerCreateDto): Observable<Player> {
    return this.apiService.post<Player>('jugadores', playerData);
  }

  // (Esta llamada 'put' ahora funciona gracias al Arreglo 1)
  updatePlayer(id: number, playerData: Partial<Player>): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${id}`, playerData);
  }

  // (Esta llamada 'put' ahora funciona gracias al Arreglo 1)
  assignToTeam(playerId: number, teamId: number, dorsal?: number): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${playerId}/team`, {
      teamId,
      dorsal
    });
  }

  updateAvailability(playerId: number, disponible: boolean): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${playerId}/availability`, {
      disponible
    });
  }

  reportInjury(playerId: number, lesionado: boolean, descripcion?: string): Observable<Player> {
    return this.apiService.put<Player>(`jugadores/${playerId}/injury`, {
      lesionado,
      descripcion
    });
  }
  
  getPlayerStats(playerId: number): Observable<any> {
    return this.apiService.get<any>(`jugadores/${playerId}/stats`);
  }

  getPlayerHistory(playerId: number): Observable<any> {
    return this.apiService.get<any>(`jugadores/${playerId}/history`);
  }

  searchPlayers(term: string, params?: { page?: number; size?: number }): Observable<{ players: Player[]; total: number }> {
    return this.apiService.get<{ players: Player[]; total: number }>('jugadores/search', {
      term,
      ...params
    });
  }

  getAvailablePlayers(teamId?: number): Observable<Player[]> {
    return this.apiService.get<Player[]>('jugadores/available', {
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