import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  // Ajusta el puerto si es necesario
  private apiUrl = 'http://localhost:8080/api/entrenadores';

  constructor(private http: HttpClient) { }

  // 1. Obtener datos del dashboard (Equipo + Rol)
  // Llama al endpoint "Inteligente" que acabamos de crear en el backend
  getDashboardData(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuario/${userId}/equipo`);
  }

  // 2. Obtener datos del perfil completo (Para la pantalla de "Mi Perfil")
  getProfile(coachId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${coachId}`);
  }

  // 3. Actualizar perfil (Para guardar cambios)
  updateProfile(coachId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${coachId}`, data);
  }

  // 4. Llamada al endpoint de estadisticas
  getTeamStats(coachId: number) {
    return this.http.get(`${this.apiUrl}/${coachId}/estadisticas-equipo`);
}
}