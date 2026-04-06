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
        // Normalizamos los roles del usuario (quitamos ROLE_ y pasamos a Mayúsculas)
        const userRoles = (user.roles || []).map(r => r.toUpperCase().replace('ROLE_', ''));
        const normalizedExpected = (expectedRoles || []).map(r => r.toUpperCase().replace('ROLE_', ''));

        const hasRole = userRoles.some(role => normalizedExpected.includes(role));
        
        if (hasRole) {
          return true;
        }

        // Redirigir según el rol del usuario si no tiene el rol esperado
        this.redirectByRole(userRoles);
        return false;
      })
    );
  }

  /**
   * Redirige al usuario según su rol de forma robusta
   */
  private redirectByRole(userRoles: string[]): void {
    // 1. Check ADMIN
    if (userRoles.some(r => r.includes('ADMIN'))) {
      this.router.navigate(['/admin']); 
      return;
    } 
    
    // 2. Check ENTRENADOR (Busca 'ENTRENADOR', 'COACH' o 'STAFF')
    if (userRoles.some(r => r.includes('ENTRENADOR') || r.includes('COACH') || r.includes('STAFF'))) {
      this.router.navigate(['/coach-dashboard']);
      return;
    } 
    
    // 3. Default: JUGADOR
    this.router.navigate(['/player-dashboard']);
  }
}