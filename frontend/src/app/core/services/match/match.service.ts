import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // ✅ Importar HttpHeaders
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private apiUrl = 'http://localhost:8080/api'; 

  constructor(private http: HttpClient) { }

  // ==========================================
  // ⚽ GESTIÓN DE PARTIDOS
  // ==========================================

  createMatch(matchData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partidos`, matchData);
  }
  
  getMatchesByTeam(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/partidos/equipo/${teamId}`);
  }

  getMatchById(matchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/partidos/${matchId}`);
  }

  // ==========================================
  // 📋 GESTIÓN DE ALINEACIONES (PIZARRA)
  // ==========================================

  getLineup(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alineaciones/partido/${matchId}`);
  }

  // ✅ MÉTODO MODIFICADO PARA EVITAR ERROR 400
  saveLineup(lineupData: any[]): Observable<any> {
    
    // Forzamos la cabecera Content-Type a application/json
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enviamos la petición con las cabeceras explícitas
    return this.http.post(
      `${this.apiUrl}/alineaciones/guardar`, 
      lineupData, 
      { headers: headers }
    );
  }
  
  // ==========================================
  // 🔄 COMPATIBILIDAD (User Dashboard)
  // ==========================================
  getMatches(filters?: any): Observable<any[]> {
    if (filters && filters.teamId) {
        return this.getMatchesByTeam(filters.teamId);
    }
    return this.http.get<any[]>(`${this.apiUrl}/partidos`);
  }
}