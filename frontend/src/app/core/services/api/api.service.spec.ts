import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { ApiService } from './api.service';

const BASE = environment.apiUrl;

/**
 * Tests unitarios del ApiService.
 * ApiService es la capa base de comunicación HTTP — todos los demás servicios
 * que usan ApiService (como AuthService) dependen de que éste funcione bien.
 *
 * Usa HttpClientTestingModule para interceptar peticiones sin servidor real.
 *
 * Cobertura:
 *  - get:    construye la URL correcta, soporta query params
 *  - post:   envía el body correctamente
 *  - put:    envía el body correctamente
 *  - delete: construye la URL correcta
 *  - error:  propaga HttpErrorResponse sin modificarla
 */
describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── get ─────────────────────────────────────────────────────────────────────

  it('debería hacer GET a la URL correcta y devolver los datos', () => {
    const mockData = { mensaje: 'ok' };

    service.get<typeof mockData>('/test-endpoint').subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${BASE}/test-endpoint`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debería añadir query params a la URL en GET', () => {
    service.get('/usuarios', { equipo: 1, activo: true }).subscribe();

    // HttpParams serializa los params en la URL
    const req = httpMock.expectOne(r =>
      r.url === `${BASE}/usuarios` &&
      r.params.get('equipo') === '1' &&
      r.params.get('activo') === 'true'
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('debería ignorar los params con valor undefined en GET', () => {
    service.get('/partidos', { teamId: undefined }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${BASE}/partidos` && !r.params.has('teamId')
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ─── post ────────────────────────────────────────────────────────────────────

  it('debería hacer POST con el body correcto', () => {
    const body = { email: 'test@test.com', password: '123456' };
    const mockResponse = { token: 'fake-jwt' };

    service.post<typeof mockResponse>('/auth/login', body).subscribe(res => {
      expect(res.token).toBe('fake-jwt');
    });

    const req = httpMock.expectOne(`${BASE}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('debería hacer POST con body vacío sin errores', () => {
    service.post('/auth/logout', {}).subscribe();

    const req = httpMock.expectOne(`${BASE}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });

  // ─── put ─────────────────────────────────────────────────────────────────────

  it('debería hacer PUT con el body de actualización', () => {
    const updateData = { nombre: 'Nuevo Nombre', telefono: '666000111' };

    service.put<void>('/usuarios/5', updateData).subscribe();

    const req = httpMock.expectOne(`${BASE}/usuarios/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(null);
  });

  // ─── delete ──────────────────────────────────────────────────────────────────

  it('debería hacer DELETE a la URL correcta', () => {
    service.delete<void>('/usuarios/99').subscribe();

    const req = httpMock.expectOne(`${BASE}/usuarios/99`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ─── error handling ──────────────────────────────────────────────────────────

  it('debería propagar el HttpErrorResponse en GET con status 401', () => {
    let errorStatus = 0;

    service.get('/protected').subscribe({
      error: (err) => { errorStatus = err.status; }
    });

    const req = httpMock.expectOne(`${BASE}/protected`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(errorStatus).toBe(401);
  });

  it('debería propagar el HttpErrorResponse en POST con status 400', () => {
    let errorStatus = 0;

    service.post('/usuarios', {}).subscribe({
      error: (err) => { errorStatus = err.status; }
    });

    const req = httpMock.expectOne(`${BASE}/usuarios`);
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    expect(errorStatus).toBe(400);
  });
});
