import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SeasonStats } from 'src/app/shared/models/models';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { firstValueFrom, filter } from 'rxjs';

type ChartOptions = {
  series: any;
  chart: any;
  xaxis?: any;
  yaxis?: any;
  dataLabels?: any;
  colors?: string[];
  fill?: any;
  stroke?: any;
  grid?: any;
  tooltip?: any;
  markers?: any;
  plotOptions?: any;
  legend?: any;
};

@Component({
  selector: 'app-season-intelligence',
  templateUrl: './season-intelligence.page.html',
  styleUrls: ['./season-intelligence.page.scss']
})
export class SeasonIntelligencePage {

  stats: SeasonStats | null = null;
  loading = true;

  sparklineOptions: ChartOptions = this.emptySparkline();
  radarOptions: ChartOptions = this.emptyRadar();

  // ─── DISPLAY VALUES (animated counters) ──────────────────────────────────────
  displayPuntos      = 0;
  displayPj          = 0;
  displayVictorias   = 0;
  displayEmpates     = 0;
  displayDerrotas    = 0;
  displayCleanSheets = 0;
  displayRacha       = 0;
  displayWinRateNum  = 0;
  displayEficiencia  = '0.0';
  displayProyeccion: number | null = null;

  constructor(
    private navCtrl: NavController,
    private coachService: CoachService,
    private playerService: PlayerService,
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
      const isJugador = this.authService.hasRole('JUGADOR');
      let equipoId: number | null = null;

      if (isJugador) {
        const equipo = await firstValueFrom(
          this.playerService.getPlayerTeamByUserId(user!.idUsuario)
        );
        equipoId = equipo?.idEquipo ?? equipo?.id ?? null;
      } else {
        const dashboard = await firstValueFrom(
          this.coachService.getDashboardData(user!.idUsuario)
        );
        equipoId = dashboard?.equipo?.idEquipo ?? dashboard?.equipo?.id ?? null;
      }

      if (!equipoId) return;
      this.stats = await firstValueFrom(this.coachService.getSeasonStats(equipoId));
      this.buildCharts();
      this.runCounterAnimations();
    } finally {
      this.loading = false;
    }
  }

  private buildCharts() {
    if (!this.stats) return;
    this.buildSparkline();
    this.buildRadar();
  }

  // ─── COUNTER ANIMATIONS ──────────────────────────────────────────────────────

  private animateCounter(to: number, durationMs: number, setter: (v: number) => void) {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private runCounterAnimations() {
    if (!this.stats) return;
    const s = this.stats;
    const winRateNum    = s.pj > 0 ? Math.round((s.g / s.pj) * 100) : 0;
    const eficienciaNum = s.pj > 0 ? s.puntos / s.pj : 0;

    this.animateCounter(s.puntos, 700,  v => this.displayPuntos      = v);
    this.animateCounter(s.pj,     500,  v => this.displayPj          = v);
    this.animateCounter(s.g,      600,  v => this.displayVictorias   = v);
    this.animateCounter(s.e,      650,  v => this.displayEmpates     = v);
    this.animateCounter(s.p,      600,  v => this.displayDerrotas    = v);
    this.animateCounter(s.cleanSheets ?? 0,     700,  v => this.displayCleanSheets = v);
    this.animateCounter(s.mayorRachaVictorias ?? 0, 800, v => this.displayRacha   = v);
    this.animateCounter(winRateNum,             900,  v => this.displayWinRateNum  = v);

    const proyeccion = this.proyeccionFinal;
    if (proyeccion !== null) {
      this.animateCounter(proyeccion, 1000, v => this.displayProyeccion = v);
    } else {
      this.displayProyeccion = null;
    }

    // Eficiencia es float — animación manual
    const efDur   = 800;
    const efStart = performance.now();
    const efStep  = (now: number) => {
      const progress = Math.min((now - efStart) / efDur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayEficiencia = (eficienciaNum * eased).toFixed(1);
      if (progress < 1) requestAnimationFrame(efStep);
    };
    requestAnimationFrame(efStep);
  }

  // ─── SPARKLINE ───────────────────────────────────────────────────────────────

  private buildSparkline() {
    const historial = this.stats!.historialCompleto ?? [];
    const puntosAcumulados: number[] = [];
    const puntosPartido: number[] = [];
    const labels: string[] = [];
    let acum = 0;

    historial.forEach(m => {
      acum += m.puntos;
      puntosAcumulados.push(acum);
      puntosPartido.push(m.puntos);
      labels.push(m.rival?.length > 8 ? m.rival.substring(0, 8) + '.' : (m.rival ?? ''));
    });

    this.sparklineOptions = {
      series: [
        { name: 'Pts acumulados', data: puntosAcumulados },
        { name: 'Pts jornada',    data: puntosPartido    }
      ],
      chart: {
        type: 'line',
        height: 160,
        background: 'transparent',
        foreColor: '#64748b',
        toolbar: { show: false },
        fontFamily: 'inherit',
        sparkline: { enabled: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1200,
          animateGradually: { enabled: true, delay: 120 },
          dynamicAnimation: { enabled: true, speed: 350 }
        }
      },
      colors: ['#a855f7', '#3b82f6'],
      stroke: { curve: 'smooth', width: [2, 2], dashArray: [0, 4] },
      fill: {
        type: ['gradient', 'solid'],
        gradient: {
          shade: 'dark', type: 'vertical',
          gradientToColors: ['rgba(168,85,247,0)'],
          stops: [0, 100], opacityFrom: 0.3, opacityTo: 0
        }
      },
      markers: { size: [3, 3], colors: ['#a855f7', '#3b82f6'], strokeWidth: 0 },
      xaxis: {
        categories: labels,
        labels: { style: { colors: '#475569', fontSize: '9px' }, rotate: -30 },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { show: false },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      legend: { labels: { colors: '#94a3b8' }, fontSize: '10px' },
      tooltip: { theme: 'dark' },
      dataLabels: { enabled: false }
    };
  }

  // ─── RADAR ───────────────────────────────────────────────────────────────────

  private buildRadar() {
    const s = this.stats!;
    const pj = s.pj || 1;

    const poderOfensivo = Math.min(100, Math.round((s.promedioGolesFavor    ?? 0) * 25));
    const solidezDefens = Math.min(100, Math.round(((s.cleanSheets          ?? 0) / pj) * 100));
    const disciplina    = Math.max(0,   Math.round(100 - ((s.tarjetasAmarillasTotal ?? 0) / pj) * 20
                                                       - ((s.tarjetasRojasTotal     ?? 0) / pj) * 40));
    const generacion    = Math.min(100, Math.round(((s.asistenciasTotal     ?? 0) / pj) * 25));
    const eficacia      = Math.min(100, Math.round((s.g / pj) * 100));

    this.radarOptions = {
      series: [{ name: 'Índice', data: [poderOfensivo, solidezDefens, disciplina, generacion, eficacia] }],
      chart: {
        type: 'radar',
        height: 280,
        background: 'transparent',
        foreColor: '#64748b',
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      colors: ['#a855f7'],
      xaxis: {
        categories: ['Ataque', 'Defensa', 'Disciplina', 'Asistencias', 'Eficacia']
      },
      yaxis: { show: false, min: 0, max: 100 },
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: 'rgba(255,255,255,0.06)',
            connectorColors: 'rgba(255,255,255,0.06)',
            fill: { colors: ['rgba(168,85,247,0.04)', 'rgba(168,85,247,0.02)'] }
          }
        }
      },
      fill: { opacity: 0.25 },
      stroke: { width: 2 },
      markers: { size: 4, colors: ['#a855f7'], strokeWidth: 0 },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: {
        theme: 'dark',
        y: { formatter: (val: number) => `${val} / 100` }
      }
    };
  }

  // ─── DEFAULTS ────────────────────────────────────────────────────────────────

  private emptySparkline(): ChartOptions {
    return {
      series: [],
      chart: { type: 'line', height: 160, background: 'transparent', toolbar: { show: false } },
      xaxis: { categories: [] },
      dataLabels: { enabled: false }
    };
  }

  private emptyRadar(): ChartOptions {
    return {
      series: [{ name: '', data: [0, 0, 0, 0, 0] }],
      chart: { type: 'radar', height: 280, background: 'transparent', toolbar: { show: false } },
      xaxis: { categories: ['Ataque', 'Defensa', 'Disciplina', 'Asistencias', 'Eficacia'] }
    };
  }

  goBack() {
    this.navCtrl.back();
  }

  // ─── PACE ANALYTICS ─────────────────────────────────────────────────────────

  readonly TOTAL_PARTIDOS = 34;

  get eficienciaPuntos(): string {
    if (!this.stats || this.stats.pj === 0) return '0.0';
    return (this.stats.puntos / this.stats.pj).toFixed(1);
  }

  get proyeccionFinal(): number | null {
    if (!this.stats || this.stats.pj === 0) return null;
    const ritmo = this.stats.puntos / this.stats.pj;
    return Math.round(ritmo * this.TOTAL_PARTIDOS);
  }

  get distanciaObjetivo(): number | null {
    if (!this.stats?.puntosObjetivo || this.proyeccionFinal === null) return null;
    return this.proyeccionFinal - this.stats.puntosObjetivo;
  }

  get winRate(): string {
    if (!this.stats || this.stats.pj === 0) return '0';
    return Math.round((this.stats.g / this.stats.pj) * 100).toString();
  }

  // ─── PACE TRACK ──────────────────────────────────────────────────────────────

  /** % de la temporada completada (0–100) */
  get pctTemporada(): number {
    if (!this.stats) return 0;
    return Math.min(100, Math.round((this.stats.pj / this.TOTAL_PARTIDOS) * 100));
  }

  /** % que representan los puntos actuales sobre el máximo posible (pj*3) */
  get pctPuntosActuales(): number {
    if (!this.stats || this.stats.pj === 0) return 0;
    const maxPosible = this.TOTAL_PARTIDOS * 3;
    return Math.min(100, Math.round((this.stats.puntos / maxPosible) * 100));
  }

  /** % que representa la proyección final sobre el máximo posible */
  get pctProyeccion(): number {
    if (this.proyeccionFinal === null) return 0;
    const maxPosible = this.TOTAL_PARTIDOS * 3;
    return Math.min(100, Math.round((this.proyeccionFinal / maxPosible) * 100));
  }

  /** % que representa el objetivo sobre el máximo posible */
  get pctObjetivo(): number {
    if (!this.stats?.puntosObjetivo) return 0;
    const maxPosible = this.TOTAL_PARTIDOS * 3;
    return Math.min(100, Math.round((this.stats.puntosObjetivo / maxPosible) * 100));
  }

  get paceStatus(): 'on-track' | 'at-risk' | 'no-objetivo' {
    if (!this.stats?.puntosObjetivo) return 'no-objetivo';
    const dist = this.distanciaObjetivo ?? 0;
    return dist >= 0 ? 'on-track' : 'at-risk';
  }

  get paceStatusLabel(): string {
    if (this.paceStatus === 'on-track')    return 'EN RITMO';
    if (this.paceStatus === 'at-risk')     return 'EN RIESGO';
    return 'SIN OBJETIVO';
  }
}
