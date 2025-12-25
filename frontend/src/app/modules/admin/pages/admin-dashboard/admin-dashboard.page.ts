import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  candidates: any[] = [];
  coaches: any[] = [];
  teams: any[] = [];
  
  segmentValue = 'players'; 
  loading = false;

  // 🔥 Lista de roles disponibles para el Staff
  staffRoles: string[] = [
    'Entrenador Principal',
    'Segundo Entrenador',
    'Entrenador Porteros',
    'Preparador Físico',
    'Analista',
    'Delegado'
  ];

  constructor(
    private adminSvc: AdminService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    
    this.adminSvc.getTeams().subscribe({
      next: (teamsData) => {
        this.teams = teamsData;
        
        this.adminSvc.getCandidates().subscribe(data => {
          this.candidates = data.map(c => ({...c, selectedTeamId: null}));
        });

        this.adminSvc.getAvailableCoaches().subscribe(data => {
          // Inicializamos rol por defecto
          this.coaches = data.map(c => ({
            ...c, 
            selectedTeamId: null,
            selectedRole: 'Entrenador Principal' 
          }));
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.loading = false;
      }
    });
  }

  async onAssignPlayer(user: any) {
    if (!user.selectedTeamId) return this.presentToast('⚠️ Selecciona un equipo primero', 'warning');
    
    await this.processRequest(
      this.adminSvc.assignTeam(user.idUsuario, user.selectedTeamId),
      `✅ Fichaje realizado: ${user.nombre} es jugador.`
    );
  }

  // 🔥 ACTUALIZADO: Envía el rol seleccionado
  async onAssignCoach(user: any) {
    if (!user.selectedTeamId) return this.presentToast('⚠️ Selecciona un equipo primero', 'warning');

    const rol = user.selectedRole || 'Entrenador Principal';

    await this.processRequest(
      this.adminSvc.assignCoach(user.idUsuario, user.selectedTeamId, rol),
      `✅ Contrato: ${user.nombre} fichado como ${rol}.`
    );
  }

  async processRequest(observable$: any, successMsg: string) {
    const loading = await this.loadingCtrl.create({ message: 'Procesando operación...' });
    await loading.present();

    observable$.subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast(successMsg, 'success');
        this.loadData();
      },
      error: async (err: any) => {
        await loading.dismiss();
        console.error(err);
        const errorMsg = err.error?.error || 'Error en la operación.';
        this.presentToast(`❌ ${errorMsg}`, 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 4000, color, position: 'top' });
    t.present();
  }
}