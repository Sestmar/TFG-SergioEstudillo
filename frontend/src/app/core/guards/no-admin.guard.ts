import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth/auth.service';

/**
 * Guard que bloquea el acceso a rutas para el rol ADMIN.
 * El ADMIN no tiene equipo asignado, por lo que no puede usar el chat de equipo.
 * Redirige a /admin-dashboard si el usuario es ADMIN.
 */
@Injectable({
  providedIn: 'root'
})
export class NoAdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const rol = (user.rol ?? '').toUpperCase();
        const isAdmin = rol.includes('ADMIN');

        if (isAdmin) {
          this.router.navigate(['/admin-dashboard']);
          return false;
        }

        return true;
      })
    );
  }
}
