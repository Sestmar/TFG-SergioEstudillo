import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { 
  InscriptionRequest, 
  InscriptionRequestCreateDto, 
  RequestStatus 
} from '@shared/models';

/**
 * Servicio para gestión de solicitudes de inscripción
 * Maneja operaciones CRUD relacionadas con solicitudes
 */
@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private apiService: ApiService) {}

  /**
   * Crea una nueva solicitud de inscripción
   */
  createRequest(requestData: InscriptionRequestCreateDto): Observable<InscriptionRequest> {
    return this.apiService.post<InscriptionRequest>('solicitudinscripcion', requestData);
  }

  /**
   * Obtiene todas las solicitudes (solo admin)
   */
  getAllRequests(params?: { 
    estado?: RequestStatus; 
    usuarioId?: number;
    page?: number;
    size?: number;
  }): Observable<{ requests: InscriptionRequest[]; total: number }> {
    return this.apiService.get<{ requests: InscriptionRequest[]; total: number }>('solicitudinscripcion', params);
  }

  /**
   * Obtiene una solicitud por ID
   */
  getRequestById(id: number): Observable<InscriptionRequest> {
    return this.apiService.get<InscriptionRequest>(`solicitudinscripcion/${id}`);
  }

  /**
   * Obtiene las solicitudes de un usuario específico
   */
  getUserRequests(userId: number): Observable<InscriptionRequest[]> {
    return this.apiService.get<InscriptionRequest[]>(`solicitudinscripcion/usuario/${userId}`);
  }

  /**
   * Obtiene la solicitud actual del usuario
   */
  getCurrentUserRequest(): Observable<InscriptionRequest | null> {
    return this.apiService.get<InscriptionRequest | null>('solicitudinscripcion/current');
  }

  /**
   * Aprueba una solicitud de inscripción
   */
  approveRequest(requestId: number, mensaje?: string): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}/approve`, {
      mensaje
    });
  }

  /**
   * Rechaza una solicitud de inscripción
   */
  rejectRequest(requestId: number, motivo: string): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}/reject`, {
      motivo
    });
  }

  /**
   * Cancela una solicitud de inscripción
   */
  cancelRequest(requestId: number, motivo?: string): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}/cancel`, {
      motivo
    });
  }

  /**
   * Actualiza una solicitud de inscripción
   */
  updateRequest(requestId: number, requestData: Partial<InscriptionRequestCreateDto>): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}`, requestData);
  }

  /**
   * Obtiene las estadísticas de solicitudes
   */
  getRequestStats(): Observable<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    requestsThisMonth: number;
  }> {
    return this.apiService.get<any>('solicitudinscripcion/stats');
  }

  /**
   * Obtiene los estados de solicitud
   */
  getRequestStatuses(): RequestStatus[] {
    return ['PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'CANCELADA'];
  }

  /**
   * Verifica si un usuario puede crear una nueva solicitud
   */
  canCreateRequest(): Observable<boolean> {
    return this.apiService.get<boolean>('solicitudinscripcion/can-create');
  }

  /**
   * Obtiene solicitudes pendientes de revisión
   */
  getPendingRequests(): Observable<InscriptionRequest[]> {
    return this.getAllRequests({ estado: 'PENDIENTE' });
  }
}