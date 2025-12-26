import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

// ✅ IMPORTS ABSOLUTOS
import { ApiService } from 'src/app/core/services/api/api.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { 
  User, 
  AuthResponse, 
  UserLoginDto, 
  UserRegisterDto, 
  JwtPayload 
} from 'src/app/shared/models/models';

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
    const token = this.storageService.getToken(); 
    
    if (token && !this.isTokenExpired(token)) {
      this.setAuth(token);
      this.getCurrentUser().subscribe({
        error: () => {
           console.warn('Sesión inválida al inicio, cerrando sesión.');
           this.logout(); 
        }
      });
    } else {
      this.storageService.removeToken();
    }
  }

  // LOGIN
  login(credentials: UserLoginDto): Observable<User> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.setAuth(response.token, response.refreshToken);
      }),
      switchMap(() => this.getCurrentUser()),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: UserRegisterDto): Observable<User> {
    return this.apiService.post<User>('/auth/register', userData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.storageService.removeToken();
    this.storageService.remove(jwtConfig.refreshTokenKey);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    this.router.navigate(['/auth/login']);
  }
  
  private setAuth(token: string, refreshToken?: string): void {
    this.storageService.setToken(token);
    
    if (refreshToken) {
      this.storageService.set(jwtConfig.refreshTokenKey, refreshToken);
    }
    try {
      const payload = jwtDecode<JwtPayload>(token);
      
      const userPartial: Partial<User> = { 
        email: payload.sub,
      };
      
      const currentUser = this.currentUserSubject.value;
      this.currentUserSubject.next({ ...currentUser, ...userPartial } as User);
      
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
      return throwError(() => new Error('No refresh token available'));
    }
    return this.apiService.post<AuthResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(response => this.setAuth(response.token, response.refreshToken)),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('/auth/me').pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  // 🔥 NUEVO MÉTODO AÑADIDO: Actualizar Usuario (Fundamental para la foto)
  updateUser(id: number, data: Partial<User>): Observable<User> {
    // Asumimos que tienes un endpoint PUT o PATCH para actualizar usuarios
    // Si tu endpoint es '/usuarios/{id}', ajústalo aquí.
    return this.apiService.put<User>(`/usuarios/${id}`, data).pipe(
      tap(updatedUser => {
        // Actualizamos el usuario en memoria para que la foto cambie al instante
        const current = this.currentUserSubject.value;
        if (current && current.idUsuario === id) {
             this.currentUserSubject.next({ ...current, ...updatedUser });
        }
      })
    );
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.apiService.post<void>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>('/auth/reset-password', { token, newPassword });
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (user?.roles && Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    return user?.rol === role;
  }

  getToken(): string | null {
    return this.storageService.getToken();
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
        if (this.tokenRefreshTimer) clearTimeout(this.tokenRefreshTimer);
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshToken().subscribe({
            error: () => console.warn('Auto-refresh token failed')
          });
        }, delay);
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }
}