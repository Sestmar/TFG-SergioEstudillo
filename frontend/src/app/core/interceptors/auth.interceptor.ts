import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * Configuración JWT temporal
 */
const jwtConfig = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token'
};

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token actual
    const authToken = this.authService.getToken();
    
    // Si hay token, clonar la request y añadir el header Authorization
    if (authToken) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next.handle(authReq);
    }
    
    // Si no hay token, continuar con la request original
    return next.handle(request);
  }
}