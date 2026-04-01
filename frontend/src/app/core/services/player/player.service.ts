import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Jugador, PlayerCreateDto, PlayerPosition, PlayerStats, EquipoResumen, PlayerHistory } from 'src/app/shared/models/models';

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
  }): Observable<Jugador[]> {
    return this.apiService.get<Jugador[]>('/jugadores', params);
  }

  getAllPlayers(params?: { equipoId?: number }): Observable<Jugador[]> {
    return this.getPlayers(params);
  }

  getPlayerById(id: number): Observable<Jugador> {
    return this.apiService.get<Jugador>(`/jugadores/${id}`);
  }

  getPlayerByUserId(userId: number): Observable<Jugador> {
    return this.apiService.get<Jugador>(`/jugadores/usuario/${userId}`);
  }

  getPlayerTeamByUserId(userId: number): Observable<EquipoResumen> {
    return this.apiService.get<EquipoResumen>(`/jugadores/usuario/${userId}/equipo`);
  }

  createPlayer(playerData: PlayerCreateDto): Observable<Jugador> {
    return this.apiService.post<Jugador>('/jugadores', playerData);
  }

  updatePlayer(id: number, playerData: Partial<Jugador>): Observable<Jugador> {
    return this.apiService.put<Jugador>(`/jugadores/${id}`, playerData);
  }

  assignToTeam(playerId: number, teamId: number, dorsal?: number): Observable<Jugador> {
    return this.apiService.put<Jugador>(`/jugadores/${playerId}/team`, { teamId, dorsal });
  }

  updateAvailability(playerId: number, disponible: boolean): Observable<Jugador> {
    return this.apiService.put<Jugador>(`/jugadores/${playerId}/availability`, { disponible });
  }

  reportInjury(playerId: number, lesionado: boolean, descripcion?: string): Observable<Jugador> {
    return this.apiService.put<Jugador>(`/jugadores/${playerId}/injury`, { lesionado, descripcion });
  }

  getStats(playerId: number): Observable<PlayerStats> {
    return this.apiService.get<PlayerStats>(`/jugadores/${playerId}/stats`);
  }

  getPlayerStats(playerId: number): Observable<PlayerStats> {
    return this.getStats(playerId);
  }

  getPlayerHistory(playerId: number): Observable<PlayerHistory> {
    return this.apiService.get<PlayerHistory>(`/jugadores/${playerId}/history`);
  }

  searchPlayers(term: string, params?: { page?: number; size?: number }): Observable<Jugador[]> {
    return this.apiService.get<Jugador[]>('/jugadores/search', { term, ...params });
  }

  getAvailablePlayers(teamId?: number): Observable<Jugador[]> {
    return this.apiService.get<Jugador[]>('/jugadores/available', { teamId });
  }

  getPlayerPositions(): PlayerPosition[] {
    return [
      'PORTERO', 'DEFENSA_CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO',
      'MEDIOCENTRO_DEFENSIVO', 'MEDIOCENTRO_ORGANIZADOR', 'MEDIOCENTRO_OFFENSIVO',
      'EXTREMO_DERECHO', 'EXTREMO_IZQUIERDO', 'DELANTERO_CENTRO', 'SEGUNDO_DELANTERO'
    ];
  }
}