import { Component, OnInit, DestroyRef, inject, ViewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { Jugador, Partido, LineupSlotDto, EquipoResumen } from 'src/app/shared/models/models';

interface FieldPlayer {
  id: string;
  player: Jugador;
  top: number;
  left: number;
}

interface RivalPlayer {
  id: number;
  top: number;
  left: number;
}

interface DrawPath {
  color: string;
  points: { x: number; y: number }[];
}

interface PhaseSnapshot {
  players: { id: string; playerId: string; top: number; left: number }[];
}

interface StorageData {
  attack: PhaseSnapshot | null;
  defense: PhaseSnapshot | null;
  rival: { id: number; top: number; left: number }[];
  paths: DrawPath[];
}

type Phase = 'attack' | 'defense';

interface IonSelectChangeEvent {
  detail: { value: string };
}

@Component({
  selector: 'app-tactics-pro',
  templateUrl: './tactics-pro.page.html',
  styleUrls: ['./tactics-pro.page.scss'],
})
export class TacticsProPage implements OnInit {

  private destroyRef = inject(DestroyRef);

  loading = true;
  matchId = 0;
  matchInfo: Partido | null = null;
  currentTeamId: number | null = null;
  allTeamPlayers: Jugador[] = [];

  formations = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];
  selectedFormation = '4-3-3';

  fieldPlayers: FieldPlayer[] = [];
  bench: Jugador[] = [];

  showRival = false;
  rivalPlayers: RivalPlayer[] = this.defaultRivalPositions();

  sidebarOpen = false;
  benchOpen = false;

  currentPhase: Phase = 'attack';
  private phaseCache: Record<Phase, PhaseSnapshot | null> = { attack: null, defense: null };

  // Canvas
  @ViewChild('tacticCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  isDrawingMode = false;
  drawColor = '#7c3aed';
  drawColors = ['#ffffff', '#7c3aed', '#ff4961', '#ffd534'];
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private savedPaths: DrawPath[] = [];
  private currentPathPoints: { x: number; y: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private playerSvc: PlayerService,
    private matchSvc: MatchService,
    private notificationSvc: NotificationService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('matchId');
    if (idParam) {
      this.matchId = +idParam;
      this.loadData();
    } else {
      this.loading = false;
    }
  }

  // ─── CARGA ────────────────────────────────────────────────

  private loadData() {
    this.matchSvc.getMatchById(this.matchId).pipe(
      switchMap((match: Partido) => {
        this.matchInfo = match;
        const teamObj = match.equipo as EquipoResumen | undefined;
        this.currentTeamId = teamObj?.id ?? teamObj?.idEquipo ?? match.idEquipo ?? null;

        if (!this.currentTeamId) {
          return of({ players: [] as Jugador[], savedSlots: [] as LineupSlotDto[] });
        }
        return forkJoin({
          players: this.playerSvc.getAllPlayers(),
          savedSlots: this.matchSvc.getLineup(this.matchId)
        });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        const { players, savedSlots } = result as { players: Jugador[]; savedSlots: LineupSlotDto[] };

        const teamPlayers = players.filter((p: Jugador) => {
          const ep = p.equipoPrincipal;
          const pTeamId = typeof ep === 'object' ? (ep?.id ?? ep?.idEquipo) : ep;
          return String(pTeamId) === String(this.currentTeamId);
        });

        const uniqueMap = new Map<string, Jugador>();
        teamPlayers.forEach(p => {
          const uid = this.getPlayerId(p);
          if (uid && !uniqueMap.has(uid)) uniqueMap.set(uid, p);
        });
        this.allTeamPlayers = Array.from(uniqueMap.values());

        this.applyOfficialLineup(savedSlots);
        this.restoreFromStorage();
        this.loading = false;
        setTimeout(() => this.initCanvas(), 50);
      },
      error: () => { this.loading = false; }
    });
  }

  private applyOfficialLineup(savedSlots: LineupSlotDto[]) {
    if (!Array.isArray(savedSlots) || savedSlots.length === 0) {
      this.bench = [...this.allTeamPlayers];
      this.fieldPlayers = [];
      return;
    }

    // Detectar formación
    const pitchSlots = savedSlots.filter(s => s.slotId && !s.slotId.startsWith('BENCH'));
    const defMax = Math.max(0, ...pitchSlots.filter(s => s.slotId!.startsWith('DEF')).map(s => parseInt(s.slotId!.split('-')[1])));
    const midMax = Math.max(0, ...pitchSlots.filter(s => s.slotId!.startsWith('MID')).map(s => parseInt(s.slotId!.split('-')[1])));
    const fwdMax = Math.max(0, ...pitchSlots.filter(s => s.slotId!.startsWith('FWD')).map(s => parseInt(s.slotId!.split('-')[1])));

    if (defMax > 0 && midMax > 0 && fwdMax > 0) {
      const detected = `${defMax}-${midMax}-${fwdMax}`;
      this.selectedFormation = this.formations.includes(detected) ? detected : '4-3-3';
    }

    // Mapear slotId → posición en %
    const posMap = this.buildSlotPositions(pitchSlots);
    const fieldIds = new Set<string>();

    this.fieldPlayers = pitchSlots
      .map(saved => {
        const playerId = saved.idJugador ?? saved.jugador?.idJugador;
        if (!playerId) return null;
        const player = this.allTeamPlayers.find(p => this.getPlayerId(p) === String(playerId));
        if (!player) return null;
        const pos = posMap.get(saved.slotId!) ?? { top: 50, left: 50 };
        fieldIds.add(this.getPlayerId(player));
        return { id: saved.slotId!, player, top: pos.top, left: pos.left };
      })
      .filter((fp): fp is FieldPlayer => fp !== null);

    this.bench = this.allTeamPlayers.filter(p => !fieldIds.has(this.getPlayerId(p)));
  }

  private buildSlotPositions(slots: LineupSlotDto[]): Map<string, { top: number; left: number }> {
    const gk  = slots.filter(s => s.slotId!.startsWith('GK'));
    const def = slots.filter(s => s.slotId!.startsWith('DEF'));
    const mid = slots.filter(s => s.slotId!.startsWith('MID'));
    const fwd = slots.filter(s => s.slotId!.startsWith('FWD'));
    const map = new Map<string, { top: number; left: number }>();
    gk.forEach((s, i)  => map.set(s.slotId!, { top: 84, left: this.spread(gk.length, i) }));
    def.forEach((s, i) => map.set(s.slotId!, { top: 67, left: this.spread(def.length, i) }));
    mid.forEach((s, i) => map.set(s.slotId!, { top: 48, left: this.spread(mid.length, i) }));
    fwd.forEach((s, i) => map.set(s.slotId!, { top: 20, left: this.spread(fwd.length, i) }));
    return map;
  }

  private spread(count: number, index: number): number {
    if (count === 1) return 50;
    return 10 + index * (80 / (count - 1));
  }

  // ─── FASES ────────────────────────────────────────────────

  private restoreFromStorage() {
    const stored = localStorage.getItem(this.storageKey());
    if (!stored) return;
    try {
      const data = JSON.parse(stored) as StorageData;
      this.phaseCache.attack = data.attack ?? null;
      this.phaseCache.defense = data.defense ?? null;
      if (data.rival?.length) this.rivalPlayers = data.rival;
      if (data.paths?.length) this.savedPaths = data.paths;
      if (data.attack) this.applyPhaseSnapshot(data.attack);
    } catch { }
  }

  private applyPhaseSnapshot(snapshot: PhaseSnapshot) {
    const fieldIds = new Set<string>();
    this.fieldPlayers = snapshot.players
      .map(entry => {
        const player = this.allTeamPlayers.find(p => this.getPlayerId(p) === entry.playerId);
        if (!player) return null;
        fieldIds.add(entry.playerId);
        return { id: entry.id, player, top: entry.top, left: entry.left } as FieldPlayer;
      })
      .filter((fp): fp is FieldPlayer => fp !== null);

    this.bench = this.allTeamPlayers.filter(p => !fieldIds.has(this.getPlayerId(p)));
  }

  private captureCurrentPhase(): PhaseSnapshot {
    return {
      players: this.fieldPlayers.map(fp => ({
        id: fp.id,
        playerId: this.getPlayerId(fp.player),
        top: fp.top,
        left: fp.left
      }))
    };
  }

  setPhase(phase: Phase) {
    if (phase === this.currentPhase) return;
    this.phaseCache[this.currentPhase] = this.captureCurrentPhase();
    this.currentPhase = phase;
    const snapshot = this.phaseCache[phase];
    if (snapshot) this.applyPhaseSnapshot(snapshot);
  }

  savePhases() {
    this.phaseCache[this.currentPhase] = this.captureCurrentPhase();
    const data: StorageData = {
      attack: this.phaseCache.attack,
      defense: this.phaseCache.defense,
      rival: this.rivalPlayers,
      paths: this.savedPaths
    };
    localStorage.setItem(this.storageKey(), JSON.stringify(data));
    this.notificationSvc.success('Estrategia guardada 💾');
  }

  private storageKey(): string {
    return `tactics-pro-${this.matchId}`;
  }

  // ─── DRAG & DROP (libre) ──────────────────────────────────

  onFieldPlayerDragEnded(event: CdkDragEnd, fp: FieldPlayer) {
    const pitchRect = this.getPitchRect();
    if (!pitchRect) { event.source.reset(); return; }

    const elRect = event.source.element.nativeElement.getBoundingClientRect();
    // El centro visual del token está en (elRect.left, elRect.top) porque
    // el inner wrapper tiene transform: translate(-50%, -50%) sobre ese punto.
    const cx = elRect.left;
    const cy = elRect.top;

    // Si soltó sobre el banquillo → al banco
    const benchRect = this.getBenchRect();
    if (benchRect && cy >= benchRect.top) {
      this.bench.push(fp.player);
      this.fieldPlayers = this.fieldPlayers.filter(f => f.id !== fp.id);
      event.source.reset();
      return;
    }

    // Actualizar posición dentro del campo
    fp.left = Math.max(5, Math.min(95, ((cx - pitchRect.left) / pitchRect.width) * 100));
    fp.top  = Math.max(5, Math.min(95, ((cy - pitchRect.top)  / pitchRect.height) * 100));
    event.source.reset();
  }

  onBenchPlayerDragEnded(event: CdkDragEnd, player: Jugador) {
    const pitchRect = this.getPitchRect();
    if (!pitchRect) { event.source.reset(); return; }

    const elRect = event.source.element.nativeElement.getBoundingClientRect();
    const cx = elRect.left + elRect.width / 2;
    const cy = elRect.top + elRect.height / 2;

    const overPitch = cx >= pitchRect.left && cx <= pitchRect.right &&
                      cy >= pitchRect.top  && cy <= pitchRect.bottom;

    if (overPitch) {
      const left = Math.max(5, Math.min(95, ((cx - pitchRect.left) / pitchRect.width) * 100));
      const top  = Math.max(5, Math.min(95, ((cy - pitchRect.top)  / pitchRect.height) * 100));
      this.fieldPlayers.push({ id: `FIELD-${this.getPlayerId(player)}`, player, top, left });
      this.bench = this.bench.filter(p => this.getPlayerId(p) !== this.getPlayerId(player));
    }

    event.source.reset();
  }

  onRivalDragEnded(event: CdkDragEnd, rp: RivalPlayer) {
    const pitchRect = this.getPitchRect();
    if (!pitchRect) { event.source.reset(); return; }

    const elRect = event.source.element.nativeElement.getBoundingClientRect();
    // Mismo patrón: inner wrapper centrado con translate(-50%, -50%)
    rp.left = Math.max(3, Math.min(97, ((elRect.left - pitchRect.left) / pitchRect.width) * 100));
    rp.top  = Math.max(3, Math.min(97, ((elRect.top  - pitchRect.top)  / pitchRect.height) * 100));
    event.source.reset();
  }

  private getPitchRect(): DOMRect | null {
    return (document.querySelector('.tactical-layer') as HTMLElement)?.getBoundingClientRect() ?? null;
  }

  private getBenchRect(): DOMRect | null {
    return (document.querySelector('.bench-sheet') as HTMLElement)?.getBoundingClientRect() ?? null;
  }

  // ─── RIVAL ────────────────────────────────────────────────

  toggleRival() { this.showRival = !this.showRival; }
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  toggleBench() { this.benchOpen = !this.benchOpen; }

  private defaultRivalPositions(): RivalPlayer[] {
    return [
      { id: 1,  top: 10, left: 50 },
      { id: 2,  top: 26, left: 18 }, { id: 3,  top: 26, left: 38 },
      { id: 4,  top: 26, left: 62 }, { id: 5,  top: 26, left: 82 },
      { id: 6,  top: 40, left: 18 }, { id: 7,  top: 40, left: 38 },
      { id: 8,  top: 40, left: 62 }, { id: 9,  top: 40, left: 82 },
      { id: 10, top: 20, left: 35 }, { id: 11, top: 20, left: 65 },
    ];
  }

  // ─── FORMACIÓN ────────────────────────────────────────────

  onFormationChange(event: IonSelectChangeEvent) {
    this.selectedFormation = event.detail.value;

    const gk  = this.fieldPlayers.filter(fp => this.getPositionGroup(fp.player.posicion) === 'GK');
    const def = this.fieldPlayers.filter(fp => this.getPositionGroup(fp.player.posicion) === 'DEF');
    const mid = this.fieldPlayers.filter(fp => this.getPositionGroup(fp.player.posicion) === 'MID');
    const fwd = this.fieldPlayers.filter(fp => this.getPositionGroup(fp.player.posicion) === 'FWD');

    gk.forEach( (fp, i) => { fp.top = 84; fp.left = this.spread(gk.length,  i); });
    def.forEach((fp, i) => { fp.top = 67; fp.left = this.spread(def.length, i); });
    mid.forEach((fp, i) => { fp.top = 48; fp.left = this.spread(mid.length, i); });
    fwd.forEach((fp, i) => { fp.top = 20; fp.left = this.spread(fwd.length, i); });

    // Forzar nueva referencia para que Angular detecte el cambio
    this.fieldPlayers = [...this.fieldPlayers];
  }

  private getPositionGroup(posicion: string): 'GK' | 'DEF' | 'MID' | 'FWD' | 'UNKNOWN' {
    if (!posicion) return 'UNKNOWN';
    const p = posicion.toUpperCase();
    if (p.includes('PORTERO') || p.includes('GOALKEEPER')) return 'GK';
    if (p.includes('DEFENSA') || p.includes('DEFENDER'))   return 'DEF';
    if (p.includes('MEDIO')   || p.includes('MIDFIELDER')) return 'MID';
    if (p.includes('DELANTERO') || p.includes('FORWARD') || p.includes('STRIKER')) return 'FWD';
    return 'UNKNOWN';
  }

  // ─── CANVAS ───────────────────────────────────────────────

  private initCanvas() {
    if (!this.canvasRef?.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (parent) { canvas.width = parent.offsetWidth; canvas.height = parent.offsetHeight; }
    this.ctx = canvas.getContext('2d');
    this.applyCtxStyle();
    this.redrawPaths();
  }

  private applyCtxStyle() {
    if (!this.ctx) return;
    this.ctx.strokeStyle = this.drawColor;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  toggleDrawMode() {
    this.isDrawingMode = !this.isDrawingMode;
    this.isDrawing = false;
  }

  setDrawColor(color: string) {
    this.drawColor = color;
    if (this.ctx) this.ctx.strokeStyle = color;
  }

  clearCanvas() {
    if (!this.ctx || !this.canvasRef?.nativeElement) return;
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.savedPaths = [];
    this.currentPathPoints = [];
  }

  onPointerDown(event: PointerEvent) {
    if (!this.isDrawingMode || !this.ctx) return;
    this.isDrawing = true;
    this.currentPathPoints = [];
    const pos = this.getCanvasPos(event);
    this.currentPathPoints.push(pos);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    event.preventDefault();
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDrawing || !this.ctx) return;
    const pos = this.getCanvasPos(event);
    this.currentPathPoints.push(pos);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    event.preventDefault();
  }

  onPointerUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.currentPathPoints.length > 1) {
      this.savedPaths.push({ color: this.drawColor, points: [...this.currentPathPoints] });
    }
    this.currentPathPoints = [];
  }

  private redrawPaths() {
    if (!this.ctx || !this.canvasRef?.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const path of this.savedPaths) {
      if (path.points.length < 2) continue;
      this.ctx.strokeStyle = path.color;
      this.ctx.beginPath();
      this.ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.slice(1).forEach(p => this.ctx!.lineTo(p.x, p.y));
      this.ctx.stroke();
    }
    this.applyCtxStyle();
  }

  private getCanvasPos(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  // ─── UTILS ────────────────────────────────────────────────

  private getPlayerId(player: Jugador): string {
    return String(player.idJugador ?? player.id ?? player.usuario?.id ?? player.usuario?.idUsuario);
  }

  getBorderColor(posicion: string): string {
    if (!posicion) return '#9ca3af';
    const pos = posicion.toUpperCase();
    if (pos.includes('PORTERO') || pos.includes('GOALKEEPER')) return '#fbbf24';
    if (pos.includes('DEFENSA') || pos.includes('DEFENDER')) return '#38bdf8';
    if (pos.includes('MEDIO') || pos.includes('MIDFIELDER')) return '#4ade80';
    if (pos.includes('DELANTERO') || pos.includes('FORWARD') || pos.includes('STRIKER')) return '#f87171';
    return '#9ca3af';
  }

  getShortName(nombre: string): string {
    return nombre ? nombre.split(' ')[0] : 'Player';
  }

  getProfileImage(player: Jugador): string {
    return player?.usuario?.fotoUrl || 'assets/img/default-player.png';
  }

  getRivalName(): string {
    return this.matchInfo?.rival ?? 'Partido';
  }
}
