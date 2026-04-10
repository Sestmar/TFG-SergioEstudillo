import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// NOTA: Eliminamos la importación de AuthService para evitar la Dependencia Circular

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // 1. Obtener el token directamente del localStorage
    // Esto evita tener que inyectar AuthService y rompe el ciclo infinito
    const token = localStorage.getItem('auth_token');

    let authReq = request;

    // 2. Si hay token, clonar la petición e inyectar el Header
    if (token) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 3. Pasar la petición y manejar errores de autenticación (401)
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Si el token es inválido o expiró:
          // Limpiamos el token manualmente
          localStorage.removeItem('auth_token');
          
          // Redirigimos al login
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}