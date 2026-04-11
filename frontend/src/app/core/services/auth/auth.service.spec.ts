import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ApiService } from 'src/app/core/services/api/api.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { User, AuthResponse } from 'src/app/shared/models/models';

// ─── helper: JWT falso ────────────────────────────────────────────────────────
/**
 * Genera un JWT con payload personalizado.
 * Solo necesitamos que jwtDecode pueda leerlo — la firma no se verifica en el cliente.
 */
function createFakeJwt(payload: object): string {
  const b64url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url(payload);
  return `${header}.${body}.fake-signature`;
}

const FUTURE_TOKEN = createFakeJwt({
  sub: 'test@test.com',
  exp: Math.floor(Date.now() / 1000) + 3600, // expira en 1 hora
  iat: Math.floor(Date.now() / 1000)
});

const EXPIRED_TOKEN = createFakeJwt({
  sub: 'old@test.com',
  exp: Math.floor(Date.now() / 1000) - 3600, // expiró hace 1 hora
  iat: 0
});

// ─── suite ────────────────────────────────────────────────────────────────────

/**
 * Tests unitarios del AuthService.
 * Los tres colaboradores (ApiService, StorageService, Router) se mockean
 * con jasmine.createSpyObj para aislar completamente el servicio.
 *
 * Cobertura:
 *  - isTokenExpired: token expirado, token válido, token malformado
 *  - logout: limpia storage, resetea subjects, navega a /auth/login
 *  - hasRole: coincidencia por roles[], coincidencia por rol, caso negativo
 *  - getCurrentUser: normaliza "ROLE_JUGADOR" → "JUGADOR", "admin" → "ADMIN"
 *  - login: encadena post → setAuth → getCurrentUser correctamente
 */
