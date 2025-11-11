import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';

/**
 * Interfaces temporales para que compile
 */
interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
  roles: string[];
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

interface UserLoginDto {
  email: string;
  password: string;
}

interface UserRegisterDto {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

/**
 * Interfaz para el payload del JWT
 */
interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  exp: number;
  iat: number;
}

/**
 * Configuración JWT temporal
 */
const jwtConfig = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token', 
  tokenExpirationOffset: 300 // 5 minutos antes de expirar
};

/**
 * Servicio de autenticación y gestión de usuarios
 * Maneja login, registro, JWT y estado de autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenRefreshTimer: any;

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación al arrancar la aplicación
   */
  private initializeAuth(): void {
    const token = this.storageService.get(jwtConfig.tokenKey);
    if (token && !this.isTokenExpired(token)) {
      this.setAuth(token);
    } else {
      this.logout();
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: UserLoginDto): Observable<User> {
    return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.setAuth(response.token, response.refreshToken);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: UserRegisterDto): Observable<User> {
    return this.apiService.post<User>('usuarios', userData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  /**
   * Logout de usuario
   */
  logout(): void {
    this.storageService.remove(jwtConfig.tokenKey);
    this.storageService.remove(jwtConfig.refreshTokenKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    
    this.router.navigate(['/landing']);
  }

  /**
   * Refresca el token JWT
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.get(jwtConfig.refreshTokenKey);
    
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    return this.apiService.post<AuthResponse>('auth/refresh', { refreshToken }).pipe(
      tap(response => {
        this.setAuth(response.token, response.refreshToken);
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        throw error;
      })
    );
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return of(currentUser);
    }

    return this.apiService.get<User>('usuarios/current').pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.some(role => roles.includes(role)) || false;
  }

  /**
   * Obtiene el token JWT actual
   */
  getToken(): string | null {
    return this.storageService.get(jwtConfig.tokenKey);
  }

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Programa el refresco automático del token
   */
  private scheduleTokenRefresh(token: string): void {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const expirationTime = payload.exp * 1000;
      const refreshTime = expirationTime - (jwtConfig.tokenExpirationOffset * 1000);
      const delay = refreshTime - Date.now();

      if (delay > 0) {
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshToken().subscribe();
        }, delay);
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  /**
   * Establece la autenticación con el token proporcionado
   */
  private setAuth(token: string, refreshToken?: string): void {
    this.storageService.set(jwtConfig.tokenKey, token);
    
    if (refreshToken) {
      this.storageService.set(jwtConfig.refreshTokenKey, refreshToken);
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);
      const user: User = {
        id: parseInt(payload.sub),
        username: payload.username,
        email: '',
        nombre: '',
        apellidos: '',
        activo: true,
        fechaRegistro: new Date(),
        fechaActualizacion: new Date(),
        roles: payload.roles
      };
      
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.scheduleTokenRefresh(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
    }
  }

  /**
   * Solicita recuperación de contraseña
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.apiService.post<void>('auth/forgot-password', { email });
  }

  /**
   * Restablece la contraseña con el token
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>('auth/reset-password', { token, newPassword });
  }
}