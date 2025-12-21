import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Player } from 'src/app/shared/models/models';

interface PitchSlot {
  id: string;      
  player: Player | null; 
}

@Component({
  selector: 'app-tactics',
  templateUrl: './tactics.page.html',
  styleUrls: ['./tactics.page.scss'],
})
export class TacticsPage implements OnInit {

  loading = true;
  bench: Player[] = [];

  // --- GRID 5x4 (20 Posiciones) ---
  // Las definimos vacías. El HTML las pintará.
  forwards: PitchSlot[] = this.createRow('FWD');
  midfielders: PitchSlot[] = this.createRow('MID');
  defenders: PitchSlot[] = this.createRow('DEF');
  goalkeeper: PitchSlot[] = this.createRow('GK', 1); // Solo 1 hueco portero

  constructor(
    private playerSvc: PlayerService,
    private authSvc: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadTeam();
  }

  // Crea una fila de 5 huecos vacíos (o n huecos)
  private createRow(prefix: string, count: number = 5): PitchSlot[] {
    return Array(count).fill(null).map((_, i) => ({
      id: `${prefix}-${i + 1}`,
      player: null
    }));
  }

  loadTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const u = user as any;
        const userId = u.id || u.idUsuario;
        if (!userId) return;

        this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`)
        .subscribe({
          next: (equipo: any) => {
             const teamId = equipo.idEquipo || equipo.id;
             this.loadPlayers(teamId);
          },
          error: (err) => { this.loading = false; }
        });
      }
    });
  }

  loadPlayers(teamId: number) {
    this.playerSvc.getAllPlayers().subscribe((res: any) => {
      const all = Array.isArray(res) ? res : (res.data || []);
      const myPlayers = all.filter((p: any) => {
          const pTeamId = p.equipoPrincipal?.idEquipo || p.equipoPrincipal?.id || p.equipoPrincipal;
          return pTeamId == teamId;
      });
      this.bench = myPlayers;
      this.loading = false;
    });
  }

  // --- 🔥 EL CEREBRO DEL MOVIMIENTO 🔥 ---
  drop(event: CdkDragDrop<any>) {
    
    // 1. Si soltamos en el mismo sitio -> No hacer nada
    if (event.previousContainer === event.container) {
      return;
    }

    // Identificamos Origen y Destino
    const isBenchSource = event.previousContainer.id === 'benchList';
    const isBenchTarget = event.container.id === 'benchList';

    // Jugador que estamos arrastrando
    const draggedPlayer = event.previousContainer.data[event.previousIndex] || event.previousContainer.data;

    // A. SOLTAR EN EL BANQUILLO (Descartar del campo)
    if (isBenchTarget) {
      // Mover al array del banquillo
      this.bench.push(draggedPlayer);
      // Vaciar el hueco del campo de donde venía
      this.clearSlot(event.previousContainer.id);
    }
    
    // B. SOLTAR EN EL CAMPO (Fichar o Mover)
    else {
      // Buscamos el slot destino en mis arrays
      const targetSlotId = event.container.id;
      const targetSlot = this.findSlot(targetSlotId);

      if (!targetSlot) return; // Seguridad

      const existingPlayer = targetSlot.player;

      // Asignamos el nuevo jugador al hueco destino
      targetSlot.player = draggedPlayer;

      // ¿Qué hacemos con el origen?
      if (isBenchSource) {
        // Borrar del banquillo
        this.bench.splice(event.previousIndex, 1);
      } else {
        // Venía de otro hueco del campo -> Vaciamos ese hueco
        this.clearSlot(event.previousContainer.id);
      }

      // C. INTERCAMBIO (SWAP): Si había alguien en el destino...
      if (existingPlayer) {
        if (isBenchSource) {
          // Si vine del banquillo, el que estaba en el campo se va al banquillo
          this.bench.push(existingPlayer);
        } else {
          // Si vine del campo, el que estaba en el destino se va al origen (Trueque)
          const originSlot = this.findSlot(event.previousContainer.id);
          if (originSlot) originSlot.player = existingPlayer;
        }
      }
    }
  }

  // Helpers para encontrar huecos
  private findSlot(slotId: string): PitchSlot | undefined {
    const all = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    return all.find(s => s.id === slotId);
  }

  private clearSlot(slotId: string) {
    const slot = this.findSlot(slotId);
    if (slot) slot.player = null;
  }
}