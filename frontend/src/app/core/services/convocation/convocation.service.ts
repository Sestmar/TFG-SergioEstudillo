import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { 
  Convocation, 
  ConvocationCreateDto, 
  ConvocationType, 
  ConvocationStatus,
  UpdateAttendanceDto 
} from '@shared/models';

/**
 * Servicio para gestión de convocatorias
 * Maneja operaciones CRUD relacionadas con convocatorias
 */
@Injectable({
  providedIn: 'root'
})
export class ConvocationService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todas las convocatorias
   */
  getAllConvocations(params?: { 
    equipoId?: number; 
    tipo?: ConvocationType; 
    estado?: ConvocationStatus;
    fechaInicio?: Date;
    fechaFin?: Date;
    page?: number;
    size?: number;
  }): Observable<{ convocations: Convocation[]; total: number }> {
    return this.apiService.get<{ convocations: Convocation[]; total: number }>('convocatoria', params);
  }

  /**
   * Obtiene una convocatoria por ID
   */
  getConvocationById(id: number): Observable<Convocation> {
    return this.apiService.get<Convocation>(`convocatoria/${id}`);
  }

  /**
   * Crea una nueva convocatoria
   */
  createConvocation(convocationData: ConvocationCreateDto): Observable<Convocation> {
    return this.apiService.post<Convocation>('convocatoria', convocationData);
  }

  /**
   * Actualiza una convocatoria
   */
  updateConvocation(id: number, convocationData: Partial<Convocation>): Observable<Convocation> {
    return this.apiService.put<Convocation>(`convocatoria/${id}`, convocationData);
  }

  /**
   * Cancela una convocatoria
   */
  cancelConvocation(id: number, motivo: string): Observable<Convocation> {
    return this.apiService.put<Convocation>(`convocatoria/${id}/cancel`, {
      motivo
    });
  }

  /**
   * Finaliza una convocatoria
   */
  finishConvocation(id: number, resultado?: any): Observable<Convocation> {
    return this.apiService.put<Convocation>(`convocatoria/${id}/finish`, {
      resultado
    });
  }

  /**
   * Actualiza el estado de asistencia de un jugador
   */
  updateAttendance(data: UpdateAttendanceDto): Observable<any> {
    return this.apiService.put<any>('convocatoria/attendance', data);
  }

  /**
   * Obtiene las convocatorias de un jugador
   */
  getPlayerConvocations(playerId: number, params?: { 
    estado?: ConvocationStatus;
    tipo?: ConvocationType;
  }): Observable<Convocation[]> {
    return this.apiService.get<Convocation[]>(`convocatoria/jugador/${playerId}`, params);
  }

  /**
   * Obtiene las convocatorias de un equipo
   */
  getTeamConvocations(teamId: number, params?: { 
    estado?: ConvocationStatus;
    tipo?: ConvocationType;
    fechaInicio?: Date;
    fechaFin?: Date;
  }): Observable<Convocation[]> {
    return this.apiService.get<Convocation[]>(`convocatoria/equipo/${teamId}`, params);
  }

  /**
   * Obtiene las convocatorias próximas
   */
  getUpcomingConvocations(days?: number): Observable<Convocation[]> {
    return this.apiService.get<Convocation[]>('convocatoria/upcoming', {
      days
    });
  }

  /**
   * Obtiene las convocatorias que requieren confirmación
   */
  getPendingConfirmations(playerId?: number): Observable<any[]> {
    return this.apiService.get<any[]>('convocatoria/pending-confirmations', {
      playerId
    });
  }

  /**
   * Obtiene los tipos de convocatoria
   */
  getConvocationTypes(): ConvocationType[] {
    return ['PARTIDO_OFICIAL', 'PARTIDO_AMISTOSO', 'ENTRENAMIENTO', 'CONCENTRACION'];
  }

  /**
   * Obtiene los estados de convocatoria
   */
  getConvocationStatuses(): ConvocationStatus[] {
    return ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'SUSPENDIDA'];
  }
}