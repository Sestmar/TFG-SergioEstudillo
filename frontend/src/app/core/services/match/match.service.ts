import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Importamos 'of' por seguridad

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  // Asegúrate de que este puerto coincida con tu backend (8080)
  private apiUrl = 'http://localhost:8080/api/partidos'; 

  constructor(private http: HttpClient) { }

  // ==========================================
  // 🆕 MÉTODOS PARA EL ENTRENADOR (NUEVOS)
  // ==========================================

  // 1. Crear Partido
  createMatch(matchData: any): Observable<any> {
    return this.http.post(this.apiUrl, matchData);
  }

  // 2. Obtener partidos de un equipo
  getMatchesByTeam(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipo/${teamId}`);
  }

  // 3. Obtener un partido por ID
  getMatchById(matchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${matchId}`);
  }

  // ==========================================
  // 🩹 MÉTODO DE COMPATIBILIDAD (CORRECCIÓN ERROR)
  // ==========================================
  
  // Este es el método que busca tu UserDashboard.
  // Lo añadimos para que deje de dar error de compilación.
  getMatches(filters?: any): Observable<any[]> {
    // Si el filtro antiguo tenía un teamId, redirigimos a la función nueva
    if (filters && filters.teamId) {
        return this.getMatchesByTeam(filters.teamId);
    }
    
    // Si no, hacemos una petición genérica o devolvemos vacío para no romper nada
    // Si tu backend soporta GET /api/partidos (listar todos), esto funcionará.
    return this.http.get<any[]>(this.apiUrl);
  }
}