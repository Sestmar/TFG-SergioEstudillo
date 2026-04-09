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
  get<T>(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}): Observable<T> {
    const filtered: Record<string, string | number | boolean> = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string | number | boolean][]
    );
    const options = {
      params: new HttpParams({ fromObject: filtered })
    };
    // Concatenamos la URL base (Render) con el endpoint (ej: /auth/login)
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, options).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: unknown): Observable<T> {
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
    return throwError(() => error);
  }
}