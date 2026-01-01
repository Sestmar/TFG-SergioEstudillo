import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  // --- USUARIOS ---
  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidatos`);
  }

  getAllActiveUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios-activos`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-usuario`, userData);
  }

  // 🔥 NUEVO: Eliminar Usuario
  deleteUser(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/usuario/${id}`);
  }

  assignTeam(idUsuario: number, idEquipo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar-equipo`, { idUsuario, idEquipo });
  }

  // --- EQUIPOS ---
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipos`);
  }

  createTeam(teamData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-equipo`, teamData);
  }

  // --- COMPETICIÓN ---
  createMatch(matchData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/crear-partido`, matchData);
  }
}