import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // ✅ Importado

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private apiUrl = environment.apiUrl; // ✅ Corregido

  constructor(private http: HttpClient) { }

  // --- MÉTODOS BÁSICOS ---
  createMatch(matchData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partidos`, matchData);
  }
  
  getMatchesByTeam(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/partidos/equipo/${teamId}`);
  }

  getMatchById(matchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/partidos/${matchId}`);
  }

  getLineup(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alineaciones/partido/${matchId}`);
  }

  getMatches(filters?: any): Observable<any[]> {
    if (filters && filters.teamId) {
        return this.getMatchesByTeam(filters.teamId);
    }
    return this.http.get<any[]>(`${this.apiUrl}/partidos`);
  }

  // --- MÉTODOS ENTRENADOR ---
  saveLineupOnly(actaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/alineaciones/guardar/${actaData.idPartido}`, actaData.estadisticas);
  }

  saveLineup(matchId: number, lineupData: any[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/alineaciones/guardar/${matchId}`, lineupData, { headers });
  }

  // --- MÉTODOS ADMIN ---
  closeMatchReport(actaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/cerrar-acta`, actaData);
  }
}