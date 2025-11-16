import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';
// ¡Ahora este import es la única fuente de la verdad para los modelos!
import { User, AuthResponse, UserLoginDto, UserRegisterDto, JwtPayload } from '../../../shared/models/models';

const jwtConfig = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token', 
  tokenExpirationOffset: 300
};

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

  private initializeAuth(): void {
    const token = this.storageService.get(jwtConfig.tokenKey);
    if (token && !this.isTokenExpired(token)) {
      this.setAuth(token);
    } else {
      this.logout();
    }
  }

  login(credentials: UserLoginDto): Observable<User> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
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

  register(userData: UserRegisterDto): Observable<User> {
    return this.apiService.post<User>('/auth/register', userData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

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
  
  private setAuth(token: string, refreshToken?: string): void {
    this.storageService.set(jwtConfig.tokenKey, token);
    if (refreshToken) {
      this.storageService.set(jwtConfig.refreshTokenKey, refreshToken);
    }
    try {
      const payload = jwtDecode<JwtPayload>(token);
      
      // Mapeo desde el payload del token a un objeto User parcial
      const user: Partial<User> = { 
        idUsuario: parseInt(payload.sub, 10), 
        nombre: payload.username,
        email: payload.sub,
        roles: payload.roles,
        rol: payload.roles[0] || 'JUGADOR',
      };
      
      this.currentUserSubject.next(user as User);
      this.isAuthenticatedSubject.next(true);
      this.scheduleTokenRefresh(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
    }
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.get(jwtConfig.refreshTokenKey);
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }
    return this.apiService.post<AuthResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(response => this.setAuth(response.token, response.refreshToken)),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        throw error;
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return of(currentUser);
    }
    // Este endpoint puede que necesites crearlo en el backend
    return this.apiService.get<User>('/users/me').pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.some(role => roles.includes(role)) || false;
  }

  getToken(): string | null {
    return this.storageService.get(jwtConfig.tokenKey);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

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

  requestPasswordReset(email: string): Observable<void> {
    return this.apiService.post<void>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>('/auth/reset-password', { token, newPassword });
  }
}