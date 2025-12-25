import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  // --- JUGADORES ---
  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidatos`);
  }

  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipos`);
  }

  assignTeam(idUsuario: number, idEquipo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar-equipo`, { idUsuario, idEquipo });
  }

  // --- STAFF TÉCNICO ---
  getAvailableCoaches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/entrenadores-libres`);
  }

  // 🔥 ACTUALIZADO: Acepta parámetro Rol
  assignCoach(idUsuario: number, idEquipo: number, rol: string = 'Entrenador Principal'): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar-mister`, { idUsuario, idEquipo, rol });
  }
}