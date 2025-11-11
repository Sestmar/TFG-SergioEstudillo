import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '@environments/environment';

/**
 * Servicio API base para todas las comunicaciones con el backend
 * Proporciona métodos HTTP genéricos con manejo de errores centralizado
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;
  private readonly MAX_RETRIES = 2;

  constructor(private http: HttpClient) {}

  /**
   * GET request genérico
   */
  get<T>(endpoint: string, params?: any, headers?: any): Observable<T> {
    const httpParams = params ? this.buildHttpParams(params) : new HttpParams();
    
    return this.http.get<T>(`${this.API_URL}/${endpoint}`, {
      params: httpParams,
      headers: headers
    }).pipe(
      retry(this.MAX_RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * POST request genérico
   */
  post<T>(endpoint: string, data: any, headers?: any): Observable<T> {
    return this.http.post<T>(`${this.API_URL}/${endpoint}`, data, {
      headers: headers
    }).pipe(
      retry(this.MAX_RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * PUT request genérico
   */
  put<T>(endpoint: string, data: any, headers?: any): Observable<T> {
    return this.http.put<T>(`${this.API_URL}/${endpoint}`, data, {
      headers: headers
    }).pipe(
      retry(this.MAX_RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request genérico
   */
  delete<T>(endpoint: string, headers?: any): Observable<T> {
    return this.http.delete<T>(`${this.API_URL}/${endpoint}`, {
      headers: headers
    }).pipe(
      retry(this.MAX_RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH request genérico
   */
  patch<T>(endpoint: string, data: any, headers?: any): Observable<T> {
    return this.http.patch<T>(`${this.API_URL}/${endpoint}`, data, {
      headers: headers
    }).pipe(
      retry(this.MAX_RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * Construye HttpParams desde un objeto
   */
  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        if (Array.isArray(params[key])) {
          params[key].forEach((value: any) => {
            httpParams = httpParams.append(key, value.toString());
          });
        } else {
          httpParams = httpParams.set(key, params[key].toString());
        }
      }
    });
    
    return httpParams;
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = 'Conflicto en la operación';
          break;
        case 422:
          errorMessage = 'Datos inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 503:
          errorMessage = 'Servicio no disponible';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      statusText: error.statusText,
      error: error.error
    }));
  }
}