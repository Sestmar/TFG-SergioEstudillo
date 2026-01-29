import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service'; // 👈 IMPORTANTE: Usamos tu servicio central

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  // Ya no hace falta la variable apiUrl hardcodeada
  // El ApiService ya sabe que es https://backend-tfg.../api

  constructor(private apiService: ApiService) { } // 👈 Inyectamos ApiService

  // 1. Obtener datos del dashboard (Equipo + Rol)
  getDashboardData(userId: number): Observable<any> {
    // Antes: http://localhost:8080/api/entrenadores/usuario/...
    // Ahora: /entrenadores/usuario/... (ApiService pone el resto)
    return this.apiService.get<any>(`/entrenadores/usuario/${userId}/equipo`);
  }

  // 2. Obtener datos del perfil completo
  getProfile(coachId: number): Observable<any> {
    return this.apiService.get<any>(`/entrenadores/${coachId}`);
  }

  // 3. Actualizar perfil
  updateProfile(coachId: number, data: any): Observable<any> {
    return this.apiService.put<any>(`/entrenadores/${coachId}`, data);
  }

  // 4. Llamada al endpoint de estadisticas
  getTeamStats(coachId: number) {
    return this.apiService.get<any>(`/entrenadores/${coachId}/estadisticas-equipo`);
  }
}