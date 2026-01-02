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
  coachCandidates: any[] = [];
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
  newUser = { nombre: '', apellidos: '', email: '', rol: 'JUGADOR', password: '123456' };
  newTeam = { nombre: '', categoria: '' };
  
  // Objeto para el formulario (ya no tiene escudoRivalUrl string)
  newMatch = { 
      idEquipo: null, 
      rival: '', 
      lugar: '', 
      fechaHora: new Date().toISOString() 
  };
  
  // 🔥 Variable para guardar el archivo seleccionado
  selectedFile: File | null = null;

  staffRoles = ['Entrenador Principal', 'Segundo Entrenador', 'Preparador Físico', 'Delegado', 'Entrenador de Porteros'];

  constructor(
    private adminSvc: AdminService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
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
        next: (res) => { this.candidates = res.map(c => ({...c, selectedTeamId: null})); }
    });
    this.adminSvc.getCoachCandidates().subscribe({
        next: (res) => {
            this.coachCandidates = res.map(c => ({...c, selectedTeamId: null, selectedRole: 'Entrenador Principal'}));
            this.loading = false;
        },
        error: () => this.loading = false
    });
  }

  loadActiveUsers() {
      this.adminSvc.getAllActiveUsers().subscribe(res => this.activeUsers = res);
  }

  async onAssignPlayer(user: any) {
    if (!user.selectedTeamId) return this.presentToast('⚠️ Selecciona un equipo primero', 'warning');
    await this.processRequest(
        this.adminSvc.assignTeam(user.idUsuario, user.selectedTeamId), 
        'Jugador fichado correctamente ⚽'
    );
    this.loadCandidates();
    this.loadActiveUsers();
  }

  async onAssignCoach(coach: any) {
      if (!coach.selectedTeamId) return this.presentToast('⚠️ Selecciona un equipo', 'warning');
      if (!coach.selectedRole) return this.presentToast('⚠️ Selecciona un rol', 'warning');
      const userId = coach.usuario.idUsuario; 
      await this.processRequest(
          this.adminSvc.assignCoach(userId, coach.selectedTeamId, coach.selectedRole),
          'Staff asignado correctamente 📋'
      );
      this.loadCandidates();
      this.loadActiveUsers();
  }

  async createNewUser() {
      if(!this.newUser.nombre || !this.newUser.email) return this.presentToast('Datos incompletos', 'warning');
      await this.processRequest(
          this.adminSvc.createUser(this.newUser), 
          'Usuario creado.'
      );
      this.isUserModalOpen = false;
      this.newUser = { nombre: '', apellidos: '', email: '', rol: 'JUGADOR', password: '123' }; 
      this.loadCandidates(); 
  }

  async deleteUser(user: any) {
      const alert = await this.alertCtrl.create({
          header: 'Confirmar Eliminación',
          message: `¿Seguro que quieres eliminar a ${user.nombre}?`,
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { 
                  text: 'Eliminar', 
                  role: 'destructive',
                  handler: () => {
                      this.processRequest(
                          this.adminSvc.deleteUser(user.id), 'Usuario eliminado'
                      ).then(() => this.loadActiveUsers());
                  }
              }
          ]
      });
      await alert.present();
  }

  async createNewTeam() {
      if(!this.newTeam.nombre) return this.presentToast('Nombre obligatorio', 'warning');
      await this.processRequest(this.adminSvc.createTeam(this.newTeam), 'Equipo creado');
      this.isTeamModalOpen = false;
      this.newTeam = { nombre: '', categoria: '' };
      this.adminSvc.getTeams().subscribe(res => this.teams = res);
  }

  openTeamDetail(team: any) {
      if (!team || !team.idEquipo) return;
      this.router.navigate(['/team-detail', team.idEquipo]);
  }

  goToTeamCalendar(team: any) {
      if (!team || (!team.idEquipo && !team.id)) return;
      const teamId = team.idEquipo || team.id;
      this.router.navigate(['/calendar'], { queryParams: { teamId: teamId } });
  }

  // 🔥 NUEVO: Manejar la selección del archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // 🔥 MODIFICADO: Enviar FormData
  async createMatch() {
      if(!this.newMatch.idEquipo || !this.newMatch.rival) {
          return this.presentToast('Completa los datos del partido', 'warning');
      }

      // Convertimos a FormData para enviar archivo + datos
      const formData = new FormData();
      formData.append('idEquipo', String(this.newMatch.idEquipo));
      formData.append('rival', this.newMatch.rival);
      formData.append('lugar', this.newMatch.lugar);
      formData.append('fechaHora', this.newMatch.fechaHora);
      
      if (this.selectedFile) {
          formData.append('file', this.selectedFile);
      }

      await this.processRequest(
          this.adminSvc.createMatch(formData),
          'Partido agendado ⚽'
      );
      this.isMatchModalOpen = false;
      this.newMatch = { idEquipo: null, rival: '', lugar: '', fechaHora: new Date().toISOString() };
      this.selectedFile = null;
  }

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
            resolve();
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