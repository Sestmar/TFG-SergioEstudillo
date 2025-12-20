import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { Convocation } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class ConvocationService {

  constructor(private apiService: ApiService) {}

  private formatJavaDate(isoDate: string): string {
    if (!isoDate) return '';
    return isoDate.replace('T', ' ').substring(0, 19);
  }

  // --- OBTENER TODAS (Con Adaptador de ID) ---
  getConvocations(): Observable<Convocation[]> { 
    // CORRECCIÓN AQUÍ: Usamos <any> en lugar de <any[]> para permitir verificar .data
    return this.apiService.get<any>('/convocatorias').pipe(
      map(response => {
        // 1. Asegurar que es un array. 
        // Ahora TypeScript no se quejará de 'response.data' porque response es 'any'
        const list = Array.isArray(response) ? response : (response.data || []);
        
        // 2. Normalizar cada objeto (Backend Java -> Frontend Angular)
        return list.map((item: any) => ({
          ...item,
          // 🛠️ TRUCO: Si el backend manda 'idConvocatoria', lo usamos como 'id'
          id: item.id || item.idConvocatoria, 
          
          // Aseguramos que titulo exista (si viene en observaciones)
          titulo: item.titulo || (item.observaciones ? item.observaciones.split(' - ')[0] : 'Evento')
        }));
      })
    );
  }

  // --- OBTENER UNA (Con Adaptador de ID) ---
  getConvocationById(id: number): Observable<Convocation> {
    return this.apiService.get<any>(`/convocatorias/${id}`).pipe(
      map((item: any) => ({
        ...item,
        id: item.id || item.idConvocatoria,
        titulo: item.titulo || (item.observaciones ? item.observaciones.split(' - ')[0] : 'Evento')
      }))
    );
  }

  // CREAR
  createConvocation(frontendData: any): Observable<Convocation> {
    const backendPayload = {
      idEquipo: frontendData.equipoId,
      fechaEvento: this.formatJavaDate(frontendData.fechaHoraInicio),
      tipo: frontendData.tipo,
      observaciones: `${frontendData.titulo} - ${frontendData.lugar}` 
    };
    return this.apiService.post<Convocation>('/convocatorias', backendPayload);
  }

  // ACTUALIZAR
  updateConvocation(id: number, frontendData: any): Observable<Convocation> {
    const backendPayload = {
      idEquipo: frontendData.equipoId,
      fechaEvento: this.formatJavaDate(frontendData.fechaHoraInicio),
      tipo: frontendData.tipo,
      observaciones: frontendData.observaciones || `${frontendData.titulo} - ${frontendData.lugar}`
    };
    return this.apiService.put<Convocation>(`/convocatorias/${id}`, backendPayload);
  }

  // BORRAR
  deleteConvocation(id: number): Observable<void> {
    return this.apiService.delete<void>(`/convocatorias/${id}`);
  }

  // ASISTENCIA
  updateAttendance(data: any): Observable<any> {
    return this.apiService.post<any>('/convocatoria-jugador', data);
  }
}