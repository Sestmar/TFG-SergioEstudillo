import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { Convocation, ConvocationType, UpdateAttendanceDto } from 'src/app/shared/models/models';

interface ConvocationRaw {
  id?: number;
  idConvocatoria?: number;
  titulo?: string;
  observaciones?: string;
  data?: ConvocationRaw[];
  [key: string]: unknown;
}

interface ConvocationFormDto {
  equipoId: number;
  fechaHoraInicio: string;
  tipo: ConvocationType;
  titulo: string;
  lugar: string;
  observaciones?: string;
}

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
    return this.apiService.get<ConvocationRaw | ConvocationRaw[]>('/convocatorias').pipe(
      map(response => {
        const list: ConvocationRaw[] = Array.isArray(response) ? response : ((response as ConvocationRaw).data || []);

        return list.map((item: ConvocationRaw) => ({
          ...item,
          id: item.id || item.idConvocatoria,
          titulo: item.titulo || (item.observaciones ? item.observaciones.split(' - ')[0] : 'Evento')
        } as unknown as Convocation));
      })
    );
  }

  // --- OBTENER UNA (Con Adaptador de ID) ---
  getConvocationById(id: number): Observable<Convocation> {
    return this.apiService.get<ConvocationRaw>(`/convocatorias/${id}`).pipe(
      map((item: ConvocationRaw) => ({
        ...item,
        id: item.id || item.idConvocatoria,
        titulo: item.titulo || (item.observaciones ? item.observaciones.split(' - ')[0] : 'Evento')
      } as unknown as Convocation))
    );
  }

  // CREAR
  createConvocation(frontendData: ConvocationFormDto): Observable<Convocation> {
    const backendPayload = {
      idEquipo: frontendData.equipoId,
      fechaEvento: this.formatJavaDate(frontendData.fechaHoraInicio),
      tipo: frontendData.tipo,
      observaciones: `${frontendData.titulo} - ${frontendData.lugar}`
    };
    return this.apiService.post<Convocation>('/convocatorias', backendPayload);
  }

  // ACTUALIZAR
  updateConvocation(id: number, frontendData: ConvocationFormDto): Observable<Convocation> {
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
  updateAttendance(data: UpdateAttendanceDto): Observable<void> {
    return this.apiService.post<void>('/convocatoria-jugador', data);
  }
}