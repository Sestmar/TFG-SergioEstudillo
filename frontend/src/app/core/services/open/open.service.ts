import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PublicTeam, PublicPlayer, AdminEquipoDto } from 'src/app/shared/models/models';

interface CoachRaw {
  idEquipo?: number;
  equipoId?: number;
  equipoActual?: { id?: number; idEquipo?: number };
  equipoPrincipal?: { id?: number; idEquipo?: number };
  equipo?: { id?: number };
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class OpenService {

  constructor(private http: HttpClient) { }

  getPublicTeams(): Observable<PublicTeam[]> {
    return this.http.get<PublicTeam[] | { data?: PublicTeam[]; teams?: PublicTeam[] }>(`${environment.apiUrl}/equipos`).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        return (response as { data?: PublicTeam[]; teams?: PublicTeam[] }).data || (response as { data?: PublicTeam[]; teams?: PublicTeam[] }).teams || [];
      })
    );
  }

  getTeamDetail(teamId: number): Observable<AdminEquipoDto> {
    return this.http.get<AdminEquipoDto | { data?: AdminEquipoDto }>(`${environment.apiUrl}/equipos/${teamId}`).pipe(
      map(response => (response as { data?: AdminEquipoDto }).data || (response as AdminEquipoDto))
    );
  }

  getTeamRoster(teamId: number): Observable<PublicPlayer[]> {
    return this.http.get<PublicPlayer[]>(`${environment.apiUrl}/public/equipos/${teamId}/plantilla`).pipe(
      map(response => response || [])
    );
  }

  getTeamStaff(teamId: number): Observable<CoachRaw[]> {
    return this.http.get<CoachRaw[] | { data?: CoachRaw[] }>(`${environment.apiUrl}/entrenadores`).pipe(
      map(response => {
        const allCoaches: CoachRaw[] = Array.isArray(response) ? response : ((response as { data?: CoachRaw[] }).data || []);
        return allCoaches.filter((c: CoachRaw) => {
          const cTeamId = c.idEquipo || c.equipoId ||
            c.equipoActual?.id || c.equipoActual?.idEquipo ||
            c.equipoPrincipal?.id || c.equipoPrincipal?.idEquipo ||
            c.equipo?.id;
          return Number(cTeamId) === Number(teamId);
        });
      })
    );
  }
}