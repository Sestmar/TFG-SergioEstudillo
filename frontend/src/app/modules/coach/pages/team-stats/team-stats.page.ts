import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { filter, switchMap } from 'rxjs/operators';
import { Partido, PlayerSeasonStat } from 'src/app/shared/models/models';

type ChartOptions = {
  series: any;
  chart: any;
  xaxis?: any;
  yaxis?: any;
  dataLabels?: any;
  plotOptions?: any;
  colors?: string[];
  fill?: any;
  legend?: any;
  grid?: any;
  stroke?: any;
  tooltip?: any;
  markers?: any;
};

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.page.html',
  styleUrls: ['./team-stats.page.scss'],
})
export class TeamStatsPage implements OnInit {

  private destroyRef = inject(DestroyRef);
  loading = true;
  teamName = '';
  matches: Partido[] = [];

  seasonStats = {
    played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0
  };

  lastMatches: Partido[] = [];

  topScorerMVP: PlayerSeasonStat | null = null;
  restScorers: PlayerSeasonStat[] = [];
  topMinutes: PlayerSeasonStat[] = [];
  topAttendance: PlayerSeasonStat[] = [];
  maxMinutes: number = 1;

  // ── CHART: Goles por partido (Bar) ─────────────────────────
  goalsChartOptions: ChartOptions = {
    series: [
      { name: 'A Favor', data: [] },
      { name: 'En Contra', data: [] }
    ],
    chart: {
      type: 'bar', height: 190,
      background: 'transparent', foreColor: '#94a3b8',
      toolbar: { show: false }, fontFamily: 'inherit'
    },
    colors: ['#10b981', '#ef4444'],
    plotOptions: { bar: { columnWidth: '65%', borderRadius: 3 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: [],
      labels: { style: { colors: '#64748b', fontSize: '9px' }, rotate: -30 },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { show: false },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
    legend: { labels: { colors: '#94a3b8' }, fontSize: '11px' },
    tooltip: { theme: 'dark' }
  };

  // ── CHART: Carga Física (Horizontal Bar) ──────────────────
  physicalChartOptions: ChartOptions = {
    series: [{ name: 'Minutos', data: [] }],
    chart: {
      type: 'bar', height: 260,
      background: 'transparent', foreColor: '#94a3b8',
      toolbar: { show: false }, fontFamily: 'inherit'
    },
    colors: ['#6c63ff'],
    plotOptions: { bar: { horizontal: true, barHeight: '65%', borderRadius: 4 } },
    dataLabels: {
      enabled: true,
      style: { fontSize: '10px', colors: ['#fff'] },
      formatter: (val: number) => `${val}'`
    },
    xaxis: { categories: [], labels: { style: { colors: '#64748b', fontSize: '9px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)', xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: { theme: 'dark' }
  };

  // ── CHART: Asistencia entreno (Horizontal Bar distribuido) ─────────
  attendanceChartOptions: ChartOptions = {
    series: [{ name: 'Asistencia %', data: [] }],
    chart: {
      type: 'bar', height: 260,
      background: 'transparent', foreColor: '#94a3b8',
      toolbar: { show: false }, fontFamily: 'inherit'
    },
    colors: ['#10b981'],
    plotOptions: { bar: { horizontal: true, barHeight: '65%', borderRadius: 4, distributed: true } },
    dataLabels: {
      enabled: true,
      style: { fontSize: '10px', colors: ['#fff'] },
      formatter: (val: number) => `${val}%`
    },
    xaxis: { max: 100, categories: [], labels: { style: { colors: '#64748b', fontSize: '9px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    legend: { show: false },
    tooltip: { theme: 'dark' }
  };

  // ── CHART: Rendimiento por líneas (Radar) ──────────────────
  radarChartOptions: ChartOptions = {
    series: [
      { name: 'Goles Prom.', data: [0, 0, 0, 0] },
      { name: 'Min/10', data: [0, 0, 0, 0] }
    ],
    chart: {
      type: 'radar', height: 260,
      background: 'transparent', foreColor: '#94a3b8',
      toolbar: { show: false }, fontFamily: 'inherit'
    },
    colors: ['#6c63ff', '#10b981'],
    xaxis: { categories: ['Portería', 'Defensa', 'Mediocampo', 'Ataque'] },
    yaxis: { show: false },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: 'rgba(255,255,255,0.08)',
          connectorColors: 'rgba(255,255,255,0.08)',
          fill: { colors: ['rgba(108,99,255,0.04)', 'rgba(108,99,255,0.02)'] }
        }
      }
    },
    fill: { opacity: 0.2 },
    stroke: { width: 2 },
    markers: { size: 4 },
    legend: { labels: { colors: '#94a3b8' }, fontSize: '11px' },
    tooltip: { theme: 'dark' }
  };

  constructor(
    private navCtrl: NavController,
    private authSvc: AuthService,
    private coachSvc: CoachService,
    private matchSvc: MatchService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  goBack() {
    this.navCtrl.back();
  }

  async loadData() {
    this.loading = true;

    this.authSvc.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(u => !!u),
        switchMap(u => {
          const id = u!.idUsuario;
          return this.coachSvc.getDashboardData(id);
        })
      )
      .subscribe({
        next: (res) => {
          if (res.equipo) {
            this.teamName = res.equipo.nombre;
            const teamId = res.equipo.idEquipo || res.equipo.id;
            const coachId = res.entrenadorId;

            this.matchSvc.getMatchesByTeam(teamId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(matches => {
                this.calculateSeasonStats(matches || []);
              });

            if (coachId) {
              this.loadFullStats(coachId);
            } else {
              console.warn('No se encontró ID de entrenador en dashboard');
              this.loading = false;
            }
          } else {
            this.loading = false;
          }
        },
        error: () => this.loading = false
      });
  }

  loadFullStats(coachId: number) {
    this.coachSvc.getTeamStats(coachId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const players: PlayerSeasonStat[] = res.jugadores || [];

          const scorers = [...players]
            .sort((a, b) => (b.goles || 0) - (a.goles || 0))
            .filter(p => (p.goles || 0) > 0);

          if (scorers.length > 0) {
            this.topScorerMVP = scorers[0];
            this.restScorers = scorers.slice(1, 6);
          }

          this.topMinutes = [...players]
            .sort((a, b) => (b.minutos || 0) - (a.minutos || 0))
            .slice(0, 10);

          this.topAttendance = [...players]
            .sort((a, b) => (b.asistenciaPct || 0) - (a.asistenciaPct || 0));

          this.buildRadarChart(players);
          this.buildPhysicalChart(players);
          this.buildAttendanceChart(players);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  calculateSeasonStats(matches: Partido[]) {
    this.matches = matches;
    const finished = matches.filter(m => m.estado === 'FINALIZADO' && m.tipo === 'PARTIDO');
    this.seasonStats.played = finished.length;

    finished.forEach(m => {
      const gf = m.golesFavor || 0;
      const gc = m.golesContra || 0;
      this.seasonStats.goalsFor += gf;
      this.seasonStats.goalsAgainst += gc;

      if (gf > gc) this.seasonStats.wins++;
      else if (gf === gc) this.seasonStats.draws++;
      else this.seasonStats.losses++;
    });

    this.buildGoalsChart(finished);
  }

  buildGoalsChart(finished: Partido[]) {
    this.lastMatches = finished.slice(-10);
  }

  getMatchResult(m: Partido): 'win' | 'draw' | 'loss' {
    if (m.golesFavor > m.golesContra) return 'win';
    if (m.golesFavor === m.golesContra) return 'draw';
    return 'loss';
  }

  buildRadarChart(players: PlayerSeasonStat[]) {
    const classify = (pos?: string): number => {
      if (!pos) return -1;
      const p = pos.toUpperCase();
      if (p.includes('PORTER') || p === 'POR' || p === 'PT') return 0;
      if (p.includes('DEF') || p.includes('CENTRAL') || p.includes('LATERAL')) return 1;
      if (p.includes('MEDIO') || p.includes('CENTROCAMPISTA') || p === 'MC' || p === 'MCD') return 2;
      if (p.includes('DELANTERO') || p.includes('EXTREMO') || p.includes('ARIETE') || p === 'DC') return 3;
      return -1;
    };

    const groups: PlayerSeasonStat[][] = [[], [], [], []];
    players.forEach(p => {
      const g = classify(p.posicion);
      if (g >= 0) groups[g].push(p);
    });

    const avgGoles = (arr: PlayerSeasonStat[]) =>
      arr.length ? +(arr.reduce((s, p) => s + (p.goles || 0), 0) / arr.length).toFixed(1) : 0;
    const avgMin = (arr: PlayerSeasonStat[]) =>
      arr.length ? Math.round(arr.reduce((s, p) => s + (p.minutos || 0), 0) / arr.length / 10) : 0;

    this.radarChartOptions = {
      ...this.radarChartOptions,
      series: [
        { name: 'Goles Prom.', data: groups.map(g => avgGoles(g)) },
        { name: 'Min/10',      data: groups.map(g => avgMin(g))   }
      ]
    };
  }

  getBarWidth(mins: number): string {
    return ((mins / this.maxMinutes) * 100) + '%';
  }

  getAvatarUrl(p: PlayerSeasonStat): string {
    if (p.fotoUrl) return p.fotoUrl;
    const name = p.nombre || 'Player';
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
  }

  buildPhysicalChart(players: PlayerSeasonStat[]) {
    const top8 = [...players]
      .sort((a, b) => (b.minutos || 0) - (a.minutos || 0))
      .slice(0, 8);

    this.physicalChartOptions = {
      ...this.physicalChartOptions,
      series: [{ name: 'Minutos', data: top8.map(p => p.minutos || 0) }],
      xaxis: { ...this.physicalChartOptions.xaxis, categories: top8.map(p => p.nombre || '?') }
    };
  }

  buildAttendanceChart(players: PlayerSeasonStat[]) {
    const sorted = [...players]
      .filter(p => p.asistenciaPct !== undefined && p.asistenciaPct !== null)
      .sort((a, b) => (b.asistenciaPct || 0) - (a.asistenciaPct || 0))
      .slice(0, 8);

    const colors = sorted.map(p => {
      const pct = p.asistenciaPct || 0;
      if (pct >= 85) return '#10b981';
      if (pct >= 60) return '#3b82f6';
      if (pct >= 40) return '#f59e0b';
      return '#ef4444';
    });

    this.attendanceChartOptions = {
      ...this.attendanceChartOptions,
      series: [{ name: 'Asistencia %', data: sorted.map(p => p.asistenciaPct || 0) }],
      colors,
      xaxis: { ...this.attendanceChartOptions.xaxis, categories: sorted.map(p => p.nombre || '?') }
    };
  }

  getAttendanceColor(pct: number): string {
    if (!pct) return '#ef4444';
    if (pct >= 85) return '#10b981';
    if (pct >= 60) return '#3b82f6';
    if (pct >= 40) return '#f59e0b';
    return '#ef4444';
  }
}
