import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { InscriptionRequest } from 'src/app/shared/models/models'; // <-- Import corregido

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private apiService: ApiService) {}

  // --- ¡ARREGLO! ---
  getAllRequests(params?: Record<string, string | number | boolean>): Observable<{ requests: InscriptionRequest[]; total: number }> {
    return this.apiService.get<{ requests: InscriptionRequest[]; total: number }>('solicitudinscripcion', params);
  }

  getRequestById(id: number): Observable<InscriptionRequest> {
    return this.apiService.get<InscriptionRequest>(`solicitudinscripcion/${id}`);
  }

  createRequest(requestData: Record<string, unknown>): Observable<InscriptionRequest> {
    return this.apiService.post<InscriptionRequest>('solicitudinscripcion', requestData);
  }

  approveRequest(requestId: number, mensaje: string): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}/approve`, { mensaje });
  }

  rejectRequest(requestId: number, motivo: string): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}/reject`, { motivo });
  }

  cancelRequest(requestId: number, motivo: string): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}/cancel`, { motivo });
  }

  updateRequest(requestId: number, requestData: Record<string, unknown>): Observable<InscriptionRequest> {
    return this.apiService.put<InscriptionRequest>(`solicitudinscripcion/${requestId}`, requestData);
  }

  // --- ¡ARREGLO! ---
  getPendingRequests(): Observable<{ requests: InscriptionRequest[]; total: number }> {
    return this.getAllRequests({ estado: 'PENDIENTE' });
  }
}