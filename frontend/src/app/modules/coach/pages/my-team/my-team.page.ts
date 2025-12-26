import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UploadService } from 'src/app/core/services/common/upload.service'; // ✅ IMPORTADO
import { Player, Team } from 'src/app/shared/models/models';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {
  
  myPlayers: Player[] = [];
  teams: Team[] = []; 
  
  coachTeamId: number | null = null; 
  coachTeamName: string = ''; 
  currentTeamShield: string = ''; // ✅ VARIABLE PARA EL ESCUDO
  
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
    private uploadSvc: UploadService, // ✅ INYECTADO
    private http: HttpClient,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.detectCoachTeam();
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
            
            const equipo = response.equipo; 

            if (equipo) {
                this.coachTeamId = Number(equipo.idEquipo || equipo.id); 
                this.coachTeamName = equipo.nombre;
                
                // ✅ CAPTURAMOS EL ESCUDO
                this.currentTeamShield = equipo.escudoUrl;

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

  // ✅ LOGICA DE SUBIDA DE ESCUDO
  onShieldSelected(event: any) {
    if (!this.coachTeamId) return;
    
    const file: File = event.target.files[0];
    if (file) {
      this.loadingCtrl.create({ message: 'Actualizando escudo...' }).then(loading => {
        loading.present();
        
        this.uploadSvc.uploadImage(file).subscribe({
          next: (res: any) => {
            const newUrl = res.url;
            this.updateShieldBackend(this.coachTeamId!, newUrl, loading);
          },
          error: (err) => {
             console.error(err);
             loading.dismiss();
             this.showToast('Error al subir imagen', 'danger');
          }
        });
      });
    }
  }

  // ✅ ACTUALIZAR EN BACKEND (Usamos GET + PUT para asegurar integridad)
  updateShieldBackend(id: number, url: string, loading: HTMLIonLoadingElement) {
     this.http.get<any>(`http://localhost:8080/api/equipos/${id}`).subscribe({
        next: (eq) => {
            const dto = {
               nombre: eq.nombre,
               fechaCreacion: eq.fechaCreacion,
               observaciones: eq.observaciones,
               idLiga: eq.liga?.idLiga || 1, 
               idCategoria: eq.categoria?.idCategoria || 1,
               escudoUrl: url // Nueva URL
            };

            this.http.put(`http://localhost:8080/api/equipos/${id}`, dto).subscribe({
               next: () => {
                  this.currentTeamShield = url; // Actualizamos vista
                  loading.dismiss();
                  this.showToast('Escudo actualizado 🛡️', 'success');
               },
               error: (err) => {
                  console.error(err);
                  loading.dismiss();
                  this.showToast('Error al guardar escudo', 'danger');
               }
            });
        },
        error: () => loading.dismiss()
     });
  }

  // --- 2. CARGA Y FILTRADO ---
  loadPlayers() {
    if (!this.coachTeamId) return;

    this.loading = true;
    this.playerService.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        
        this.myPlayers = all.filter((p: any) => {
             const playerTeamId = this.getTeamIdFromPlayer(p);
             return playerTeamId == this.coachTeamId;
        });

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private getTeamIdFromPlayer(p: any): number | null {
    if (!p) return null;
    if (p.equipoPrincipal && typeof p.equipoPrincipal === 'object') {
        return Number(p.equipoPrincipal.idEquipo || p.equipoPrincipal.id);
    }
    if (typeof p.equipoPrincipal === 'number') {
        return Number(p.equipoPrincipal);
    }
    if (p.equipo && typeof p.equipo === 'object') {
        return Number(p.equipo.idEquipo || p.equipo.id);
    }
    return null;
  }

  // --- MODALES Y EDICIÓN ---
  openEditModal(player: Player) {
    this.selectedPlayer = player;
    const raw = player as any;
    
    this.techData = {
      dorsal: player.dorsal || null,
      posicion: raw.posicion || '',
      teamId: this.coachTeamId 
    };
    this.isEditModalOpen = true;
  }

  async saveTechnicalData() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();

    const cambios = {
      dorsal: this.techData.dorsal,
      posicion: this.techData.posicion,
      equipoPrincipal: this.coachTeamId 
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
      equipoPrincipal: this.coachTeamId,
      observaciones: cambios.observaciones || rawPlayer.observaciones,
      fechaNacimiento: rawPlayer.fechaNacimiento,
      fechaAlta: rawPlayer.fechaAlta
    };
  }

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