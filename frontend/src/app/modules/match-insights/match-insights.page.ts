import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Partido, LineupSlotDto, SeasonStats } from 'src/app/shared/models/models';
import { MatchService } from 'src/app/core/services/match/match.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { PdfService } from 'src/app/core/services/pdf/pdf.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-match-insights',
  templateUrl: './match-insights.page.html',
  styleUrls: ['./match-insights.page.scss']
})
export class MatchInsightsPage {

  loading = true;
  generandoPdf = false;

  match: Partido | null = null;
  lineup: LineupSlotDto[] = [];
  seasonStats: SeasonStats | null = null;

  radarMatch: number[] = [];
  radarAvg:   number[] = [];

  // Stats calculadas de este partido (desde lineup)
  golesPartido    = 0;
  asistPartido    = 0;
  amPartido       = 0;
  rojPartido      = 0;
  cleanSheetMatch = false;

  // ─── DISPLAY VALUES (animated counters) ──────────────────────────────────────
  displayGoles    = 0;
  displayAsist    = 0;
  displayTarjetas = 0;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private matchSvc: MatchService,
    private coachSvc: CoachService,
    private pdfService: PdfService
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  private async loadData() {
    this.loading = true;
    try {
      const matchId = Number(this.route.snapshot.paramMap.get('id'));
      if (!matchId) return;

      // El partido es crítico — falla duro si no existe
      this.match = await firstValueFrom(this.matchSvc.getMatchById(matchId));

      // La alineación y las stats de temporada son opcionales — degradación elegante
      const [lineup, seasonStats] = await Promise.allSettled([
        firstValueFrom(this.matchSvc.getLineup(matchId)),
        this.match.idEquipo ?? this.match.equipo?.idEquipo ?? this.match.equipo?.id
          ? firstValueFrom(this.coachSvc.getSeasonStats(
              (this.match.idEquipo ?? this.match.equipo?.idEquipo ?? this.match.equipo?.id)!
            ))
          : Promise.resolve(null)
      ]);

      this.lineup      = lineup.status      === 'fulfilled' ? (lineup.value      ?? []) : [];
      this.seasonStats = seasonStats.status === 'fulfilled' ? seasonStats.value         : null;

      this.calcMatchStats();
      this.buildRadar();
      this.runCounterAnimations();
    } finally {
      this.loading = false;
    }
  }

  private calcMatchStats() {
    this.golesPartido    = this.match?.golesFavor  ?? 0;
    this.cleanSheetMatch = (this.match?.golesContra ?? 0) === 0;

    this.asistPartido = this.lineup.reduce((s, p) => s + (p.asistencias ?? 0), 0);
    this.amPartido    = this.lineup.filter(p => (p.tarjetaAmarilla ?? 0) > 0).length;
    this.rojPartido   = this.lineup.filter(p => (p.tarjetaRoja    ?? 0) > 0).length;
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
    this.animateCounter(this.golesPartido,                  600, v => this.displayGoles    = v);
    this.animateCounter(this.asistPartido,                  700, v => this.displayAsist    = v);
    this.animateCounter(this.amPartido + this.rojPartido,   800, v => this.displayTarjetas = v);
  }

  // ─── RADAR ───────────────────────────────────────────────────────────────────

  private buildRadar() {
    if (!this.seasonStats) return;

    const s  = this.seasonStats;
    const sn = (n: any): number => { const v = Number(n); return isFinite(v) ? v : 0; };
    const pj = Math.max(1, sn(s?.pj));
    const safe = (arr: number[]) => arr.map(v => isFinite(v) ? v : 0);

    this.radarMatch = safe([
      Math.min(100, sn(this.golesPartido) * 25),
      this.cleanSheetMatch ? 100 : 0,
      Math.max(0, 100 - sn(this.amPartido) * 20 - sn(this.rojPartido) * 40),
      Math.min(100, sn(this.asistPartido) * 25)
    ]);

    this.radarAvg = safe([
      Math.min(100, Math.round(sn(s.promedioGolesFavor) * 25)),
      Math.min(100, Math.round((sn(s.cleanSheets) / pj) * 100)),
      Math.max(0,   Math.round(100 - (sn(s.tarjetasAmarillasTotal) / pj) * 20
                                   - (sn(s.tarjetasRojasTotal)     / pj) * 40)),
      Math.min(100, Math.round((sn(s.asistenciasTotal) / pj) * 25))
    ]);
  }

  // Convierte un array de valores 0-100 en polygon points SVG para 4 ejes
  radarPoints(data: number[]): string {
    const cx = 150, cy = 150, r = 100, n = data.length;
    return data.map((v, i) => {
      const angle = (2 * Math.PI * i / n) - Math.PI / 2;
      const x = cx + r * (v / 100) * Math.cos(angle);
      const y = cy + r * (v / 100) * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  // ─── GETTERS ─────────────────────────────────────────────────────────────────

  get resultado(): 'victoria' | 'empate' | 'derrota' | null {
    if (!this.match) return null;
    if (this.match.golesFavor > this.match.golesContra) return 'victoria';
    if (this.match.golesFavor === this.match.golesContra) return 'empate';
    return 'derrota';
  }

  get goleadores(): LineupSlotDto[] {
    return this.lineup.filter(p => (p.goles ?? 0) > 0)
                      .sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0));
  }

  get tarjetas(): LineupSlotDto[] {
    return this.lineup.filter(p => (p.tarjetaAmarilla ?? 0) > 0 || (p.tarjetaRoja ?? 0) > 0);
  }

  goBack() { this.navCtrl.back(); }

  // ─── PRESS KIT ───────────────────────────────────────────────────────────────

  async generarPressKit() {
    if (!this.match || this.generandoPdf) return;
    this.generandoPdf = true;
    try {
      await this.pdfService.generarMatchCardPDF(this.match, this.lineup);
    } finally {
      this.generandoPdf = false;
    }
  }
}
