import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SeasonStats } from 'src/app/shared/models/models';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { firstValueFrom, filter } from 'rxjs';

@Component({
  selector: 'app-season-intelligence',
  templateUrl: './season-intelligence.page.html',
  styleUrls: ['./season-intelligence.page.scss']
})
export class SeasonIntelligencePage {

  stats: SeasonStats | null = null;
  loading = true;

  constructor(
    private navCtrl: NavController,
    private coachService: CoachService,
    private authService: AuthService
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  private async loadData() {
    this.loading = true;
    try {
      const user = await firstValueFrom(
        this.authService.currentUser$.pipe(filter(u => !!u))
      );
      const dashboard = await firstValueFrom(
        this.coachService.getDashboardData(user!.idUsuario)
      );
      const equipoId = dashboard?.equipo?.idEquipo ?? dashboard?.equipo?.id;
      if (!equipoId) return;
      this.stats = await firstValueFrom(this.coachService.getSeasonStats(equipoId));
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  // ─── PACE ANALYTICS ─────────────────────────────────────────────────────────

  get eficienciaPuntos(): string {
    if (!this.stats || this.stats.pj === 0) return '0.0';
    return (this.stats.puntos / this.stats.pj).toFixed(1);
  }

  get proyeccionFinal(): number | null {
    if (!this.stats || this.stats.pj === 0) return null;
    const ritmo = this.stats.puntos / this.stats.pj;
    const totalPartidos = 34; // Temporada estándar
    return Math.round(ritmo * totalPartidos);
  }

  get distanciaObjetivo(): number | null {
    if (!this.stats?.puntosObjetivo || this.proyeccionFinal === null) return null;
    return this.proyeccionFinal - this.stats.puntosObjetivo;
  }

  get winRate(): string {
    if (!this.stats || this.stats.pj === 0) return '0';
    return Math.round((this.stats.g / this.stats.pj) * 100).toString();
  }
}
