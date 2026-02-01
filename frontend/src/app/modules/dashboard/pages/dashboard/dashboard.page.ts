import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; // ✅ Necesario para pedir el ID del equipo

// ✅ Rutas relativas físicas corregidas (5 niveles para environment)
import { AuthService } from '../../../../core/services/auth/auth.service';
import { User } from '../../../../shared/models/models';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  currentUser$: Observable<User | null>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient // ✅ Inyectamos HttpClient
  ) {
    this.currentUser$ = this.auth.currentUser$;
  }

  ngOnInit() {
    // IMPORTANTE: Failsafe Redirect (Redirección de seguridad según rol)
    this.currentUser$.subscribe(user => {
      if (user) {
        if (user.roles.includes('ADMIN')) {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        } else if (user.roles.includes('ENTRENADOR')) {
          this.router.navigate(['/coach/dashboard'], { replaceUrl: true });
        } else if (user.roles.includes('JUGADOR')) {
          this.router.navigate(['/player/dashboard'], { replaceUrl: true });
        }
      }
    });
  }

  // --- Métodos de Navegación ---

  goToProfile() {
    this.router.navigate(['/user/profile']); 
  }

  // 🚀 NUEVO MÉTODO INTELIGENTE PARA EL BOTÓN "MI EQUIPO"
  goToMyTeam() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) return;

      const u = user as any;
      const userId = u.id || u.idUsuario || u.sub;

      // CASO 1: JUGADOR -> Vamos al detalle visual del equipo (Team Detail)
      if (user.roles.includes('JUGADOR')) {
        this.http.get(`${environment.apiUrl}/jugadores/usuario/${userId}`).subscribe({
          next: (res: any) => {
            // El backend devuelve el objeto jugador con 'equipo' o 'equipoPrincipal'
            const team = res.equipo || res.equipoPrincipal;
            if (team) {
              const teamId = team.id || team.idEquipo;
              // ✅ Redirige a la página bonita de detalle
              this.router.navigate(['/team-detail', teamId]); 
            } else {
              // Si no tiene equipo, lo mandamos a la lista para que busque uno
              this.router.navigate(['/teams']);
            }
          },
          error: () => this.router.navigate(['/teams']) // Fallback si falla la API
        });
      }
      
      // CASO 2: ENTRENADOR -> Vamos a la gestión de su equipo
      else if (user.roles.includes('ENTRENADOR')) {
        this.router.navigate(['/coach/my-team']); 
      }
      
      // CASO 3: ADMIN/OTROS -> Lista general
      else {
        this.router.navigate(['/teams']);
      }
    });
  }

  // Mantenemos este para "Ver todos los equipos" si tienes otro botón
  goToTeams() {
    this.router.navigate(['/teams']); 
  }
  
  goToConvocations() {
    this.router.navigate(['/convocations']); 
  }

  onLogout() {
    this.auth.logout();
  }
}