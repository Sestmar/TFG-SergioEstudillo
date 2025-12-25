import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Player, Team } from 'src/app/shared/models/models';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {
  
  myPlayers: Player[] = [];
  // otherPlayers eliminado: El entrenador no ficha.
  
  teams: Team[] = []; // Se mantiene para referenciar nombres si hace falta
  
  coachTeamId: number | null = null; 
  coachTeamName: string = ''; 
  
  loading: boolean = true;
  isModalOpen = false;
  isEditModalOpen = false;
  selectedPlayer: Player | null = null;
  
  injuryData = { tipo: '', duracion: '', notas: '' };

  techData = {
    dorsal: null as number | null,
    posicion: '',
    teamId: null as number | null
  };

  posicionesDisponibles = [
    'PORTERO', 'DEFENSA', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO', 'CENTRAL',
    'MEDIOCENTRO', 'EXTREMO', 'DELANTERO', 'PIVOTE', 'MEDIA_PUNTA'
  ];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService,
    private authSvc: AuthService,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.detectCoachTeam();
    // this.loadTeams(); // Ya no hace falta cargar todos los equipos si no vamos a fichar
  }

  // --- 1. DETECCIÓN DEL EQUIPO DEL MÍSTER ---
  detectCoachTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const u = user as any;
        const userId = u.id || u.idUsuario;

        this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`).subscribe({
          next: (response: any) => {
            console.log("🎯 Respuesta Backend Entrenador:", response);
            
            // El backend devuelve un objeto complejo { equipo: {...}, rol: ... }
            const equipo = response.equipo; 

            if (equipo) {
                // Aseguramos que sea un número para comparar bien
                this.coachTeamId = Number(equipo.idEquipo || equipo.id); 
                this.coachTeamName = equipo.nombre;
                console.log("✅ ID Equipo Entrenador fijado en:", this.coachTeamId);
                this.loadPlayers();
            } else {
                console.warn("⚠️ El entrenador no tiene equipo asignado en el objeto respuesta.");
                this.loading = false;
            }
          },
          error: (err) => {
            console.error("❌ Error detectando equipo:", err);
            this.loading = false;
          }
        });
      }
    });
  }

  // --- 2. CARGA Y FILTRADO ROBUSTO ---
  loadPlayers() {
    if (!this.coachTeamId) return;

    this.loading = true;
    this.playerService.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        
        console.log(`📋 Total jugadores en BD: ${all.length}`);

        // MI EQUIPO
        this.myPlayers = all.filter((p: any) => {
             const playerTeamId = this.getTeamIdFromPlayer(p);
             // Comprobación laxa (==) para evitar problemas de string vs number
             return playerTeamId == this.coachTeamId;
        });

        console.log(`✅ Jugadores encontrados para el equipo ${this.coachTeamId}: ${this.myPlayers.length}`);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // --- 🔥 FUNCIÓN DE EXTRACCIÓN DE ID MEJORADA 🔥 ---
  private getTeamIdFromPlayer(p: any): number | null {
    if (!p) return null;

    // 1. Si viene como objeto completo (Backend con relaciones)
    if (p.equipoPrincipal && typeof p.equipoPrincipal === 'object') {
        return Number(p.equipoPrincipal.idEquipo || p.equipoPrincipal.id);
    }
    
    // 2. Si viene como número directo (Backend con DTO plano)
    if (typeof p.equipoPrincipal === 'number') {
        return Number(p.equipoPrincipal);
    }

    // 3. Fallback a propiedad antigua 'equipo'
    if (p.equipo && typeof p.equipo === 'object') {
        return Number(p.equipo.idEquipo || p.equipo.id);
    }

    return null;
  }

  // --- MODAL DE EDICIÓN (DORSAL / POSICIÓN) ---
  openEditModal(player: Player) {
    this.selectedPlayer = player;
    const raw = player as any;
    
    this.techData = {
      dorsal: player.dorsal || null,
      posicion: raw.posicion || '',
      teamId: this.coachTeamId // El equipo no se cambia aquí
    };
    this.isEditModalOpen = true;
  }

  async saveTechnicalData() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();

    // Solo enviamos lo que el entrenador puede cambiar
    const cambios = {
      dorsal: this.techData.dorsal,
      posicion: this.techData.posicion,
      equipoPrincipal: this.coachTeamId // Mantenemos el equipo actual
    };

    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = (this.selectedPlayer as any).id || (this.selectedPlayer as any).idJugador;

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isEditModalOpen = false; 
        this.showToast('Datos técnicos actualizados', 'success');
        this.loadPlayers(); 
      },
      error: async (err) => {
        await loading.dismiss();
        this.showToast('Error al actualizar', 'danger');
      }
    });
  }

  private prepareDto(player: Player, cambios: any): any {
    const rawPlayer = player as any;
    
    return {
      idUsuario: rawPlayer.usuario.id || rawPlayer.usuario.idUsuario,
      posicion: cambios.posicion !== undefined ? cambios.posicion : rawPlayer.posicion,
      dorsal: cambios.dorsal !== undefined ? cambios.dorsal : player.dorsal,
      estado: cambios.estado || rawPlayer.estado || 'ACTIVO',
      equipoPrincipal: this.coachTeamId, // Siempre forzamos el equipo actual
      observaciones: cambios.observaciones || rawPlayer.observaciones,
      fechaNacimiento: rawPlayer.fechaNacimiento,
      fechaAlta: rawPlayer.fechaAlta
    };
  }

  // --- MODAL DE LESIONES ---
  openInjuryModal(player: Player) {
    this.selectedPlayer = player;
    this.injuryData = { tipo: '', duracion: '', notas: '' };
    this.isModalOpen = true;
  }

  async saveInjury() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Registrando...' });
    await loading.present();
    
    const cambios = { estado: 'LESIONADO', observaciones: `Baja: ${this.injuryData.tipo}` };
    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = (this.selectedPlayer as any).id || (this.selectedPlayer as any).idJugador;

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isModalOpen = false;
        this.loadPlayers(); 
      },
      error: async () => { await loading.dismiss(); }
    });
  }

  closeModals() {
    this.isModalOpen = false;
    this.isEditModalOpen = false;
    this.selectedPlayer = null;
  }

  async setRecovered(player: Player) {
      const alert = await this.alertCtrl.create({
      header: '¿Dar de alta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            const payload = this.prepareDto(player, { estado: 'ACTIVO' });
            const id = (player as any).id || (player as any).idJugador;
            this.playerService.updatePlayer(id, payload).subscribe(() => this.loadPlayers());
          }
        }
      ]
    });
    await alert.present();
  }

  getAvatar(p: Player): string {
    const u = p.usuario as any;
    return u.fotoUrl || `https://ui-avatars.com/api/?name=${u.nombre}&background=random`;
  }
  
  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}