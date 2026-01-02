import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private apiUrl = 'http://localhost:8080/api'; 

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
  
  // Guardar alineación (El entrenador NO finaliza, solo guarda)
  saveLineupOnly(actaData: any): Observable<any> {
    // Usamos el endpoint de alineaciones normal
    return this.http.post(`${this.apiUrl}/alineaciones/guardar/${actaData.idPartido}`, actaData.estadisticas);
  }

  // Legacy (por si acaso)
  saveLineup(matchId: number, lineupData: any[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/alineaciones/guardar/${matchId}`, lineupData, { headers });
  }

  // --- MÉTODOS ADMIN ---

  // 🔥 CERRAR ACTA (Exclusivo Admin: Pone resultado y estado FINALIZADO)
  closeMatchReport(actaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/cerrar-acta`, actaData);
  }
}