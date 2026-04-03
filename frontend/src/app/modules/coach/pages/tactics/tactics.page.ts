import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { Jugador, Partido, LineupSlotDto, EquipoResumen } from 'src/app/shared/models/models';
import { ConvocationModalComponent } from 'src/app/shared/models/convocation-modal/convocation-modal.component';

interface PitchSlot {
  id: string;
  player: Jugador | null;
  isCaptain?: boolean;
  isPenaltyTaker?: boolean;
  isFreeKickTaker?: boolean;
}

interface IonSelectChangeEvent {
  detail: { value: string };
}

@Component({
  selector: 'app-tactics',
  templateUrl: './tactics.page.html',
  styleUrls: ['./tactics.page.scss'],
})
export class TacticsPage implements OnInit {

  private destroyRef = inject(DestroyRef);
  loading = true;
  saving = false;
  matchId: number = 0;
  matchInfo: Partido | null = null;
  currentTeamId: number | null = null;

  bench: Jugador[] = [];
  allTeamPlayers: Jugador[] = [];

  formations = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];
  selectedFormation = '4-3-3';

  forwards: PitchSlot[] = [];
  midfielders: PitchSlot[] = [];
  defenders: PitchSlot[] = [];
  goalkeeper: PitchSlot[] = [];

  allSlotIds: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private playerSvc: PlayerService,
    private matchSvc: MatchService,
    private authSvc: AuthService,
    private notificationSvc: NotificationService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
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

  // --- CARGA DE DATOS (linearizada con switchMap) ---
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

        // Filtrar y deduplicar jugadores del equipo
        const teamPlayers = players.filter((p: Jugador) => {
          const ep = p.equipoPrincipal;
          const pTeamId = typeof ep === 'object' ? (ep?.id ?? ep?.idEquipo) : ep;
          return String(pTeamId) === String(this.currentTeamId);
        });

        const uniquePlayersMap = new Map<string, Jugador>();
        teamPlayers.forEach((p: Jugador) => {
          const uniqueId = this.getPlayerId(p);
          if (uniqueId && !uniquePlayersMap.has(uniqueId)) {
            uniquePlayersMap.set(uniqueId, p);
          }
        });
        this.allTeamPlayers = Array.from(uniquePlayersMap.values());

        // Aplicar lineup guardado
        this.applyLoadedLineup(savedSlots);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private applyLoadedLineup(savedSlots: LineupSlotDto[]) {
    if (Array.isArray(savedSlots) && savedSlots.length > 0) {
      let maxDef = 0, maxMid = 0, maxFwd = 0;
      savedSlots.forEach((slot: LineupSlotDto) => {
        const id = slot.slotId ?? '';
        if (id.startsWith('DEF-')) { const num = parseInt(id.split('-')[1]); if (num > maxDef) maxDef = num; }
        if (id.startsWith('MID-')) { const num = parseInt(id.split('-')[1]); if (num > maxMid) maxMid = num; }
        if (id.startsWith('FWD-')) { const num = parseInt(id.split('-')[1]); if (num > maxFwd) maxFwd = num; }
      });

      if (maxDef > 0 && maxMid > 0 && maxFwd > 0) {
        const detectedFormation = `${maxDef}-${maxMid}-${maxFwd}`;
        this.selectedFormation = this.formations.includes(detectedFormation) ? detectedFormation : '4-3-3';
      } else {
        this.selectedFormation = '4-3-3';
      }
    } else {
      this.selectedFormation = '4-3-3';
      this.bench = [...this.allTeamPlayers];
    }

    this.updatePitchRows(this.selectedFormation);

    if (Array.isArray(savedSlots) && savedSlots.length > 0) {
      const savedIds = new Set<string>();

      savedSlots.forEach((saved: LineupSlotDto) => {
        const playerId = saved.idJugador ?? saved.jugador?.idJugador;
        if (playerId) savedIds.add(String(playerId));

        const playerObj = this.allTeamPlayers.find(p => this.getPlayerId(p) === String(playerId));

        if (playerObj) {
          if (!saved.slotId || saved.slotId.startsWith('BENCH')) {
            this.bench.push(playerObj);
          } else {
            const targetSlot = this.findSlot(saved.slotId);
            if (targetSlot) {
              targetSlot.player = playerObj;
              targetSlot.isCaptain = saved.esCapitan ?? false;
              targetSlot.isPenaltyTaker = saved.esLanzadorPenaltis ?? false;
              targetSlot.isFreeKickTaker = saved.esLanzadorFaltas ?? false;
            } else {
              this.bench.push(playerObj);
            }
          }
        }
      });
    }
  }

  // --- CONVOCATION LOGIC ---
  async openConvocation() {
    const currentTitulars = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper]
                            .filter(s => s.player !== null)
                            .map(s => s.player!);

    const currentSquad = [...this.bench, ...currentTitulars];

    const modal = await this.modalCtrl.create({
      component: ConvocationModalComponent,
      componentProps: {
        allPlayers: this.allTeamPlayers,
        currentSquad: currentSquad
      },
      cssClass: 'night-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.applyNewConvocation(data);
    }
  }

  applyNewConvocation(selectedPlayers: Jugador[]) {
    const selectedIds = new Set(selectedPlayers.map(p => this.getPlayerId(p)));

    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    allSlots.forEach(slot => {
      if (slot.player && !selectedIds.has(this.getPlayerId(slot.player))) {
        this.clearSlot(slot.id);
      }
    });

    this.bench = selectedPlayers.filter(p => {
      const isOnPitch = allSlots.some(slot => slot.player && this.getPlayerId(slot.player) === this.getPlayerId(p));
      return !isOnPitch;
    });

    this.saveTactics(true);
  }

  // --- ROLES LOGIC ---
  async openPlayerOptions(slot: PitchSlot) {
    if (!slot.player) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Instrucciones para ${slot.player.usuario.nombre}`,
      cssClass: 'tactics-action-sheet',
      buttons: [
        {
          text: slot.isCaptain ? 'Quitar Capitanía' : 'Hacer Capitán (C)',
          icon: 'ribbon-outline',
          handler: () => { this.setCaptain(slot); }
        },
        {
          text: slot.isPenaltyTaker ? 'Quitar Penaltis' : 'Lanzador de Penaltis (P)',
          icon: 'football-outline',
          handler: () => { slot.isPenaltyTaker = !slot.isPenaltyTaker; }
        },
        {
          text: slot.isFreeKickTaker ? 'Quitar Faltas' : 'Lanzador de Faltas (F)',
          icon: 'alert-circle-outline',
          handler: () => { slot.isFreeKickTaker = !slot.isFreeKickTaker; }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  setCaptain(targetSlot: PitchSlot) {
    if (targetSlot.isCaptain) {
      targetSlot.isCaptain = false;
      return;
    }
    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    allSlots.forEach(s => s.isCaptain = false);
    targetSlot.isCaptain = true;
  }

  // --- FORMATION & DATA LOGIC ---
  onFormationChange(event: IonSelectChangeEvent) {
    const newFormation = event.detail.value;
    this.selectedFormation = newFormation;
    this.updatePitchRows(newFormation);
  }

  updatePitchRows(formation: string) {
    const parts = formation.split('-').map(Number);
    const defCount = parts[0];
    const midCount = parts[1];
    const fwdCount = parts[2];

    this.goalkeeper = this.resizeRow(this.goalkeeper ?? [], 1, 'GK');
    this.defenders = this.resizeRow(this.defenders ?? [], defCount, 'DEF');
    this.midfielders = this.resizeRow(this.midfielders ?? [], midCount, 'MID');
    this.forwards = this.resizeRow(this.forwards ?? [], fwdCount, 'FWD');

    this.updateDragConnections();
  }

  private resizeRow(currentRow: PitchSlot[], newSize: number, prefix: string): PitchSlot[] {
    const newRow: PitchSlot[] = [];
    for (let i = 0; i < newSize; i++) {
      if (i < currentRow.length) {
        newRow.push(currentRow[i]);
      } else {
        newRow.push({ id: `${prefix}-${i + 1}`, player: null });
      }
    }
    if (currentRow.length > newSize) {
      const overflowSlots = currentRow.slice(newSize);
      overflowSlots.forEach(slot => {
        if (slot.player) {
          const exists = this.bench.some(p => this.getPlayerId(p) === this.getPlayerId(slot.player!));
          if (!exists) this.bench.push(slot.player);
        }
      });
    }
    return newRow;
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

  async saveTactics(isConvocation: boolean = false) {
    if (!this.matchId) return;
    const allPitchSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    const playersOnPitch = allPitchSlots.filter(s => s.player !== null);

    if (!isConvocation) {
      if (playersOnPitch.length !== 11) {
        await this.notificationSvc.warning(`Alineación incompleta: ${playersOnPitch.length}/11`);
        return;
      }

      if (!this.goalkeeper[0]?.player) {
        await this.notificationSvc.warning('¡Falta el portero!');
        return;
      }
    }

    this.saving = true;

    const pitchPayload: LineupSlotDto[] = playersOnPitch.map(slot => ({
      idPartido: this.matchId,
      idJugador: slot.player?.idJugador ?? slot.player?.id,
      slotId: slot.id,
      esCapitan: slot.isCaptain ?? false,
      esLanzadorPenaltis: slot.isPenaltyTaker ?? false,
      esLanzadorFaltas: slot.isFreeKickTaker ?? false
    }));

    const benchPayload: LineupSlotDto[] = this.bench.map(p => ({
      idPartido: this.matchId,
      idJugador: p.idJugador ?? p.id,
      slotId: `BENCH_${p.idJugador ?? p.id}`,
      esCapitan: false,
      esLanzadorPenaltis: false,
      esLanzadorFaltas: false
    }));

    const fullPayload = [...pitchPayload, ...benchPayload];

    this.matchSvc.saveLineup(this.matchId, fullPayload).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: async () => {
        this.saving = false;
        const msg = isConvocation ? 'Squad List Updated ✅' : 'Tácticas guardadas. 💾';
        await this.notificationSvc.success(msg);
      },
      error: async () => {
        this.saving = false;
        await this.notificationSvc.error('Error al guardar tácticas');
      }
    });
  }

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
    } else {
      const targetSlot = this.findSlot(event.container.id);
      if (!targetSlot) return;
      const existingPlayer = targetSlot.player;

      targetSlot.isCaptain = false;
      targetSlot.isPenaltyTaker = false;
      targetSlot.isFreeKickTaker = false;

      targetSlot.player = draggedPlayer;

      if (isBenchSource) {
        const idx = this.bench.findIndex(p => this.getPlayerId(p) === this.getPlayerId(draggedPlayer));
        if (idx > -1) this.bench.splice(idx, 1);
      } else {
        const originSlot = this.findSlot(event.previousContainer.id);
        if (originSlot) {
          targetSlot.isCaptain = originSlot.isCaptain;
          targetSlot.isPenaltyTaker = originSlot.isPenaltyTaker;
          targetSlot.isFreeKickTaker = originSlot.isFreeKickTaker;
          this.clearSlot(event.previousContainer.id);
        }
      }

      if (existingPlayer) {
        if (isBenchSource) {
          this.bench.push(existingPlayer);
        } else {
          const originSlot = this.findSlot(event.previousContainer.id);
          if (originSlot) originSlot.player = existingPlayer;
        }
      }
    }
  }

  private findSlot(slotId: string): PitchSlot | undefined {
    const all = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    return all.find(s => s.id === slotId);
  }

  private clearSlot(slotId: string) {
    const slot = this.findSlot(slotId);
    if (slot) {
      slot.player = null;
      slot.isCaptain = false;
      slot.isPenaltyTaker = false;
      slot.isFreeKickTaker = false;
    }
  }

  getSlotLabel(slotId: string): string {
    if (slotId.startsWith('GK')) return 'POR';
    if (slotId.startsWith('DEF')) return 'DEF';
    if (slotId.startsWith('MID')) return 'MED';
    if (slotId.startsWith('FWD')) return 'DEL';
    return '';
  }

  getProfileImage(player: Jugador): string {
    if (player?.usuario?.fotoUrl) {
      return player.usuario.fotoUrl;
    }
    return 'assets/img/default-player.png';
  }

  getRivalName(): string {
    return this.matchInfo ? (this.matchInfo.rival ?? 'Partido') : 'Partido';
  }
}
