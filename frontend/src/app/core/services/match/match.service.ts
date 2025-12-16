import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Ruta relativa: Subimos 1 nivel (../) para salir de 'match' y entramos a 'api'
import { ApiService } from '../api/api.service'; 

// Ruta relativa: Subimos 4 niveles para llegar a 'shared' (.. -> services, .. -> core, .. -> app, .. -> src -> ERROR MENTAL, espera)
// Corrección:
// ../ (services) -> ../ (core) -> ../ (app) -> shared/models/models
import { Match } from '../../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(private apiService: ApiService) {}

  getMatchesByTeam(teamId: number): Observable<Match[]> {
    return this.apiService.get<Match[]>(`partidos?equipoId=${teamId}`);
  }

  getMatches(filters: any = {}): Observable<any> {
    // Convertimos filtros a query string si es necesario
    return this.apiService.get<any>('partidos');
  }
}
