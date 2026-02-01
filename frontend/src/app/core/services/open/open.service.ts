import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenService {

  constructor(private http: HttpClient) { }

  // 1. LISTA DE EQUIPOS
  getPublicTeams(): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/equipos`).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        return response.data || response.teams || [];
      })
    );
  }

  // 2. DETALLE DE EQUIPO
  getTeamDetail(teamId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/equipos/${teamId}`).pipe(
      map(response => response.data || response)
    );
  }

  // 3. JUGADORES
  getTeamRoster(teamId: number): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/jugadores`).pipe(
      map(response => {
        const allPlayers = Array.isArray(response) ? response : (response.data || []);
        return allPlayers.filter((p: any) => {
            // Buscamos ID plano o anidado
            const pTeamId = p.idEquipo || p.equipoId ||
                            p.equipoActual?.id || p.equipoActual?.idEquipo || 
                            p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || 
                            p.equipo?.id;
            return Number(pTeamId) === Number(teamId);
        });
      })
    );
  }

  // 4. STAFF TÉCNICO (CORRECCIÓN CRÍTICA AQUÍ)
  getTeamStaff(teamId: number): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/entrenadores`).pipe(
      map(response => {
        const allCoaches = Array.isArray(response) ? response : (response.data || []);
        
        return allCoaches.filter((c: any) => {
             // ✅ AÑADIDO c.idEquipo PORQUE TU BACKEND LO ENVÍA ASÍ (VER CONSOLA)
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