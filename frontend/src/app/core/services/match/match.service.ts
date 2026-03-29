import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Partido, LineupSlotDto, CloseMatchPayload } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // --- MÉTODOS BÁSICOS ---
  createMatch(matchData: Partial<Partido>): Observable<Partido> {
    return this.http.post<Partido>(`${this.apiUrl}/partidos`, matchData);
  }

  getMatchesByTeam(teamId: number): Observable<Partido[]> {
    return this.http.get<Partido[]>(`${this.apiUrl}/partidos/equipo/${teamId}`);
  }

  getMatchById(matchId: number): Observable<Partido> {
    return this.http.get<Partido>(`${this.apiUrl}/partidos/${matchId}`);
  }

  getLineup(matchId: number): Observable<LineupSlotDto[]> {
    return this.http.get<LineupSlotDto[]>(`${this.apiUrl}/alineaciones/partido/${matchId}`);
  }

  getMatches(filters?: { teamId?: number }): Observable<Partido[]> {
    if (filters && filters.teamId) {
      return this.getMatchesByTeam(filters.teamId);
    }
    return this.http.get<Partido[]>(`${this.apiUrl}/partidos`);
  }

  // --- MÉTODOS ENTRENADOR ---
  saveLineupOnly(actaData: CloseMatchPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/alineaciones/guardar/${actaData.idPartido}`, actaData.estadisticas);
  }

  saveLineup(matchId: number, lineupData: LineupSlotDto[]): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<void>(`${this.apiUrl}/alineaciones/guardar/${matchId}`, lineupData, { headers });
  }

  // --- MÉTODOS ADMIN ---
  closeMatchReport(actaData: CloseMatchPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/cerrar-acta`, actaData);
  }
}