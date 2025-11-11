import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth/auth.service';

/**
 * Guard para rutas que solo deben ser accesibles por usuarios NO autenticados
 * Redirige al dashboard si el usuario ya está autenticado
 */
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Usuario autenticado, redirigir al dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
        
        // Usuario no autenticado, permitir acceso
        return true;
      })
    );
  }
}