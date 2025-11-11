import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NotificationService } from '../services/notification/notification.service';

/**
 * Interceptor para manejo global de errores HTTP
 * Proporciona feedback al usuario cuando ocurren errores
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Maneja el error según su tipo y código de estado
   */
  private handleError(error: HttpErrorResponse): void {
    // No mostrar errores de autenticación (los maneja el AuthInterceptor)
    if (error.status === 401) {
      return;
    }

    let message = 'Ha ocurrido un error inesperado';
    
    switch (error.status) {
      case 0:
        message = 'No se pudo conectar con el servidor';
        break;
      case 400:
        message = this.getValidationErrorMessage(error);
        break;
      case 403:
        message = 'No tienes permisos para realizar esta acción';
        break;
      case 404:
        message = 'El recurso solicitado no fue encontrado';
        break;
      case 409:
        message = 'Conflicto: El recurso ya existe o está en uso';
        break;
      case 422:
        message = this.getValidationErrorMessage(error);
        break;
      case 429:
        message = 'Demasiadas solicitudes. Por favor, inténtalo más tarde';
        break;
      case 500:
        message = 'Error interno del servidor. Por favor, inténtalo más tarde';
        break;
      case 503:
        message = 'El servicio no está disponible temporalmente';
        break;
      default:
        if (error.error?.message) {
          message = error.error.message;
        }
    }

    // Mostrar el error al usuario
    this.notificationService.showError(message);
  }

  /**
   * Obtiene el mensaje de error de validación
   */
  private getValidationErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      const messages = (Object.values(errors) as any[]).reduce((acc, val) => acc.concat(val), []) as string[];    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    return 'Datos inválidos. Por favor, verifica la información';
  }
}