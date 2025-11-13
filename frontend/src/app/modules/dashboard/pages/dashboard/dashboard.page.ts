import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';

// Tu auth.service.ts exporta esta interfaz
interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
  roles: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  currentUser$: Observable<User | null>;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.auth.currentUser$;
  }

  ngOnInit() {
    // IMPORTANTE: Failsafe Redirect
    // Tu login-futbolero ya redirige, pero si un admin
    // entra a /dashboard manualmente, lo volvemos a redirigir.
    this.currentUser$.subscribe(user => {
      if (user) {
        if (user.roles.includes('ADMIN')) {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        } else if (user.roles.includes('ENTRENADOR')) {
          this.router.navigate(['/coach/dashboard'], { replaceUrl: true });
        } else if (user.roles.includes('JUGADOR')) {
          this.router.navigate(['/player/dashboard'], { replaceUrl: true });
        }
        // Si no es ninguno, se queda aquí, en el dashboard general.
      }
    });
  }

  // --- Métodos de Navegación ---
  // (Tu HTML complejo los llama 'navigateTo', el mío 'goToProfile', 
  // pero el HTML que te doy en el Paso 2 usará estos)

  goToProfile() {
    // Asumo que tienes una ruta '/user/profile' o similar
    this.router.navigate(['/user/profile']); 
  }

  goToTeams() {
    // Asumo que tienes una ruta '/teams'
    this.router.navigate(['/teams']); 
  }
  
  goToConvocations() {
    // Asumo que tienes una ruta '/convocations'
    this.router.navigate(['/convocations']); 
  }

  onLogout() {
    this.auth.logout();
    // Tu auth.service.ts ya redirige a /landing o /login
  }
}