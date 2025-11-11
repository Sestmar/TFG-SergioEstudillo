import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth/auth.service';

/**
 * Guard para proteger rutas según roles de usuario
 * Verifica que el usuario tenga los roles necesarios para acceder
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRoles = route.data['roles'] as string[];
    return this.checkRole(expectedRoles);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }

  /**
   * Verifica que el usuario tenga los roles requeridos
   */
  private checkRole(expectedRoles: string[]): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        // Si no se especifican roles, permitir acceso
        if (!expectedRoles || expectedRoles.length === 0) {
          return true;
        }

        // Verificar si el usuario tiene al menos uno de los roles requeridos
        const hasRole = user.roles?.some(role => expectedRoles.includes(role));
        
        if (hasRole) {
          return true;
        }

        // Redirigir según el rol del usuario
        this.redirectByRole(user.roles || []);
        return false;
      })
    );
  }

  /**
   * Redirige al usuario según su rol
   */
  private redirectByRole(userRoles: string[]): void {
    const isAdmin = userRoles.includes('ADMIN');
    const isCoach = userRoles.includes('ENTRENADOR');
    const isPlayer = userRoles.includes('JUGADOR');

    if (isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else if (isCoach) {
      this.router.navigate(['/coach/dashboard']);
    } else if (isPlayer) {
      this.router.navigate(['/player/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}