describe('AuthService', () => {
  let service: AuthService;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    storageSpy = jasmine.createSpyObj('StorageService', [
      'getToken', 'setToken', 'removeToken', 'get', 'set', 'remove'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // initializeAuth() se llama en el constructor → getToken null evita cualquier decode de JWT
    storageSpy.getToken.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  // ─── isTokenExpired ─────────────────────────────────────────────────────────

  it('debería devolver TRUE para un token expirado', () => {
    expect(service.isTokenExpired(EXPIRED_TOKEN)).toBeTrue();
  });

  it('debería devolver FALSE para un token válido', () => {
    expect(service.isTokenExpired(FUTURE_TOKEN)).toBeFalse();
  });

  it('debería devolver TRUE para un token malformado', () => {
    expect(service.isTokenExpired('no-es-un-jwt')).toBeTrue();
  });

  // ─── logout ─────────────────────────────────────────────────────────────────

  it('debería limpiar el storage y navegar a /auth/login al hacer logout', () => {
    service.logout();

    expect(storageSpy.removeToken).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('debería emitir false en isAuthenticated$ tras logout', () => {
    // Forzamos estado autenticado antes del logout
    (service as any).isAuthenticatedSubject.next(true);
    expect((service as any).isAuthenticatedSubject.value).toBeTrue();

    service.logout();

    // BehaviorSubject permite leer el valor actual de forma síncrona
    expect((service as any).isAuthenticatedSubject.value).toBeFalse();
  });

  it('debería emitir null en currentUser$ tras logout', () => {
    // Establecemos un usuario antes del logout
    (service as any).currentUserSubject.next({
      idUsuario: 1, email: 'u@u.com', nombre: 'Test', apellidos: '', rol: 'JUGADOR'
    } as User);
    expect((service as any).currentUserSubject.value).not.toBeNull();

    service.logout();

    expect((service as any).currentUserSubject.value).toBeNull();
  });

  // ─── hasRole ────────────────────────────────────────────────────────────────

  it('debería devolver TRUE cuando el usuario tiene el rol en el array roles', () => {
    // Acceso al subject privado es necesario para preparar el estado en tests
    (service as any).currentUserSubject.next({
      idUsuario: 1, email: 'a@a.com', nombre: 'Test', apellidos: '',
      rol: 'ADMIN', roles: ['ADMIN', 'JUGADOR']
    } as User);

    expect(service.hasRole('ADMIN')).toBeTrue();
  });

  it('debería devolver TRUE cuando el usuario tiene el rol como string plano', () => {
    (service as any).currentUserSubject.next({
      idUsuario: 1, email: 'a@a.com', nombre: 'Test', apellidos: '',
      rol: 'ENTRENADOR'
    } as User);

    expect(service.hasRole('ENTRENADOR')).toBeTrue();
  });

  it('debería devolver FALSE cuando el usuario no tiene el rol solicitado', () => {
    (service as any).currentUserSubject.next({
      idUsuario: 1, email: 'a@a.com', nombre: 'Test', apellidos: '',
      rol: 'JUGADOR', roles: ['JUGADOR']
    } as User);

    expect(service.hasRole('ADMIN')).toBeFalse();
  });

  it('debería devolver FALSE cuando no hay usuario autenticado', () => {
    (service as any).currentUserSubject.next(null);
    expect(service.hasRole('ADMIN')).toBeFalse();
  });

  // ─── getCurrentUser ──────────────────────────────────────────────────────────

  it('debería normalizar "ROLE_JUGADOR" a "JUGADOR"', (done) => {
    const mockUser: User = {
      idUsuario: 5, email: 'j@j.com', nombre: 'Jugador', apellidos: '',
      rol: 'ROLE_JUGADOR'
    };
    apiSpy.get.and.returnValue(of(mockUser));

    service.getCurrentUser().subscribe(user => {
      expect(user.rol).toBe('JUGADOR');
      done();
    });
  });

  it('debería normalizar rol en minúsculas "admin" a "ADMIN"', (done) => {
    const mockUser: User = {
      idUsuario: 1, email: 'a@a.com', nombre: 'Admin', apellidos: '',
      rol: 'admin'
    };
    apiSpy.get.and.returnValue(of(mockUser));

    service.getCurrentUser().subscribe(user => {
      expect(user.rol).toBe('ADMIN');
      done();
    });
  });

  it('debería construir el array roles a partir de rol si no viene del backend', (done) => {
    const mockUser: User = {
      idUsuario: 2, email: 'e@e.com', nombre: 'Ent', apellidos: '',
      rol: 'ENTRENADOR'
      // roles no viene → el servicio lo construye
    };
    apiSpy.get.and.returnValue(of(mockUser));

    service.getCurrentUser().subscribe(user => {
      expect(user.roles).toEqual(['ENTRENADOR']);
      done();
    });
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  it('debería llamar a /auth/login, guardar el token y devolver el usuario', (done) => {
    const fakeResponse: AuthResponse = { token: FUTURE_TOKEN };
    const fakeUser: User = {
      idUsuario: 10, email: 'u@u.com', nombre: 'User', apellidos: '', rol: 'JUGADOR'
    };

    apiSpy.post.and.returnValue(of(fakeResponse));
    apiSpy.get.and.returnValue(of(fakeUser));

    service.login({ email: 'u@u.com', password: '123456' }).subscribe(user => {
      expect(apiSpy.post).toHaveBeenCalledWith('/auth/login', { email: 'u@u.com', password: '123456' });
      expect(storageSpy.setToken).toHaveBeenCalledWith(FUTURE_TOKEN);
      expect(user.email).toBe('u@u.com');
      done();
    });
  });

  it('debería propagar el error si /auth/login falla', (done) => {
    apiSpy.post.and.returnValue(throwError(() => new Error('401 Unauthorized')));

    service.login({ email: 'x@x.com', password: 'wrong' }).subscribe({
      error: (err) => {
        expect(err.message).toBe('401 Unauthorized');
        done();
      }
    });
  });
});
