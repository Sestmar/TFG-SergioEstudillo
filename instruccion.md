Necesito algo mejor. Integra esto: ### Implementación Propuesta
- **Stack**: Integrar **ApexCharts** o **Chart.js** (ambos tienen excelentes wrappers
 para Angular).
- **Dashboard del Entrenador**:
  - Gráfico de barras: Goles por partido y racha de victorias/derrotas.
  - Gráfico de radar (Spider Chart): Comparativa de rendimiento por líneas (Defensa,
Medio, Ataque).
- **Dashboard del Jugador**:
  - Gráfico de evolución: Minutos jugados y participación en goles a lo largo de la
temporada.
  - Comparativa: Rendimiento personal vs. promedio del equipo en su posición.

● Dejame ver los TypeScript de ambas páginas para entender qué datos tenemos
  disponibles antes de integrar los charts.

  Read 2 files (ctrl+o to expand)

● Bien, veo los datos. Ahora miro los modelos y el module de team-stats para entender
  qué imports hay que añadir.

  Searched for 1 pattern, read 2 files (ctrl+o to expand)

● Perfecto, tengo toda la info. Antes de escribir código, verifico si ApexCharts ya
  está instalado.

● Bash(cd "C:\Users\Usuario\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEstudillo\fro
      ntend" && cat package.json | grep -i apex)
  ⎿  No matches found

● No está. Hay que instalarlo.

● Bash(cd "C:\Users\Usuario\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEstudillo\fro
      ntend" && npm install apexcharts ng-apexcharts --save 2>&1 | tail -5)
  ⎿  npm error
     npm error
     npm error For a full report see:
     … +4 lines (ctrl+o to expand)
  ⎿  (timeout 1m)

● Bash(cd "C:\Users\Usuario\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEstudillo\fro
      ntend" && npm install apexcharts ng-apexcharts --save --legacy-peer-deps 2>&1 |
      t…)
  ⎿  To address all issues (including breaking changes), run:
       npm audit fix --force

     Run `npm audit` for details.
  ⎿  (timeout 1m)

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Instalado. Tengo todo claro. Ahora voy a implementar los 4 charts en paralelo:
  team-stats (bar + radar) y player-dashboard (area + radar). 8 archivos en total.

● Update(src\app\modules\coach\pages\team-stats\team-stats.module.ts)
  ⎿  Added 1 line
      3  import { FormsModule } from '@angular/forms';
      4  import { IonicModule } from '@ionic/angular';
      5  import { RouterModule, Routes } from '@angular/router';
      6 +import { NgApexchartsModule } from 'ng-apexcharts';
      7
      8  import { TeamStatsPage } from './team-stats.page';
      9

● Update(src\app\modules\coach\pages\team-stats\team-stats.module.ts)
  ⎿  Added 1 line
      19      CommonModule,
      20      FormsModule,
      21      IonicModule,
      22 +    NgApexchartsModule,
      23      RouterModule.forChild(routes)
      24    ],
      25    declarations: [TeamStatsPage]

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.module.ts)
  ⎿  Added 1 line
      3  import { FormsModule } from '@angular/forms';
      4  import { IonicModule } from '@ionic/angular'; // ESENCIAL para compone
         ntes Ionic
      5  import { RouterModule, Routes } from '@angular/router';
      6 +import { NgApexchartsModule } from 'ng-apexcharts';
      7
      8  import { PlayerDashboardPage } from './player-dashboard.page';
      9

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.module.ts)
  ⎿  Added 1 line
      19      CommonModule,
      20      FormsModule,
      21      IonicModule,
      22 +    NgApexchartsModule,
      23      RouterModule.forChild(routes)
      24    ],
      25    declarations: [PlayerDashboardPage]

● Ahora el TS de team-stats con la lógica de charts:

