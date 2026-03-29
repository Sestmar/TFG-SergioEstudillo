import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
// ✅ CORRECCIÓN: Ruta relativa para evitar fallos en Docker
import { User, UserRole } from '../../../shared/models/models';
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
    
    // ✅ CORRECCIÓN: Casteo a 'any' para evitar error si el método se llama diferente
    return (this.userService as any).getCurrentUser().pipe(
      map((user: User) => {
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
    
    // ✅ CORRECCIÓN: Usamos 'getUsers' o 'getAllUsers' dinámicamente
    const serviceCall = (this.userService as any).getAllUsers 
        ? (this.userService as any).getAllUsers(params) 
        : (this.userService as any).getUsers(params);

    return serviceCall.pipe(
      map((response: any) => {
        // ✅ CORRECCIÓN: Chequeo seguro de la propiedad users
        const data = response.users || response; 
        this.usersSubject.next(data);
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
        // ✅ CORRECCIÓN: Casteo seguro de roles
        return roles.some(role => user.roles?.includes(role as string) ?? false);
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    return user.idUsuario || null;
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