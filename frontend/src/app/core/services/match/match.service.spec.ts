import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { MatchService } from './match.service';
import { Partido, LineupSlotDto, CloseMatchPayload } from 'src/app/shared/models/models';

const API = environment.apiUrl;

/**
 * Tests unitarios del MatchService (frontend).
 * Cubre la gestión de partidos Y la lógica de alineaciones (lineup/acta),
 * ya que ambas responsabilidades residen en este servicio.
 *
 * Usa HttpClientTestingModule para interceptar peticiones sin servidor real.
 *
 * Cobertura:
 *  - getMatchesByTeam:  GET /partidos/equipo/{teamId}
 *  - getMatchById:      GET /partidos/{id}
 *  - getMatches:        GET /partidos (sin filtro) y GET /partidos/equipo/{id} (con filtro)
 *  - getLineup:         GET /alineaciones/partido/{matchId}
 *  - saveLineup:        POST /alineaciones/guardar/{matchId} con cabecera Content-Type
 *  - saveLineupOnly:    POST /alineaciones/guardar/{matchId} con estadisticas
 *  - closeMatchReport:  POST /admin/cerrar-acta con acta completa
 */
describe('MatchService', () => {
  let service: MatchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MatchService]
    });
    service = TestBed.inject(MatchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── getMatchesByTeam ────────────────────────────────────────────────────────

  it('debería hacer GET /partidos/equipo/{teamId}', () => {
    const mockPartidos: Partido[] = [
      { idPartido: 1, rival: 'FC Test', lugar: 'Local', estado: 'PENDIENTE', tipo: 'PARTIDO' } as Partido
    ];

    service.getMatchesByTeam(3).subscribe(partidos => {
      expect(partidos.length).toBe(1);
      expect(partidos[0].rival).toBe('FC Test');
    });

    const req = httpMock.expectOne(`${API}/partidos/equipo/3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPartidos);
  });

  // ─── getMatchById ────────────────────────────────────────────────────────────

  it('debería hacer GET /partidos/{id} y devolver el partido correcto', () => {
    const mockPartido: Partido = {
      idPartido: 7, rival: 'Rival FC', lugar: 'Estadio', estado: 'FINALIZADO', tipo: 'PARTIDO'
    } as Partido;

    service.getMatchById(7).subscribe(partido => {
      expect(partido.idPartido).toBe(7);
      expect(partido.estado).toBe('FINALIZADO');
    });

    const req = httpMock.expectOne(`${API}/partidos/7`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPartido);
  });

  // ─── getMatches ─────────────────────────────────────────────────────────────

  it('debería hacer GET /partidos sin filtros', () => {
    service.getMatches().subscribe();

    const req = httpMock.expectOne(`${API}/partidos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('debería hacer GET /partidos/equipo/{teamId} cuando se pasa filtro de equipo', () => {
    service.getMatches({ teamId: 5 }).subscribe();

    const req = httpMock.expectOne(`${API}/partidos/equipo/5`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ─── getLineup ───────────────────────────────────────────────────────────────

  it('debería hacer GET /alineaciones/partido/{matchId} y devolver la alineación', () => {
    const mockLineup: LineupSlotDto[] = [
      { idJugador: 1, slotId: 'DEL_1', esTitular: true } as LineupSlotDto,
      { idJugador: 2, slotId: 'BENCH_2', esTitular: false } as LineupSlotDto
    ];

    service.getLineup(10).subscribe(lineup => {
      expect(lineup.length).toBe(2);
      expect(lineup[0].slotId).toBe('DEL_1');
      expect(lineup[1].esTitular).toBeFalse();
    });

    const req = httpMock.expectOne(`${API}/alineaciones/partido/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLineup);
  });

  it('debería devolver lista vacía cuando no hay alineación guardada', () => {
    service.getLineup(99).subscribe(lineup => {
      expect(lineup).toEqual([]);
    });

    const req = httpMock.expectOne(`${API}/alineaciones/partido/99`);
    req.flush([]);
  });

  // ─── saveLineup ──────────────────────────────────────────────────────────────

  it('debería hacer POST /alineaciones/guardar/{matchId} con Content-Type JSON', () => {
    const lineup: LineupSlotDto[] = [
      { idJugador: 5, slotId: 'MED_1', esTitular: true } as LineupSlotDto
    ];

    service.saveLineup(10, lineup).subscribe();

    const req = httpMock.expectOne(`${API}/alineaciones/guardar/10`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(lineup);
    req.flush(null);
  });

  // ─── saveLineupOnly ──────────────────────────────────────────────────────────

  it('debería hacer POST /alineaciones/guardar/{matchId} con estadisticas del acta', () => {
    const actaData: CloseMatchPayload = {
      idPartido: 15,
      estadisticas: [
        { idJugador: 1, goles: 2, asistencias: 0 } as any
      ]
    } as CloseMatchPayload;

    service.saveLineupOnly(actaData).subscribe();

    const req = httpMock.expectOne(`${API}/alineaciones/guardar/15`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(actaData.estadisticas);
    req.flush(null);
  });

  // ─── closeMatchReport ────────────────────────────────────────────────────────

  it('debería hacer POST /admin/cerrar-acta con el acta completa', () => {
    const acta: CloseMatchPayload = {
      idPartido: 20,
      golesFavor: 3,
      golesContra: 1,
      estadisticas: []
    } as CloseMatchPayload;

    service.closeMatchReport(acta).subscribe();

    const req = httpMock.expectOne(`${API}/admin/cerrar-acta`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(acta);
    req.flush(null);
  });

  // ─── error handling ──────────────────────────────────────────────────────────

  it('debería propagar el error HTTP cuando el servidor devuelve 404', () => {
    let errorReceived = false;

    service.getMatchById(9999).subscribe({
      error: () => { errorReceived = true; }
    });

    const req = httpMock.expectOne(`${API}/partidos/9999`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(errorReceived).toBeTrue();
  });
});
