import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private apiUrl = 'http://localhost:8080/api'; 

  constructor(private http: HttpClient) { }

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

  saveLineup(matchId: number, lineupData: any[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.apiUrl}/alineaciones/guardar/${matchId}`, 
      lineupData, 
      { headers: headers }
    );
  }
  
  getMatches(filters?: any): Observable<any[]> {
    if (filters && filters.teamId) {
        return this.getMatchesByTeam(filters.teamId);
    }
    return this.http.get<any[]>(`${this.apiUrl}/partidos`);
  }

  // ✅ CRÍTICO: Debe apuntar al endpoint nuevo que hace upsert
  closeMatchReport(actaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/alineaciones/cerrar`, actaData);
  }
}