import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/**
 * Servicio centralizado para peticiones HTTP
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params: any = {}): Observable<T> {
    const options = {
      params: new HttpParams({ fromObject: params })
    };
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   * --- ¡ESTA ES LA CORRECCIÓN! ---
   * La firma ahora es (endpoint, data).
   * Asumimos que el ID ya va en el endpoint (ej: "jugadores/1")
   * Esto arregla los 20 errores "Expected 3 arguments, but got 2".
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: HttpErrorResponse) {
    console.error('ApiService Error:', error);
    // Puedes añadir tu NotificationService aquí si quieres
    return throwError(() => error);
  }
}