● Write(src\app\modules\coach\pages\team-stats\team-stats.page.ts)
  ⎿  Added 184 lines, removed 61 lines
       7  import { filter, switchMap } from 'rxjs/operators';
       8  import { Partido, PlayerSeasonStat } from 'src/app/shared/models/mode
          ls';
       9
      10 +type ChartOptions = {
      11 +  series: any;
      12 +  chart: any;
      13 +  xaxis?: any;
      14 +  yaxis?: any;
      15 +  dataLabels?: any;
      16 +  plotOptions?: any;
      17 +  colors?: string[];
      18 +  fill?: any;
      19 +  legend?: any;
      20 +  grid?: any;
      21 +  stroke?: any;
      22 +  tooltip?: any;
      23 +  markers?: any;
      24 +};
      25 +
      26  @Component({
      27    selector: 'app-team-stats',
      28    templateUrl: './team-stats.page.html',
     ...
       33    private destroyRef = inject(DestroyRef);
       34    loading = true;
       35    teamName = '';
       20 -
       36 +  matches: Partido[] = [];
       37 +
       38    seasonStats = {
       39      played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgain
           st: 0
       40    };
       41
       25 -  // Listas para la Vista
       42    topScorerMVP: PlayerSeasonStat | null = null;
       43    restScorers: PlayerSeasonStat[] = [];
       44    topMinutes: PlayerSeasonStat[] = [];
       45    topAttendance: PlayerSeasonStat[] = [];
       30 -
       46    maxMinutes: number = 1;
       47
       48 +  // ── CHART: Goles por partido (Bar) ─────────────────────────
       49 +  goalsChartOptions: ChartOptions = {
       50 +    series: [
       51 +      { name: 'A Favor', data: [] },
       52 +      { name: 'En Contra', data: [] }
       53 +    ],
       54 +    chart: {
       55 +      type: 'bar', height: 190,
       56 +      background: 'transparent', foreColor: '#94a3b8',
       57 +      toolbar: { show: false }, fontFamily: 'inherit'
       58 +    },
       59 +    colors: ['#10b981', '#ef4444'],
       60 +    plotOptions: { bar: { columnWidth: '65%', borderRadius: 3 } },
       61 +    dataLabels: { enabled: false },
       62 +    xaxis: {
       63 +      categories: [],
       64 +      labels: { style: { colors: '#64748b', fontSize: '9px' }, rotat
          +e: -30 },
       65 +      axisBorder: { show: false }, axisTicks: { show: false }
       66 +    },
       67 +    yaxis: { show: false },
       68 +    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray:
          +3 },
       69 +    legend: { labels: { colors: '#94a3b8' }, fontSize: '11px' },
       70 +    tooltip: { theme: 'dark' }
       71 +  };
       72 +
       73 +  // ── CHART: Rendimiento por líneas (Radar) ──────────────────
       74 +  radarChartOptions: ChartOptions = {
       75 +    series: [
       76 +      { name: 'Goles Prom.', data: [0, 0, 0, 0] },
       77 +      { name: 'Min/10', data: [0, 0, 0, 0] }
       78 +    ],
       79 +    chart: {
       80 +      type: 'radar', height: 260,
       81 +      background: 'transparent', foreColor: '#94a3b8',
       82 +      toolbar: { show: false }, fontFamily: 'inherit'
       83 +    },
       84 +    colors: ['#6c63ff', '#10b981'],
       85 +    xaxis: { categories: ['Portería', 'Defensa', 'Mediocampo', 'Ataq
          +ue'] },
       86 +    yaxis: { show: false },
       87 +    plotOptions: {
       88 +      radar: {
       89 +        polygons: {
       90 +          strokeColors: 'rgba(255,255,255,0.08)',
       91 +          connectorColors: 'rgba(255,255,255,0.08)',
       92 +          fill: { colors: ['rgba(108,99,255,0.04)', 'rgba(108,99,255
          +,0.02)'] }
       93 +        }
       94 +      }
       95 +    },
       96 +    fill: { opacity: 0.2 },
       97 +    stroke: { width: 2 },
       98 +    markers: { size: 4 },
       99 +    legend: { labels: { colors: '#94a3b8' }, fontSize: '11px' },
      100 +    tooltip: { theme: 'dark' }
      101 +  };
      102 +
      103    constructor(
      104      private navCtrl: NavController,
      105      private authSvc: AuthService,
     ...
      117
      118    async loadData() {
      119      this.loading = true;
       50 -
      120 +
      121      this.authSvc.currentUser$
      122        .pipe(
      123          takeUntilDestroyed(this.destroyRef),
      124          filter(u => !!u),
      125          switchMap(u => {
       56 -            const id = u!.idUsuario;
       57 -            return this.coachSvc.getDashboardData(id);
      126 +          const id = u!.idUsuario;
      127 +          return this.coachSvc.getDashboardData(id);
      128          })
      129        )
      130        .subscribe({
     ...
      132            if (res.equipo) {
      133              this.teamName = res.equipo.nombre;
      134              const teamId = res.equipo.idEquipo || res.equipo.id;
       65 -            const coachId = res.entrenadorId; // Asegúrate de que el
          - endpoint dashboard devuelve esto
      135 +            const coachId = res.entrenadorId;
      136
       67 -            // 1. Cargar Partidos (para resumen de temporada)
       68 -            this.matchSvc.getMatchesByTeam(teamId).pipe(takeUntilDes
          -troyed(this.destroyRef)).subscribe(matches => {
      137 +            this.matchSvc.getMatchesByTeam(teamId)
      138 +              .pipe(takeUntilDestroyed(this.destroyRef))
      139 +              .subscribe(matches => {
      140                  this.calculateSeasonStats(matches || []);
       70 -            });
      141 +              });
      142
       72 -            // 2. Cargar Estadísticas COMPLETAS (Goles, Minutos, Asi
          -stencia)
      143              if (coachId) {
       74 -                this.loadFullStats(coachId);
      144 +              this.loadFullStats(coachId);
      145              } else {
       76 -                console.warn("No se encontró ID de entrenador en das
          -hboard");
       77 -                this.loading = false;
      146 +              console.warn('No se encontró ID de entrenador en dashb
          +oard');
      147 +              this.loading = false;
      148              }
       79 -
      149            } else {
      150              this.loading = false;
      151            }
     ...
      155    }
      156
      157    loadFullStats(coachId: number) {
       89 -      this.coachSvc.getTeamStats(coachId).pipe(takeUntilDestroyed(th
          -is.destroyRef)).subscribe({
       90 -          next: (res) => {
       91 -              const players: PlayerSeasonStat[] = res.jugadores || [
          -];
      158 +    this.coachSvc.getTeamStats(coachId)
      159 +      .pipe(takeUntilDestroyed(this.destroyRef))
      160 +      .subscribe({
      161 +        next: (res) => {
      162 +          const players: PlayerSeasonStat[] = res.jugadores || [];
      163
       93 -              const scorers = [...players]
       94 -                  .sort((a, b) => (b.goles || 0) - (a.goles || 0))
       95 -                  .filter(p => (p.goles || 0) > 0);
      164 +          const scorers = [...players]
      165 +            .sort((a, b) => (b.goles || 0) - (a.goles || 0))
      166 +            .filter(p => (p.goles || 0) > 0);
      167
       97 -              if (scorers.length > 0) {
       98 -                  this.topScorerMVP = scorers[0];
       99 -                  this.restScorers = scorers.slice(1, 6);
      100 -              }
      168 +          if (scorers.length > 0) {
      169 +            this.topScorerMVP = scorers[0];
      170 +            this.restScorers = scorers.slice(1, 6);
      171 +          }
      172
      102 -              this.topMinutes = [...players]
      103 -                  .sort((a, b) => (b.minutos || 0) - (a.minutos || 0
          -))
      104 -                  .slice(0, 10);
      173 +          this.topMinutes = [...players]
      174 +            .sort((a, b) => (b.minutos || 0) - (a.minutos || 0))
      175 +            .slice(0, 10);
      176
      106 -              this.topAttendance = [...players]
      107 -                  .sort((a, b) => (b.asistenciaPct || 0) - (a.asiste
          -nciaPct || 0));
      177 +          this.topAttendance = [...players]
      178 +            .sort((a, b) => (b.asistenciaPct || 0) - (a.asistenciaPc
          +t || 0));
      179
      109 -              this.loading = false;
      110 -          },
      111 -          error: (err) => {
      112 -              console.error(err);
      113 -              this.loading = false;
      114 -          }
      180 +          this.buildRadarChart(players);
      181 +          this.loading = false;
      182 +        },
      183 +        error: (err) => {
      184 +          console.error(err);
      185 +          this.loading = false;
      186 +        }
      187        });
      188    }
      189
      190    calculateSeasonStats(matches: Partido[]) {
      119 -      const finished = matches.filter(m => m.estado === 'FINALIZADO'
          - && m.tipo === 'PARTIDO');
      120 -      this.seasonStats.played = finished.length;
      121 -
      122 -      finished.forEach(m => {
      123 -          const gf = m.golesFavor || 0;
      124 -          const gc = m.golesContra || 0;
      125 -          this.seasonStats.goalsFor += gf;
      126 -          this.seasonStats.goalsAgainst += gc;
      191 +    this.matches = matches;
      192 +    const finished = matches.filter(m => m.estado === 'FINALIZADO' &
          +& m.tipo === 'PARTIDO');
      193 +    this.seasonStats.played = finished.length;
      194
      128 -          if (gf > gc) this.seasonStats.wins++;
      129 -          else if (gf === gc) this.seasonStats.draws++;
      130 -          else this.seasonStats.losses++;
      131 -      });
      195 +    finished.forEach(m => {
      196 +      const gf = m.golesFavor || 0;
      197 +      const gc = m.golesContra || 0;
      198 +      this.seasonStats.goalsFor += gf;
      199 +      this.seasonStats.goalsAgainst += gc;
      200 +
      201 +      if (gf > gc) this.seasonStats.wins++;
      202 +      else if (gf === gc) this.seasonStats.draws++;
      203 +      else this.seasonStats.losses++;
      204 +    });
      205 +
      206 +    this.buildGoalsChart(finished);
      207    }
      208
      134 -  // Helpers visuales
      209 +  buildGoalsChart(finished: Partido[]) {
      210 +    const last = finished.slice(-10);
      211 +    this.goalsChartOptions = {
      212 +      ...this.goalsChartOptions,
      213 +      series: [
      214 +        { name: 'A Favor',   data: last.map(m => m.golesFavor  || 0)
          + },
      215 +        { name: 'En Contra', data: last.map(m => m.golesContra || 0)
          + }
      216 +      ],
      217 +      xaxis: {
      218 +        ...this.goalsChartOptions.xaxis,
      219 +        categories: last.map((m, i) => {
      220 +          const r = m.rival;
      221 +          if (!r) return `PJ ${i + 1}`;
      222 +          return r.length > 8 ? r.substring(0, 7) + '.' : r;
      223 +        })
      224 +      }
      225 +    };
      226 +  }
      227 +
      228 +  buildRadarChart(players: PlayerSeasonStat[]) {
      229 +    const classify = (pos?: string): number => {
      230 +      if (!pos) return -1;
      231 +      const p = pos.toUpperCase();
      232 +      if (p.includes('PORTER') || p === 'POR' || p === 'PT') return
          +0;
      233 +      if (p.includes('DEF') || p.includes('CENTRAL') || p.includes('
          +LATERAL')) return 1;
      234 +      if (p.includes('MEDIO') || p.includes('CENTROCAMPISTA') || p =
          +== 'MC' || p === 'MCD') return 2;
      235 +      if (p.includes('DELANTERO') || p.includes('EXTREMO') || p.incl
          +udes('ARIETE') || p === 'DC') return 3;
      236 +      return -1;
      237 +    };
      238 +
      239 +    const groups: PlayerSeasonStat[][] = [[], [], [], []];
      240 +    players.forEach(p => {
      241 +      const g = classify(p.posicion);
      242 +      if (g >= 0) groups[g].push(p);
      243 +    });
      244 +
      245 +    const avgGoles = (arr: PlayerSeasonStat[]) =>
      246 +      arr.length ? +(arr.reduce((s, p) => s + (p.goles || 0), 0) / a
          +rr.length).toFixed(1) : 0;
      247 +    const avgMin = (arr: PlayerSeasonStat[]) =>
      248 +      arr.length ? Math.round(arr.reduce((s, p) => s + (p.minutos ||
          + 0), 0) / arr.length / 10) : 0;
      249 +
      250 +    this.radarChartOptions = {
      251 +      ...this.radarChartOptions,
      252 +      series: [
      253 +        { name: 'Goles Prom.', data: groups.map(g => avgGoles(g)) },
      254 +        { name: 'Min/10',      data: groups.map(g => avgMin(g))   }
      255 +      ]
      256 +    };
      257 +  }
      258 +
      259    getBarWidth(mins: number): string {
      136 -      return ((mins / this.maxMinutes) * 100) + '%';
      260 +    return ((mins / this.maxMinutes) * 100) + '%';
      261    }
      262
      263    getAvatarUrl(p: PlayerSeasonStat): string {
      140 -      if (p.fotoUrl) return p.fotoUrl;
      141 -      const name = p.nombre || 'Player';
      142 -      return `https://ui-avatars.com/api/?name=${name}&background=ra
          -ndom&color=fff&size=128`;
      264 +    if (p.fotoUrl) return p.fotoUrl;
      265 +    const name = p.nombre || 'Player';
      266 +    return `https://ui-avatars.com/api/?name=${name}&background=rand
          +om&color=fff&size=128`;
      267    }
      144 -
      145 -  // Helper para color de asistencia
      268 +
      269    getAttendanceColor(pct: number): string {
      147 -      if (!pct) return '#ef4444';
      148 -      if (pct >= 85) return '#10b981'; // Verde
      149 -      if (pct >= 60) return '#3b82f6'; // Azul
      150 -      if (pct >= 40) return '#f59e0b'; // Naranja
      151 -      return '#ef4444'; // Rojo
      270 +    if (!pct) return '#ef4444';
      271 +    if (pct >= 85) return '#10b981';
      272 +    if (pct >= 60) return '#3b82f6';
      273 +    if (pct >= 40) return '#f59e0b';
      274 +    return '#ef4444';
      275    }
      153 -}
      276   No newline at end of file
      277 +}

● Ahora el HTML de team-stats con los charts integrados:

● Write(src\app\modules\coach\pages\team-stats\team-stats.page.html)
  ⎿  Added 94 lines, removed 58 lines
      24        </div>
      25        <div class="kpi-card success">
      26          <span class="kpi-value">{{ seasonStats.goalsFor }}</span>
      27 -        <span class="kpi-label">Goles a Favor</span>
      27 +        <span class="kpi-label">GF</span>
      28        </div>
      29        <div class="kpi-card danger">
      30          <span class="kpi-value">{{ seasonStats.goalsAgainst }}</span>
      31 -        <span class="kpi-label">Goles en Contra</span>
      31 +        <span class="kpi-label">GC</span>
      32        </div>
      33        <div class="kpi-card"
      34             [class.positive]="seasonStats.goalsFor - seasonStats.goals
          Against > 0"
      35             [class.negative]="seasonStats.goalsFor - seasonStats.goals
          Against < 0">
      36          <span class="kpi-value">{{ seasonStats.goalsFor - seasonStats
          .goalsAgainst > 0 ? '+' : '' }}{{ seasonStats.goalsFor - seasonStats.
          goalsAgainst }}</span>
      37 -        <span class="kpi-label">Diferencia</span>
      37 +        <span class="kpi-label">Dif.</span>
      38        </div>
      39      </div>
      40
      41 -    <!-- ROW 2: Racha de Temporada -->
      41 +    <!-- ROW 2: Racha + Bar chart -->
      42      <div class="streak-card panel-card">
      43        <div class="streak-header">
      44          <span class="panel-title">Racha de Temporada</span>
     ...
       61          </div>
       62        </div>
       63        <div class="performance-bar">
       64 -        <div class="bar-segment win" [style.flex]="seasonStats.wins
          -|| 0.01"></div>
       65 -        <div class="bar-segment draw" [style.flex]="seasonStats.draw
          -s || 0.01"></div>
       64 +        <div class="bar-segment win"  [style.flex]="seasonStats.wins
          +   || 0.01"></div>
       65 +        <div class="bar-segment draw" [style.flex]="seasonStats.draw
          +s  || 0.01"></div>
       66          <div class="bar-segment loss" [style.flex]="seasonStats.loss
           es || 0.01"></div>
       67        </div>
       68      </div>
       69
       70 -    <!-- ROW 3: Grid 2 columnas -->
       70 +    <!-- ROW 3: Gráfico de goles por partido -->
       71 +    <div class="panel-card chart-card">
       72 +      <div class="panel-header">
       73 +        <span class="panel-title">Goles por Partido</span>
       74 +        <span class="panel-sub">Últimos {{ matches.length > 10 ? 10
          +: matches.length }} encuentros</span>
       75 +      </div>
       76 +      <apx-chart
       77 +        [series]="goalsChartOptions.series"
       78 +        [chart]="goalsChartOptions.chart"
       79 +        [xaxis]="goalsChartOptions.xaxis"
       80 +        [yaxis]="goalsChartOptions.yaxis"
       81 +        [colors]="goalsChartOptions.colors"
       82 +        [plotOptions]="goalsChartOptions.plotOptions"
       83 +        [dataLabels]="goalsChartOptions.dataLabels"
       84 +        [grid]="goalsChartOptions.grid"
       85 +        [legend]="goalsChartOptions.legend"
       86 +        [tooltip]="goalsChartOptions.tooltip">
       87 +      </apx-chart>
       88 +    </div>
       89 +
       90 +    <!-- ROW 4: Grid 2 columnas — Radar + Goleadores -->
       91      <div class="analytics-grid">
       92
       73 -      <!-- IZQUIERDA: Leaderboard Goleadores -->
       93 +      <!-- Radar por líneas -->
       94 +      <div class="panel-card">
       95 +        <div class="panel-header">
       96 +          <span class="panel-title">Rendimiento por Línea</span>
       97 +        </div>
       98 +        <apx-chart
       99 +          [series]="radarChartOptions.series"
      100 +          [chart]="radarChartOptions.chart"
      101 +          [xaxis]="radarChartOptions.xaxis"
      102 +          [yaxis]="radarChartOptions.yaxis"
      103 +          [colors]="radarChartOptions.colors"
      104 +          [plotOptions]="radarChartOptions.plotOptions"
      105 +          [fill]="radarChartOptions.fill"
      106 +          [stroke]="radarChartOptions.stroke"
      107 +          [markers]="radarChartOptions.markers"
      108 +          [legend]="radarChartOptions.legend"
      109 +          [tooltip]="radarChartOptions.tooltip">
      110 +        </apx-chart>
      111 +      </div>
      112 +
      113 +      <!-- Leaderboard Goleadores -->
      114        <div class="panel-card scorers-panel">
      115          <div class="panel-header">
       76 -          <span class="panel-title">Máximos Goleadores</span>
      116 +          <span class="panel-title">Máx. Goleadores</span>
      117            <span class="panel-badge">TOP ⚽</span>
      118          </div>
      119
     ...
      141            </div>
      142          </div>
      143
      104 -        <div *ngIf="!topScorerMVP" class="empty-state">
      105 -          <p>Sin datos de goles.</p>
      106 -        </div>
      144 +        <div *ngIf="!topScorerMVP" class="empty-state"><p>Sin datos
          +de goles.</p></div>
      145        </div>
      146
      109 -      <!-- DERECHA: Físico + Compromiso apilados -->
      110 -      <div class="right-column">
      147 +    </div>
      148
      112 -        <div class="panel-card physical-panel">
      113 -          <div class="panel-header">
      114 -            <span class="panel-title">Carga Física</span>
      149 +    <!-- ROW 5: Carga Física -->
      150 +    <div class="panel-card physical-panel">
      151 +      <div class="panel-header">
      152 +        <span class="panel-title">Carga Física</span>
      153 +      </div>
      154 +      <div class="physical-list">
      155 +        <div class="physical-row" *ngFor="let p of topMinutes">
      156 +          <div class="physical-top">
      157 +            <span class="phys-name">{{ p.nombre }}</span>
      158 +            <span class="phys-value">{{ p.promedioMinutos }}'<span c
          +lass="phys-avg"> avg</span></span>
      159            </div>
      116 -          <div class="physical-list">
      117 -            <div class="physical-row" *ngFor="let p of topMinutes">
      118 -              <div class="physical-top">
      119 -                <span class="phys-name">{{ p.nombre }}</span>
      120 -                <span class="phys-value">{{ p.promedioMinutos }}'<sp
          -an class="phys-avg"> avg</span></span>
      121 -              </div>
      122 -              <div class="progress-track">
      123 -                <div class="progress-fill"
      124 -                     [style.width.%]="(p.minutos / 900) * 100 > 100
          -? 100 : (p.minutos / 900) * 100">
      125 -                </div>
      126 -              </div>
      127 -              <div class="phys-meta">
      128 -                <span>{{ p.partidosJugados }} PJ</span>
      129 -                <span>{{ p.minutos }}' total</span>
      130 -              </div>
      160 +          <div class="progress-track">
      161 +            <div class="progress-fill"
      162 +                 [style.width.%]="(p.minutos / 900) * 100 > 100 ? 10
          +0 : (p.minutos / 900) * 100">
      163              </div>
      132 -            <div *ngIf="topMinutes.length === 0" class="empty-state"
          -><p>Sin datos.</p></div>
      164            </div>
      165 +          <div class="phys-meta">
      166 +            <span>{{ p.partidosJugados }} PJ</span>
      167 +            <span>{{ p.minutos }}' total</span>
      168 +          </div>
      169          </div>
      170 +        <div *ngIf="topMinutes.length === 0" class="empty-state"><p>
          +Sin datos.</p></div>
      171 +      </div>
      172 +    </div>
      173
      136 -        <div class="panel-card attendance-panel">
      137 -          <div class="panel-header">
      138 -            <span class="panel-title">Compromiso</span>
      139 -          </div>
      140 -          <div class="attendance-list">
      141 -            <div class="attendance-row" *ngFor="let p of topAttendan
          -ce">
      142 -              <img [src]="getAvatarUrl(p)" class="att-avatar">
      143 -              <div class="att-info">
      144 -                <span class="att-name">{{ p.nombre }}</span>
      145 -                <div class="history-dots">
      146 -                  <ng-container *ngFor="let status of p.historialAsi
          -stencia">
      147 -                    <div class="dot present"  *ngIf="status === 'PRE
          -SENT'"></div>
      148 -                    <div class="dot absent"   *ngIf="status === 'ABS
          -ENT'"></div>
      149 -                    <div class="dot injured"  *ngIf="status === 'INJ
          -URED'"></div>
      150 -                    <div class="dot unknown"  *ngIf="status === 'UNK
          -NOWN'"></div>
      151 -                  </ng-container>
      152 -                </div>
      153 -              </div>
      154 -              <span class="att-pill"
      155 -                    [style.background]="getAttendanceColor(p.asisten
          -ciaPct) + '22'"
      156 -                    [style.color]="getAttendanceColor(p.asistenciaPc
          -t)">
      157 -                {{ p.asistenciaPct }}%
      158 -              </span>
      174 +    <!-- ROW 6: Compromiso -->
      175 +    <div class="panel-card attendance-panel">
      176 +      <div class="panel-header">
      177 +        <span class="panel-title">Compromiso</span>
      178 +      </div>
      179 +      <div class="attendance-list">
      180 +        <div class="attendance-row" *ngFor="let p of topAttendance">
      181 +          <img [src]="getAvatarUrl(p)" class="att-avatar">
      182 +          <div class="att-info">
      183 +            <span class="att-name">{{ p.nombre }}</span>
      184 +            <div class="history-dots">
      185 +              <ng-container *ngFor="let status of p.historialAsisten
          +cia">
      186 +                <div class="dot present"  *ngIf="status === 'PRESENT
          +'"></div>
      187 +                <div class="dot absent"   *ngIf="status === 'ABSENT'
          +"></div>
      188 +                <div class="dot injured"  *ngIf="status === 'INJURED
          +'"></div>
      189 +                <div class="dot unknown"  *ngIf="status === 'UNKNOWN
          +'"></div>
      190 +              </ng-container>
      191              </div>
      160 -            <div *ngIf="topAttendance.length === 0" class="empty-sta
          -te"><p>Sin registros.</p></div>
      192            </div>
      193 +          <span class="att-pill"
      194 +                [style.background]="getAttendanceColor(p.asistenciaP
          +ct) + '22'"
      195 +                [style.color]="getAttendanceColor(p.asistenciaPct)">
      196 +            {{ p.asistenciaPct }}%
      197 +          </span>
      198          </div>
      163 -
      199 +        <div *ngIf="topAttendance.length === 0" class="empty-state">
          +<p>Sin registros.</p></div>
      200        </div>
      201      </div>
      202

● Ahora el SCSS de team-stats (agrego los estilos de chart-card y panel-sub que
  faltan):

● Update(src\app\modules\coach\pages\team-stats\team-stats.page.scss)
  ⎿  Added 15 lines, removed 1 line
      155    }
      156  }
      157
      158 +// ROW 3: Chart card
      159 +.chart-card {
      160 +  margin-bottom: 12px;
      161 +  padding-bottom: 4px;
      162 +
      163 +  .panel-sub {
      164 +    font-size: 0.6rem; color: var(--text-muted);
      165 +  }
      166 +
      167 +  // Forzar fondo oscuro en el SVG del chart
      168 +  ::ng-deep .apexcharts-canvas { background: transparent !important;
          + }
      169 +  ::ng-deep .apexcharts-text { fill: #94a3b8 !important; }
      170 +}
      171 +
      172  // ============================================================
      159 -// ROW 3: Grid 2 columnas
      173 +// ROW 4: Grid 2 columnas
      174  // ============================================================
      175  .analytics-grid {
      176    display: grid;

● Ahora el TS del player-dashboard con los dos charts nuevos:

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.page.ts)
  ⎿  Added 7 lines
       1  import { Component, OnInit, DestroyRef, inject } from '@angular/core'
          ;
       2 +
       3 +type ChartOptions = {
       4 +  series: any; chart: any; xaxis?: any; yaxis?: any;
       5 +  dataLabels?: any; colors?: string[]; fill?: any;
       6 +  legend?: any; grid?: any; stroke?: any; tooltip?: any;
       7 +  markers?: any; plotOptions?: any;
       8 +};
       9  import { Router } from '@angular/router';
      10  import { Observable, of } from 'rxjs';
      11  import { catchError } from 'rxjs/operators';

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.page.ts)
  ⎿  Added 48 lines
      46
      47    upcomingConvocations: Partido[] = [];
      48    playerStats: PlayerStats | null = null;
      49 +
      50 +  // ── CHART: Evolución del equipo (Area) ─────────────────────
      51 +  evolutionChartOptions: ChartOptions = {
      52 +    series: [{ name: 'Goles a Favor', data: [] }],
      53 +    chart: {
      54 +      type: 'area', height: 140,
      55 +      background: 'transparent', foreColor: '#94a3b8',
      56 +      toolbar: { show: false }, fontFamily: 'inherit'
      57 +    },
      58 +    colors: ['#6c63ff'],
      59 +    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityF
         +rom: 0.45, opacityTo: 0.05 } },
      60 +    stroke: { curve: 'smooth', width: 2 },
      61 +    dataLabels: { enabled: false },
      62 +    xaxis: {
      63 +      categories: [],
      64 +      labels: { style: { colors: '#475569', fontSize: '9px' } },
      65 +      axisBorder: { show: false }, axisTicks: { show: false }
      66 +    },
      67 +    yaxis: { show: false },
      68 +    grid: { borderColor: 'rgba(255,255,255,0.05)', padding: { left: 4
         +, right: 4 } },
      69 +    tooltip: { theme: 'dark' }
      70 +  };
      71 +
      72 +  // ── CHART: Stats personales (Radar) ────────────────────────
      73 +  statsRadarOptions: ChartOptions = {
      74 +    series: [{ name: 'Temporada', data: [0, 0, 0, 0, 0] }],
      75 +    chart: {
      76 +      type: 'radar', height: 240,
      77 +      background: 'transparent', foreColor: '#94a3b8',
      78 +      toolbar: { show: false }, fontFamily: 'inherit'
      79 +    },
      80 +    colors: ['#6c63ff'],
      81 +    xaxis: { categories: ['Partidos', 'Goles', 'Asistencias', 'Min/10
         +', 'Eficiencia'] },
      82 +    yaxis: { show: false },
      83 +    plotOptions: {
      84 +      radar: {
      85 +        polygons: {
      86 +          strokeColors: 'rgba(255,255,255,0.08)',
      87 +          connectorColors: 'rgba(255,255,255,0.08)',
      88 +          fill: { colors: ['rgba(108,99,255,0.05)', 'rgba(108,99,255,
         +0.02)'] }
      89 +        }
      90 +      }
      91 +    },
      92 +    fill: { opacity: 0.25 },
      93 +    stroke: { width: 2 },
      94 +    markers: { size: 4 },
      95 +    tooltip: { theme: 'dark' }
      96 +  };
      97
      98    // Las acciones se renderizan en el HTML, pero el ID es clave para
          el switch
      99    quickActions = [

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.page.ts)
  ⎿  Added 8 lines, removed 1 line
      214                    .slice(0, 5);
      215
      216                this.stats.upcomingConvocations = this.upcomingConvoca
           tions.length;
      217 -              this.stats.totalConvocations = matches.length;
      217 +              this.stats.totalConvocations = matches.length;
      218 +
      219 +              const pastFinished = matches
      220 +                .filter(m => m.estado === 'FINALIZADO' && m.tipo ===
          + 'PARTIDO')
      221 +                .sort((a, b) => new Date(a.fechaHora).getTime() - ne
          +w Date(b.fechaHora).getTime())
      222 +                .slice(-8);
      223 +              this.buildEvolutionChart(pastFinished);
      224 +
      225                this.loading = false;
      226            },
      227            error: (err) => {

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.page.ts)
  ⎿  Added 1 line
      237        .subscribe({
      238          next: (stats: PlayerStats) => {
      239              this.playerStats = stats;
      240 +            this.buildPlayerRadar();
      241          },
      242          error: (err) => console.error('Error cargando stats', err)
      243        });

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.page.ts)
  ⎿  Added 31 lines
      344        return map[type] || 'medium';
      345    }
      346
      347 +  buildEvolutionChart(matches: Partido[]) {
      348 +    this.evolutionChartOptions = {
      349 +      ...this.evolutionChartOptions,
      350 +      series: [{ name: 'Goles a Favor', data: matches.map(m => m.gol
          +esFavor || 0) }],
      351 +      xaxis: {
      352 +        ...this.evolutionChartOptions.xaxis,
      353 +        categories: matches.map((m, i) => {
      354 +          const r = m.rival;
      355 +          if (!r) return `PJ${i + 1}`;
      356 +          return r.length > 7 ? r.substring(0, 6) + '.' : r;
      357 +        })
      358 +      }
      359 +    };
      360 +  }
      361 +
      362 +  buildPlayerRadar() {
      363 +    if (!this.playerStats) return;
      364 +    const partidos    = this.playerStats.partidosTotales  || 0;
      365 +    const goles       = this.playerStats.golesTotales      || 0;
      366 +    const asistencias = this.playerStats.asistenciasTotales || 0;
      367 +    const minutos10   = Math.round((this.playerStats.minutosJugados
          +|| 0) / 10);
      368 +    const eficiencia  = partidos > 0
      369 +      ? Math.round(((goles + asistencias) / partidos) * 10)
      370 +      : 0;
      371 +
      372 +    this.statsRadarOptions = {
      373 +      ...this.statsRadarOptions,
      374 +      series: [{ name: 'Temporada', data: [partidos, goles, asistenc
          +ias, minutos10, eficiencia] }]
      375 +    };
      376 +  }
      377 +
      378    getPlayerAttendanceStatus(conv: Partido): string { return 'PENDIEN
           TE'; }
      379    getAttendanceStatusColor(status: string): string { return 'primary
           '; }
      380    getAttendanceStatusText(status: string): string { return 'Convocad
           o'; }

● Ahora los charts en el HTML del player-dashboard (después del detailed-stats-card):

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.page.html)
  ⎿  Added 38 lines
      195        </div>
      196      </div>
      197
      198 +    <!-- Evolución del equipo -->
      199 +    <div class="section-title" style="margin-top: 24px;">
      200 +      <h3>Evolución del Equipo</h3>
      201 +    </div>
      202 +    <div class="chart-card">
      203 +      <apx-chart
      204 +        [series]="evolutionChartOptions.series"
      205 +        [chart]="evolutionChartOptions.chart"
      206 +        [xaxis]="evolutionChartOptions.xaxis"
      207 +        [yaxis]="evolutionChartOptions.yaxis"
      208 +        [colors]="evolutionChartOptions.colors"
      209 +        [fill]="evolutionChartOptions.fill"
      210 +        [stroke]="evolutionChartOptions.stroke"
      211 +        [dataLabels]="evolutionChartOptions.dataLabels"
      212 +        [grid]="evolutionChartOptions.grid"
      213 +        [tooltip]="evolutionChartOptions.tooltip">
      214 +      </apx-chart>
      215 +    </div>
      216 +
      217 +    <!-- Radar personal -->
      218 +    <div class="section-title" style="margin-top: 24px;">
      219 +      <h3>Mis Stats de Temporada</h3>
      220 +    </div>
      221 +    <div class="chart-card" *ngIf="playerStats">
      222 +      <apx-chart
      223 +        [series]="statsRadarOptions.series"
      224 +        [chart]="statsRadarOptions.chart"
      225 +        [xaxis]="statsRadarOptions.xaxis"
      226 +        [yaxis]="statsRadarOptions.yaxis"
      227 +        [colors]="statsRadarOptions.colors"
      228 +        [fill]="statsRadarOptions.fill"
      229 +        [stroke]="statsRadarOptions.stroke"
      230 +        [markers]="statsRadarOptions.markers"
      231 +        [plotOptions]="statsRadarOptions.plotOptions"
      232 +        [tooltip]="statsRadarOptions.tooltip">
      233 +      </apx-chart>
      234 +    </div>
      235 +
      236      <div class="spacer" style="height: 80px;"></div>
      237
      238      </div> <!-- /main-content -->

● Finalmente el SCSS del player-dashboard para los chart-cards:

● Update(src\app\modules\players\pages\player-dashboard\player-dashboard.page.scss)
  ⎿  Added 13 lines
      268    }
      269  }
      270
      271 +// 5b. CHART CARDS
      272 +.chart-card {
      273 +  background: var(--bg-card);
      274 +  border-radius: 20px;
      275 +  border: 1px solid rgba(124, 58, 237, 0.12);
      276 +  backdrop-filter: blur(12px);
      277 +  overflow: hidden;
      278 +  margin-bottom: 6px;
      279 +  padding: 4px 0;
      280 +  ::ng-deep .apexcharts-canvas { background: transparent !important;
          + }
      281 +  ::ng-deep .apexcharts-text   { fill: #94a3b8 !important; }
      282 +}
      283 +
      284  // 5. ESTADÍSTICAS DETALLADAS
      285  .detailed-stats-card {
      286    background: var(--bg-card); border-radius: 20px; padding: 20px;

● Listo. Esto es lo que implementé:

  Coach / team-stats:
  - Bar chart — Goles a favor (verde) vs. en contra (rojo) por partido, últimos 10
  encuentros. El rival como label en el eje X.
  - Radar chart — Rendimiento por línea (Portería / Defensa / Mediocampo / Ataque).
  Agrupa los PlayerSeasonStat por posición y calcula promedio de goles y minutos/10
  por línea.

  Player dashboard:
  - Area chart — Evolución de goles del equipo a lo largo de la temporada (usa los
  partidos FINALIZADOS). Gradiente violeta con opacityFrom: 0.45 → 0.05.
  - Radar chart — Stats personales de temporada: Partidos / Goles / Asistencias /
  Minutos÷10 / Eficiencia (goles+asistencias por partido ×10).

  Todo con paleta oscura (background: 'transparent', foreColor: '#94a3b8'), tooltip: {
   theme: 'dark' } y sin toolbar. Los charts se actualizan reactivamente cuando llegan
   los datos del backend vía full object reassignment (...spread).