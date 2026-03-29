import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  AdminUserDto, AdminEquipoDto, TeamDetailResponse,
  Partido, AsistenciaPayload, AttendanceSavedDto
} from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  // --- USUARIOS ---
  getCandidates(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.apiUrl}/candidatos`);
  }

  getCoachCandidates(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.apiUrl}/candidatos-entrenadores`);
  }

  getAllActiveUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.apiUrl}/usuarios-activos`);
  }

  createUser(userData: Partial<AdminUserDto> & { password?: string }): Observable<AdminUserDto> {
    return this.http.post<AdminUserDto>(`${this.apiUrl}/crear-usuario`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuario/${id}`);
  }

  assignTeam(idUsuario: number, idEquipo: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/asignar-equipo`, { idUsuario, idEquipo });
  }

  assignCoach(idUsuario: number, idEquipo: number, rol: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/asignar-mister`, { idUsuario, idEquipo, rol });
  }

  // --- EQUIPOS ---
  getTeams(): Observable<AdminEquipoDto[]> {
    return this.http.get<AdminEquipoDto[]>(`${this.apiUrl}/equipos`);
  }

  getTeamDetails(idEquipo: number): Observable<TeamDetailResponse> {
    return this.http.get<TeamDetailResponse>(`${this.apiUrl}/equipo/${idEquipo}/detalle`);
  }

  createTeam(teamData: Partial<AdminEquipoDto>): Observable<AdminEquipoDto> {
    return this.http.post<AdminEquipoDto>(`${this.apiUrl}/crear-equipo`, teamData);
  }

  // --- COMPETICIÓN ---
  // FormData o JSON según el caso — se mantiene flexible
  createMatch(matchData: Partial<Partido> | FormData): Observable<Partido> {
    return this.http.post<Partido>(`${this.apiUrl}/crear-partido`, matchData);
  }

  createTraining(data: Partial<Partido>): Observable<Partido> {
    return this.http.post<Partido>(`${this.apiUrl}/crear-entrenamiento`, data);
  }

  guardarAsistencia(payload: AsistenciaPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/guardar-asistencia`, payload);
  }

  getAsistencia(trainingId: number): Observable<AttendanceSavedDto[]> {
    return this.http.get<AttendanceSavedDto[]>(`${this.apiUrl}/entrenamiento/${trainingId}/asistencia`);
  }

  deleteEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/evento/${id}`);
  }
}