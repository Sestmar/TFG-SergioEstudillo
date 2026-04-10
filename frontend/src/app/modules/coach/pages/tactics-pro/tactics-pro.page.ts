import { Component, OnInit, DestroyRef, inject, ViewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { Jugador, Partido, LineupSlotDto, EquipoResumen } from 'src/app/shared/models/models';

interface PitchSlot {
  id: string;
  player: Jugador | null;
}

interface PhaseSnapshot {
  formation: string;
  slots: { id: string; playerId: string }[];
}

interface IonSelectChangeEvent {
  detail: { value: string };
}

type Phase = 'attack' | 'defense';

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

  forwards: PitchSlot[] = [];
  midfielders: PitchSlot[] = [];
  defenders: PitchSlot[] = [];
  goalkeeper: PitchSlot[] = [];
  bench: Jugador[] = [];
  allSlotIds: string[] = [];

  currentPhase: Phase = 'attack';
  isTransitioning = false;
  isDrawingMode = false;

  @ViewChild('tacticCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;

  private phaseCache: Record<Phase, PhaseSnapshot | null> = { attack: null, defense: null };

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
        this.restorePhases();
        this.loading = false;
        setTimeout(() => this.initCanvas(), 50);
      },
      error: () => { this.loading = false; }
    });
  }

  private applyOfficialLineup(savedSlots: LineupSlotDto[]) {
    if (Array.isArray(savedSlots) && savedSlots.length > 0) {
      let maxDef = 0, maxMid = 0, maxFwd = 0;
      savedSlots.forEach(slot => {
        const id = slot.slotId ?? '';
        if (id.startsWith('DEF-')) { const n = parseInt(id.split('-')[1]); if (n > maxDef) maxDef = n; }
        if (id.startsWith('MID-')) { const n = parseInt(id.split('-')[1]); if (n > maxMid) maxMid = n; }
        if (id.startsWith('FWD-')) { const n = parseInt(id.split('-')[1]); if (n > maxFwd) maxFwd = n; }
      });
      const detected = (maxDef > 0 && maxMid > 0 && maxFwd > 0) ? `${maxDef}-${maxMid}-${maxFwd}` : '4-3-3';
      this.selectedFormation = this.formations.includes(detected) ? detected : '4-3-3';
    } else {
      this.selectedFormation = '4-3-3';
    }

    this.updatePitchRows(this.selectedFormation);

    const pitchPlayerIds = new Set<string>();

    if (Array.isArray(savedSlots) && savedSlots.length > 0) {
      savedSlots.forEach(saved => {
        const playerId = saved.idJugador ?? saved.jugador?.idJugador;
        if (!playerId || !saved.slotId || saved.slotId.startsWith('BENCH')) return;
        const player = this.allTeamPlayers.find(p => this.getPlayerId(p) === String(playerId));
        if (!player) return;
        const slot = this.findSlot(saved.slotId);
        if (slot) {
          slot.player = player;
          pitchPlayerIds.add(this.getPlayerId(player));
        }
      });
    }

    // Bench = todos los jugadores del equipo que no están en el campo
    this.bench = this.allTeamPlayers.filter(p => !pitchPlayerIds.has(this.getPlayerId(p)));
  }

  // ─── FASES ────────────────────────────────────────────────

  private restorePhases() {
    const stored = localStorage.getItem(this.storageKey());
    if (!stored) return;
    try {
      const data = JSON.parse(stored) as Record<Phase, PhaseSnapshot>;
      this.phaseCache.attack = data.attack ?? null;
      this.phaseCache.defense = data.defense ?? null;
      if (data.attack) this.applyPhaseSnapshot(data.attack);
    } catch { }
  }

  private applyPhaseSnapshot(snapshot: PhaseSnapshot) {
    this.selectedFormation = snapshot.formation;
    this.updatePitchRows(this.selectedFormation);

    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    const onPitchIds = new Set<string>();

    snapshot.slots.forEach(entry => {
      const slot = allSlots.find(s => s.id === entry.id);
      const player = this.allTeamPlayers.find(p => this.getPlayerId(p) === entry.playerId);
      if (slot && player) {
        slot.player = player;
        onPitchIds.add(entry.playerId);
      }
    });

    this.bench = this.allTeamPlayers.filter(p => !onPitchIds.has(this.getPlayerId(p)));
  }

  private captureCurrentPhase(): PhaseSnapshot {
    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    return {
      formation: this.selectedFormation,
      slots: allSlots
        .filter(s => s.player !== null)
        .map(s => ({ id: s.id, playerId: this.getPlayerId(s.player!) }))
    };
  }

  setPhase(phase: Phase) {
    if (phase === this.currentPhase || this.isTransitioning) return;

    this.phaseCache[this.currentPhase] = this.captureCurrentPhase();
    this.isTransitioning = true;

    setTimeout(() => {
      this.currentPhase = phase;
      const snapshot = this.phaseCache[phase];
      if (snapshot) {
        this.applyPhaseSnapshot(snapshot);
      }
      this.isTransitioning = false;
    }, 200);
  }

  savePhases() {
    this.phaseCache[this.currentPhase] = this.captureCurrentPhase();
    localStorage.setItem(this.storageKey(), JSON.stringify(this.phaseCache));
    this.notificationSvc.success('Estrategia guardada 💾');
  }

  private storageKey(): string {
    return `tactics-pro-${this.matchId}`;
  }

  // ─── CANVAS ───────────────────────────────────────────────

  private initCanvas() {
    if (!this.canvasRef?.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.strokeStyle = '#7c3aed';
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  toggleDrawMode() {
    this.isDrawingMode = !this.isDrawingMode;
    this.isDrawing = false;
  }

  clearCanvas() {
    if (!this.ctx || !this.canvasRef?.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  onPointerDown(event: PointerEvent) {
    if (!this.isDrawingMode || !this.ctx) return;
    this.isDrawing = true;
    const { x, y } = this.getCanvasPos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    event.preventDefault();
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDrawing || !this.ctx) return;
    const { x, y } = this.getCanvasPos(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    event.preventDefault();
  }

  onPointerUp() {
    this.isDrawing = false;
  }

  private getCanvasPos(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  // ─── FORMACIÓN ────────────────────────────────────────────

  onFormationChange(event: IonSelectChangeEvent) {
    this.selectedFormation = event.detail.value;
    this.updatePitchRows(this.selectedFormation);
  }

  updatePitchRows(formation: string) {
    const parts = formation.split('-').map(Number);
    this.goalkeeper = this.resizeRow(this.goalkeeper ?? [], 1, 'GK');
    this.defenders = this.resizeRow(this.defenders ?? [], parts[0], 'DEF');
    this.midfielders = this.resizeRow(this.midfielders ?? [], parts[1], 'MID');
    this.forwards = this.resizeRow(this.forwards ?? [], parts[2], 'FWD');
    this.updateDragConnections();
  }

  private resizeRow(current: PitchSlot[], newSize: number, prefix: string): PitchSlot[] {
    const row: PitchSlot[] = [];
    for (let i = 0; i < newSize; i++) {
      row.push(i < current.length ? current[i] : { id: `${prefix}-${i + 1}`, player: null });
    }
    if (current.length > newSize) {
      current.slice(newSize).forEach(slot => {
        if (slot.player) {
          const exists = this.bench.some(p => this.getPlayerId(p) === this.getPlayerId(slot.player!));
          if (!exists) this.bench.push(slot.player);
        }
      });
    }
    return row;
  }

  private updateDragConnections() {
    this.allSlotIds = [
      'benchList',
      ...this.forwards.map(s => s.id),
      ...this.midfielders.map(s => s.id),
      ...this.defenders.map(s => s.id),
      ...this.goalkeeper.map(s => s.id)
    ];
  }

  // ─── DRAG & DROP ──────────────────────────────────────────

  drop(event: CdkDragDrop<Jugador[]>) {
    if (event.previousContainer === event.container) return;
    const isBenchSource = event.previousContainer.id === 'benchList';
    const isBenchTarget = event.container.id === 'benchList';
    const draggedPlayer: Jugador = event.item.data;
    if (!draggedPlayer) return;

    if (isBenchTarget) {
      const exists = this.bench.some(p => this.getPlayerId(p) === this.getPlayerId(draggedPlayer));
      if (!exists) this.bench.push(draggedPlayer);
      this.clearSlot(event.previousContainer.id);
      return;
    }

    const targetSlot = this.findSlot(event.container.id);
    if (!targetSlot) return;

    const existingPlayer = targetSlot.player;
    targetSlot.player = draggedPlayer;

    if (isBenchSource) {
      const idx = this.bench.findIndex(p => this.getPlayerId(p) === this.getPlayerId(draggedPlayer));
      if (idx > -1) this.bench.splice(idx, 1);
      if (existingPlayer) this.bench.push(existingPlayer);
    } else {
      // Pitch-to-pitch: intercambio directo
      const originSlot = this.findSlot(event.previousContainer.id);
      if (originSlot) originSlot.player = existingPlayer ?? null;
    }
  }

  private findSlot(slotId: string): PitchSlot | undefined {
    return [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper]
      .find(s => s.id === slotId);
  }

  private clearSlot(slotId: string) {
    const slot = this.findSlot(slotId);
    if (slot) slot.player = null;
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

  getSlotLabel(slotId: string): string {
    if (slotId.startsWith('GK')) return 'POR';
    if (slotId.startsWith('DEF')) return 'DEF';
    if (slotId.startsWith('MID')) return 'MED';
    if (slotId.startsWith('FWD')) return 'DEL';
    return '';
  }
}
