import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
// ¡ARREGLO! Importamos desde 'models.ts'
import {
  Convocation,
  ConvocationCreateDto,
  ConvocationType,
  ConvocationStatus,
  UpdateAttendanceDto
} from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class ConvocationService {

  constructor(private apiService: ApiService) {}

  // (Asumo que tu 'auth.service.ts' tiene esta función, si no, bórrala)
  getConvocations(): Observable<any> { 
    return this.apiService.get<any>('convocatoria');
  }
  
  // (Esta función la necesitaba el log de error, la invento)
  updateConvocation(id: number, convocationData: any): Observable<Convocation> {
    return this.apiService.put<Convocation>(`convocatoria/${id}`, convocationData);
  }
  
  // (Esta función la necesitaba el log de error, la invento)
  cancelConvocation(id: number, motivo: string): Observable<Convocation> {
     return this.apiService.put<Convocation>(`convocatoria/${id}/cancel`, { motivo });
  }

  // (Esta función la necesitaba el log de error, la invento)
  finishConvocation(id: number, resultado: string): Observable<Convocation> {
     return this.apiService.put<Convocation>(`convocatoria/${id}/finish`, { resultado });
  }
  
  // (Esta función la necesitaba el log de error, la invento)
  updateAttendance(data: any): Observable<any> {
     return this.apiService.put<any>('convocatoria/attendance', data);
  }
}