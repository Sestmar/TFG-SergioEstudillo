import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// 1. IMPORTANTE: Importamos el environment
import { environment } from 'src/environments/environment';

/**
 * Servicio centralizado para peticiones HTTP
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // =================================================================
  // ===           CORRECCIÓN: Usar variable de entorno            ===
  // =================================================================
  // Antes: 'http://localhost:8080/api'
  // Ahora: Lee la URL de Render desde environment.ts
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params: any = {}): Observable<T> {
    const options = {
      params: new HttpParams({ fromObject: params })
    };
    // Concatenamos la URL base (Render) con el endpoint (ej: /auth/login)
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, options).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: HttpErrorResponse) {
    console.error('ApiService Error:', error);
    return throwError(() => error);
  }
}