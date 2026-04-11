import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SeasonStats } from 'src/app/shared/models/models';
import { CoachService } from 'src/app/core/services/coach/coach.service';
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
      this.buildCharts();
    } finally {
      this.loading = false;
    }
  }

  private buildCharts() {
    if (!this.stats) return;
    this.buildSparkline();
    this.buildRadar();
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
        sparkline: { enabled: false }
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

    const poderOfensivo  = Math.min(100, Math.round((s.promedioGolesFavor ?? 0) * 25));
    const solidezDefens  = Math.min(100, Math.round(((s.cleanSheets ?? 0) / pj) * 100));
    const disciplina     = Math.max(0, Math.round(100 - ((s.tarjetasAmarillasTotal ?? 0) / pj) * 20 - ((s.tarjetasRojasTotal ?? 0) / pj) * 40));
    const generacion     = Math.min(100, Math.round(((s.asistenciasTotal ?? 0) / pj) * 25));
    const eficacia       = Math.min(100, Math.round((s.g / pj) * 100));

    this.radarOptions = {
      series: [{ name: 'Índice', data: [poderOfensivo, solidezDefens, disciplina, generacion, eficacia] }],
      chart: {
        type: 'radar',
        height: 280,
        background: 'transparent',
        foreColor: '#64748b',
        toolbar: { show: false },
        fontFamily: 'inherit'
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

  get eficienciaPuntos(): string {
    if (!this.stats || this.stats.pj === 0) return '0.0';
    return (this.stats.puntos / this.stats.pj).toFixed(1);
  }

  get proyeccionFinal(): number | null {
    if (!this.stats || this.stats.pj === 0) return null;
    const ritmo = this.stats.puntos / this.stats.pj;
    const totalPartidos = 34;
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
