import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Convocation } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class ConvocationService {

  constructor(private apiService: ApiService) {}

  /**
   * Helper privado para convertir formato ISO de JS al formato Timestamp de Java/SQL
   * Entrada: "2025-12-21T21:00:00.000Z"
   * Salida:  "2025-12-21 21:00:00"
   */
  private formatJavaDate(isoDate: string): string {
    if (!isoDate) return '';
    // Reemplazamos la 'T' por espacio y quitamos los milisegundos (.000Z)
    return isoDate.replace('T', ' ').substring(0, 19);
  }

  // Obtener todas
  getConvocations(): Observable<Convocation[]> { 
    return this.apiService.get<Convocation[]>('/convocatorias');
  }

  // Obtener una
  getConvocationById(id: number): Observable<Convocation> {
    return this.apiService.get<Convocation>(`/convocatorias/${id}`);
  }

  // CREAR (Aquí aplicamos la corrección)
  createConvocation(frontendData: any): Observable<Convocation> {
    
    // 1. Mapeamos los datos para que coincidan con tu DTO de Java
    const backendPayload = {
      idEquipo: frontendData.equipoId, // Frontend usa 'equipoId', Backend 'idEquipo'
      
      // 2. CORRECCIÓN DE FECHA: Usamos la función helper
      fechaEvento: this.formatJavaDate(frontendData.fechaHoraInicio),
      
      tipo: frontendData.tipo,
      
      // 3. Concatenamos Título y Lugar en observaciones porque el backend no tiene esos campos
      observaciones: `${frontendData.titulo} - ${frontendData.lugar}` 
    };

    console.log('Enviando al backend:', backendPayload); // Para depurar en consola

    return this.apiService.post<Convocation>('/convocatorias', backendPayload);
  }

  // ACTUALIZAR (También aplicamos la corrección)
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

  // Asistencia (Mock/Pendiente)
  updateAttendance(data: any): Observable<any> {
    return this.apiService.post<any>('/convocatoria-jugador', data);
  }
}