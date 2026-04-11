Okey, lo que quiero implementar ahora es el nuevo motor
de reportes de PDF en tactics-pro. Mira instruccion.md con
la  instruccion de gemini, analizalo e implementa lo que ya
 funciona en match-detail y coach-stats

  Read 1 file (ctrl+o to expand)

● Bien. Antes de tocar nada, leo el PdfService existente y
  la estructura actual de tactics-pro:

  Read 3 files (ctrl+o to expand)

● Tengo todo lo que necesito. El plan es claro:

  - PdfService: nuevo método generarEstrategiaPDF() que
  captura el elemento live del DOM con html2canvas (distinto
   al patrón hidden-container — aquí capturamos la pizarra
  real)
  - tactics-pro.page.ts: import de PdfService + exportando =
   false + método exportarTactica()
  - tactics-pro.page.html: botón de descarga en el sidebar
  junto a "Guardar"

  Arranco:

● Update(src\app\core\services\pdf\pdf.service.ts)
  ⎿  Added 77 lines
      241      await this.exportar(html, `estadistica
           s_${equipoNombre.replace(/ /g, '_')}_${hoy
           .replace(/\//g, '-')}.pdf`);
      242    }
      243
      244 +  // ─── ESTRATEGIA TÁCTICA ──────────────
          +────────────────────────────────────────
      245 +
      246 +  public async generarEstrategiaPDF(
      247 +    pitchElement: HTMLElement,
      248 +    metadata: { teamName: string; phase: s
          +tring; rival: string }
      249 +  ): Promise<void> {
      250 +    const pitchCanvas = await html2canvas(
          +pitchElement, {
      251 +      scale: 2,
      252 +      useCORS: true,
      253 +      allowTaint: true,
      254 +      logging: false,
      255 +      backgroundColor: '#1a5c2e'
      256 +    });
      257 +
      258 +    const pdf  = new jsPDF({ orientation:
          +'portrait', unit: 'mm', format: 'a4' });
      259 +    const pdfW = pdf.internal.pageSize.get
          +Width();
      260 +    const pdfH = pdf.internal.pageSize.get
          +Height();
      261 +
      262 +    // ── Cabecera ───────────────────────
          +─────────────────────────────────────────
      263 +    const headerH = 28;
      264 +    pdf.setFillColor(10, 14, 26);
      265 +    pdf.rect(0, 0, pdfW, headerH, 'F');
      266 +
      267 +    pdf.setFontSize(16);
      268 +    pdf.setTextColor(255, 255, 255);
      269 +    pdf.setFont('helvetica', 'bold');
      270 +    pdf.text('INFORME TÁCTICO PROFESIONAL'
          +, 12, 13);
      271 +
      272 +    pdf.setFontSize(9);
      273 +    pdf.setFont('helvetica', 'normal');
      274 +    pdf.setTextColor(167, 139, 250);
      275 +    pdf.text('DAM United FC', 12, 20);
      276 +
      277 +    pdf.setTextColor(209, 213, 219);
      278 +    const vsText = metadata.rival ? `${met
          +adata.teamName}  vs  ${metadata.rival}` :
          +metadata.teamName;
      279 +    pdf.text(vsText, 12, 26);
      280 +
      281 +    // Línea separadora ACCENT
      282 +    pdf.setDrawColor(124, 58, 237);
      283 +    pdf.setLineWidth(0.8);
      284 +    pdf.line(0, headerH, pdfW, headerH);
      285 +
      286 +    // ── Pie ────────────────────────────
          +─────────────────────────────────────────
      287 +    const footerH = 12;
      288 +    const footerY = pdfH - footerH;
      289 +    pdf.setFillColor(243, 244, 246);
      290 +    pdf.rect(0, footerY, pdfW, footerH, 'F
          +');
      291 +
      292 +    const hoy       = new Date().toLocaleD
          +ateString('es-ES', { day: '2-digit', month
          +: '2-digit', year: 'numeric' });
      293 +    const phaseName = metadata.phase === '
          +attack' ? 'FASE ATAQUE' : 'FASE DEFENSA';
      294 +
      295 +    pdf.setFontSize(8);
      296 +    pdf.setFont('helvetica', 'normal');
      297 +    pdf.setTextColor(156, 163, 175);
      298 +    pdf.text('DAM United FC', 10, footerY
          ++ 7);
      299 +    pdf.text(phaseName, pdfW / 2, footerY
          ++ 7, { align: 'center' });
      300 +    pdf.text(`Exportado el ${hoy}`, pdfW -
          + 10, footerY + 7, { align: 'right' });
      301 +
      302 +    // ── Imagen del campo ───────────────
          +──────────────────────────────────────────
      303 +    const contentY   = headerH + 6;
      304 +    const contentH   = footerY - contentY
          +- 6;
      305 +    const pitchRatio = pitchCanvas.width /
          + pitchCanvas.height;
      306 +    const availW     = pdfW - 20;
      307 +
      308 +    let imgW = availW;
      309 +    let imgH = imgW / pitchRatio;
      310 +    if (imgH > contentH) { imgH = contentH
          +; imgW = imgH * pitchRatio; }
      311 +
      312 +    const imgX = (pdfW - imgW) / 2;
      313 +    const imgY = contentY + (contentH - im
          +gH) / 2;
      314 +
      315 +    pdf.addImage(pitchCanvas.toDataURL('im
          +age/png'), 'PNG', imgX, imgY, imgW, imgH);
      316 +
      317 +    const fecha = hoy.replace(/\//g, '-');
      318 +    pdf.save(`tactica_${phaseName.toLowerC
          +ase().replace(' ', '_')}_${fecha}.pdf`);
      319 +  }
      320 +
      321    // ─── HELPERS PRIVADOS ────────────────
           ────────────────────────────────────────
      322
      323    private cabecera(titulo: string, subtitu
           lo: string): string {

● Ahora el .ts de tactics-pro:

● Update(src\app\modules\coach\pages\tactics-pro\tactics-pro
        .page.ts)
  ⎿  Added 1 line
       7  import { PlayerService } from 'src/app/core
          /services/player/player.service';
       8  import { MatchService } from 'src/app/core/
          services/match/match.service';
       9  import { NotificationService } from 'src/ap
          p/core/services/notification/notification.s
          ervice';
      10 +import { PdfService } from 'src/app/core/se
         +rvices/pdf/pdf.service';
      11  import { Jugador, Partido, LineupSlotDto, E
          quipoResumen } from 'src/app/shared/models/
          models';
      12
      13  interface FieldPlayer {

● Update(src\app\modules\coach\pages\tactics-pro\tactics-pro
        .page.ts)
  ⎿  Added 1 line
      55    private destroyRef = inject(DestroyRef);
      56
      57    loading = true;
      58 +  exportando = false;
      59    matchId = 0;
      60    matchInfo: Partido | null = null;
      61    currentTeamId: number | null = null;

● Update(src\app\modules\coach\pages\tactics-pro\tactics-pro
        .page.ts)
  ⎿  Added 2 lines, removed 1 line
      91      private route: ActivatedRoute,
      92      private playerSvc: PlayerService,
      93      private matchSvc: MatchService,
      94 -    private notificationSvc: NotificationSe
         -rvice
      94 +    private notificationSvc: NotificationSe
         +rvice,
      95 +    private pdfSvc: PdfService
      96    ) {}
      97
      98    ngOnInit() {

● Ahora añado el método exportarTactica() justo después de
  savePhases():

● Update(src\app\modules\coach\pages\tactics-pro\tactics-pro
        .page.ts)
  ⎿  Added 15 lines
      264      this.notificationSvc.success('Estrateg
           ia guardada 💾');
      265    }
      266
      267 +  async exportarTactica(): Promise<void> {
      268 +    const pitch = document.querySelector('
          +[data-test="pitch-board"]') as HTMLElement
          +;
      269 +    if (!pitch || this.exportando) return;
      270 +    this.exportando = true;
      271 +    try {
      272 +      await this.pdfSvc.generarEstrategiaP
          +DF(pitch, {
      273 +        teamName: (this.matchInfo as any)?
          +.equipo?.nombre ?? 'DAM United FC',
      274 +        phase: this.currentPhase,
      275 +        rival: this.matchInfo?.rival ?? ''
      276 +      });
      277 +    } finally {
      278 +      this.exportando = false;
      279 +    }
      280 +  }
      281 +
      282    private storageKey(): string {
      283      return `tactics-pro-${this.matchId}`;
      284    }

● Por último el botón en el sidebar, junto al de "Guardar":

● Update(src\app\modules\coach\pages\tactics-pro\tactics-pro
        .page.html)
  ⎿  Added 4 lines
      147          <ion-icon name="save-outline"></io
           n-icon>
      148          <span>Guardar</span>
      149        </button>
      150 +      <button class="side-btn" (click)="ex
          +portarTactica()" [disabled]="exportando">
      151 +        <ion-icon [name]="exportando ? 'ho
          +urglass-outline' : 'document-outline'"></i
          +on-icon>
      152 +        <span>{{ exportando ? '...' : 'PDF
          +' }}</span>
      153 +      </button>
      154      </div>
      155
      156    </div>

● Listo. Resumen de lo que cambió:

  ---
  Cambios realizados

  pdf.service.ts — nuevo método generarEstrategiaPDF():
  - Captura el pitch-board live con html2canvas (captura el
  campo tal cual está en pantalla, incluyendo jugadores
  arrastrados, shadow players y trazos del canvas)
  - Genera un PDF A4 en portrait con: cabecera Night Stadium
   (fondo oscuro + texto blanco + línea ACCENT púrpura) +
  imagen del campo centrada + pie con fase y fecha

  tactics-pro.page.ts:
  - Import de PdfService + inyección en constructor
  - exportando = false para prevenir doble clic
  - Método exportarTactica() que localiza el
  [data-test="pitch-board"], pasa los metadatos (equipo,
  fase, rival) y llama al servicio

  tactics-pro.page.html:
  - Botón "PDF" en el sidebar junto a "Guardar" — muestra
  hourglass y se deshabilita mientras se genera el PDF

  El botón sigue exactamente el mismo patrón visual que el
  de "Descargar Acta" en match-detail.