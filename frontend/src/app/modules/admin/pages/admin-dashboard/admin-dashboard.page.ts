import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  // Datos
  candidates: any[] = [];
  activeUsers: any[] = [];
  teams: any[] = [];
  
  // Vista actual
  currentView = 'users';
  userSegment = 'pending';
  loading = false;

  // Modales
  isUserModalOpen = false;
  isTeamModalOpen = false;
  isMatchModalOpen = false;

  // Formularios
  newUser = { nombre: '', email: '', rol: 'JUGADOR', password: '123' };
  newTeam = { nombre: '', categoria: '' };
  newMatch = { idEquipo: null, rival: '', lugar: '', fechaHora: new Date().toISOString() };

  constructor(
    private adminSvc: AdminService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, // 🔥 Inyección AlertController
    private router: Router
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    
    this.adminSvc.getTeams().subscribe({
      next: (res) => {
        this.teams = res;
        this.loadCandidates();
      },
      error: () => this.loading = false
    });
    
    this.loadActiveUsers();
  }

  loadCandidates() {
    this.adminSvc.getCandidates().subscribe({
        next: (res) => {
            this.candidates = res.map(c => ({...c, selectedTeamId: null}));
            this.loading = false;
        },
        error: () => this.loading = false
    });
  }

  loadActiveUsers() {
      this.adminSvc.getAllActiveUsers().subscribe(res => this.activeUsers = res);
  }

  // --- ACCIONES DE USUARIO ---
  async onAssignPlayer(user: any) {
    if (!user.selectedTeamId) return this.presentToast('⚠️ Selecciona un equipo primero', 'warning');
    
    await this.processRequest(
        this.adminSvc.assignTeam(user.idUsuario, user.selectedTeamId), 
        'Fichaje realizado'
    );
    this.loadCandidates();
    this.loadActiveUsers();
  }

  async createNewUser() {
      if(!this.newUser.nombre || !this.newUser.email) return this.presentToast('Datos incompletos', 'warning');
      
      await this.processRequest(
          this.adminSvc.createUser(this.newUser), 
          'Usuario creado correctamente'
      );
      this.isUserModalOpen = false;
      this.newUser = { nombre: '', email: '', rol: 'JUGADOR', password: '123' }; 
      this.loadActiveUsers();
  }

  // 🔥 NUEVO: ELIMINAR USUARIO
  async deleteUser(user: any) {
      const alert = await this.alertCtrl.create({
          header: 'Confirmar Eliminación',
          message: `¿Seguro que quieres eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { 
                  text: 'Eliminar', 
                  role: 'destructive',
                  handler: () => {
                      this.processRequest(
                          this.adminSvc.deleteUser(user.id),
                          'Usuario eliminado'
                      ).then(() => this.loadActiveUsers());
                  }
              }
          ]
      });
      await alert.present();
  }

  // --- ACCIONES DE EQUIPO ---
  async createNewTeam() {
      if(!this.newTeam.nombre) return this.presentToast('Nombre obligatorio', 'warning');
      
      await this.processRequest(
          this.adminSvc.createTeam(this.newTeam), 
          'Equipo creado'
      );
      this.isTeamModalOpen = false;
      this.newTeam = { nombre: '', categoria: '' };
      
      // Recargar equipos
      this.adminSvc.getTeams().subscribe(res => this.teams = res);
  }

  // 🔥 NUEVO: VER DETALLE DE EQUIPO (Ir al calendario filtrado)
  openTeamDetail(team: any) {
      this.goToTeamCalendar(team);
  }

  // --- ACCIONES COMPETICIÓN ---
  async createMatch() {
      if(!this.newMatch.idEquipo || !this.newMatch.rival) {
          return this.presentToast('Completa los datos del partido', 'warning');
      }

      await this.processRequest(
          this.adminSvc.createMatch(this.newMatch),
          'Partido agendado ⚽'
      );
      this.isMatchModalOpen = false;
      this.newMatch = { idEquipo: null, rival: '', lugar: '', fechaHora: new Date().toISOString() };
  }

  goToTeamCalendar(team: any) {
      if (!team || (!team.idEquipo && !team.id)) return;
      
      const teamId = team.idEquipo || team.id;
      
      // Navegamos pasando el ID como query param
      this.router.navigate(['/calendar'], { 
          queryParams: { teamId: teamId } 
      });
  }

  // --- HELPERS ---
  async processRequest(observable$: any, successMsg: string) {
    const loading = await this.loadingCtrl.create({ message: 'Procesando...', spinner: 'crescent' });
    await loading.present();

    return new Promise<void>((resolve) => {
        observable$.subscribe({
          next: async () => {
            await loading.dismiss();
            this.presentToast(successMsg, 'success');
            resolve();
          },
          error: async (err: any) => {
            await loading.dismiss();
            console.error(err);
            this.presentToast('Error en la operación', 'danger');
            resolve(); // Resolvemos igual para que no se quede colgado
          }
        });
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 3000, color, position: 'top' });
    t.present();
  }

  segmentChanged(ev: any) {
      this.currentView = ev.detail.value;
  }
}