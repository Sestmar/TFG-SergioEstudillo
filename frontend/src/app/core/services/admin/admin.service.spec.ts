import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { AdminService } from './admin.service';
import { AdminUserDto, AdminEquipoDto, Partido } from 'src/app/shared/models/models';

const BASE = `${environment.apiUrl}/admin`;

/**
 * Tests unitarios del AdminService (frontend).
 * Usa HttpClientTestingModule para interceptar y verificar las peticiones HTTP
 * sin necesidad de un servidor real.
 *
 * Cobertura:
 *  - getCandidates: GET /admin/candidatos
 *  - createUser:    POST /admin/crear-usuario con payload correcto
 *  - updateUser:    PUT /admin/usuarios/{id}
 *  - deleteUser:    DELETE /admin/usuario/{id}
 *  - getTeams:      GET /admin/equipos
 *  - createMatch:   POST /admin/crear-partido
 *  - deleteEvento:  DELETE /admin/evento/{id}
 *  - getAsistencia: GET /admin/entrenamiento/{id}/asistencia
 */
describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden peticiones HTTP sin gestionar
    httpMock.verify();
  });

  // ─── getCandidates ───────────────────────────────────────────────────────────

  it('debería hacer GET /admin/candidatos y devolver la lista', () => {
    const mockUsers: AdminUserDto[] = [
      { id: 1, nombre: 'Carlos', apellidos: 'García', email: 'c@c.com', rol: 'JUGADOR' } as AdminUserDto
    ];

    service.getCandidates().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].nombre).toBe('Carlos');
    });

    const req = httpMock.expectOne(`${BASE}/candidatos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  // ─── createUser ──────────────────────────────────────────────────────────────

  it('debería hacer POST /admin/crear-usuario con el payload correcto', () => {
    const newUser = { nombre: 'Ana', email: 'ana@test.com', rol: 'JUGADOR', password: '123456' };
    const mockResponse = { id: 99, ...newUser } as unknown as AdminUserDto;

    service.createUser(newUser).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${BASE}/crear-usuario`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResponse);
  });

  // ─── updateUser ──────────────────────────────────────────────────────────────

  it('debería hacer PUT /admin/usuarios/{id} con el payload correcto', () => {
    const payload = { nombre: 'Actualizado', telefono: '666999000' };

    service.updateUser(5, payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/usuarios/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(null);
  });

  // ─── deleteUser ──────────────────────────────────────────────────────────────

  it('debería hacer DELETE /admin/usuario/{id}', () => {
    service.deleteUser(10).subscribe();

    const req = httpMock.expectOne(`${BASE}/usuario/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ─── getTeams ────────────────────────────────────────────────────────────────

  it('debería hacer GET /admin/equipos y devolver la lista de equipos', () => {
    const mockTeams: AdminEquipoDto[] = [
      { idEquipo: 1, nombre: 'Equipo A', jugadoresCount: 11 } as AdminEquipoDto
    ];

    service.getTeams().subscribe(teams => {
      expect(teams.length).toBe(1);
      expect(teams[0].nombre).toBe('Equipo A');
    });

    const req = httpMock.expectOne(`${BASE}/equipos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTeams);
  });

  // ─── createMatch ─────────────────────────────────────────────────────────────

  it('debería hacer POST /admin/crear-partido con los datos del partido', () => {
    const matchData: Partial<Partido> = {
      rival: 'FC Rival',
      lugar: 'Campo Norte',
      tipo: 'PARTIDO'
    };

    service.createMatch(matchData).subscribe();

    const req = httpMock.expectOne(`${BASE}/crear-partido`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(matchData);
    req.flush({ idPartido: 1, ...matchData });
  });

  // ─── deleteEvento ────────────────────────────────────────────────────────────

  it('debería hacer DELETE /admin/evento/{id}', () => {
    service.deleteEvento(42).subscribe();

    const req = httpMock.expectOne(`${BASE}/evento/42`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ─── getAsistencia ───────────────────────────────────────────────────────────

  it('debería hacer GET /admin/entrenamiento/{id}/asistencia', () => {
    const mockAsistencia = [{ idJugador: 1, estado: 'PRESENTE' }];

    service.getAsistencia(7).subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0].estado).toBe('PRESENTE');
    });

    const req = httpMock.expectOne(`${BASE}/entrenamiento/7/asistencia`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAsistencia);
  });

  // ─── assignTeam ──────────────────────────────────────────────────────────────

  it('debería hacer POST /admin/asignar-equipo con idUsuario e idEquipo', () => {
    service.assignTeam(3, 8).subscribe();

    const req = httpMock.expectOne(`${BASE}/asignar-equipo`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ idUsuario: 3, idEquipo: 8 });
    req.flush(null);
  });

  // ─── error handling ──────────────────────────────────────────────────────────

  it('debería propagar el error HTTP cuando el servidor devuelve 500', () => {
    let errorReceived = false;

    service.getTeams().subscribe({
      error: () => { errorReceived = true; }
    });

    const req = httpMock.expectOne(`${BASE}/equipos`);
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });

    expect(errorReceived).toBeTrue();
  });
});
