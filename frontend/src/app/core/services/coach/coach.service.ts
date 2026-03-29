import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CoachDashboardResponse, TeamStatsResponse, CoachProfileDto, CoachProfileUpdateDto } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  constructor(private apiService: ApiService) { }

  getDashboardData(userId: number): Observable<CoachDashboardResponse> {
    return this.apiService.get<CoachDashboardResponse>(`/entrenadores/usuario/${userId}/equipo`);
  }

  getProfile(coachId: number): Observable<CoachProfileDto> {
    return this.apiService.get<CoachProfileDto>(`/entrenadores/${coachId}`);
  }

  updateProfile(coachId: number, data: CoachProfileUpdateDto): Observable<CoachProfileDto> {
    return this.apiService.put<CoachProfileDto>(`/entrenadores/${coachId}`, data);
  }

  getTeamStats(coachId: number): Observable<TeamStatsResponse> {
    return this.apiService.get<TeamStatsResponse>(`/entrenadores/${coachId}/estadisticas-equipo`);
  }
}