import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Team } from 'src/app/shared/models/models';
import { UserService } from '../user/user.service';

/**
 * Servicio de estado para gestión centralizada de datos de usuario
 * Implementa patrón State para mantener consistencia en toda la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private userService: UserService) {}

  /**
   * Carga el usuario actual
   */
  loadCurrentUser(): Observable<User> {
    this.loadingSubject.next(true);
    
    return this.userService.getCurrentUser().pipe(
      map(user => {
        this.currentUserSubject.next(user);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
        return user;
      })
    );
  }

  /**
   * Actualiza el usuario actual
   */
  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Carga todos los usuarios (solo admin)
   */
  loadAllUsers(params?: { page?: number; size?: number; role?: string }): Observable<{ users: User[]; total: number }> {
    this.loadingSubject.next(true);
    
    return this.userService.getAllUsers(params).pipe(
      map(response => {
        this.usersSubject.next(response.users);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
        return response;
      })
    );
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene un observable del usuario actual
   */
  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.roles?.includes(role) || false),
      distinctUntilChanged()
    );
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   */
  hasAnyRole(roles: UserRole[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user?.roles) return false;
        return roles.some(role => user.roles?.includes(role));
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user?.id || null;
  }

  /**
   * Limpia el estado del usuario
   */
  clearUserState(): void {
    this.currentUserSubject.next(null);
    this.usersSubject.next([]);
    this.errorSubject.next(null);
  }

  /**
   * Establece un error
   */
  setError(error: string): void {
    this.errorSubject.next(error);
    this.loadingSubject.next(false);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user !== null),
      distinctUntilChanged()
    );
  }
}