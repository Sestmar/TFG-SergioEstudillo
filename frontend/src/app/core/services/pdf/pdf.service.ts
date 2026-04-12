import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Convocation, Partido, PlayerSeasonStat, LineupSlotDto } from 'src/app/shared/models/models';

@Injectable({ providedIn: 'root' })
export class PdfService {

  private readonly PRIMARY = '#0a0e1a';
  private readonly ACCENT  = '#7c3aed';

  // ─── CONVOCATORIA ────────────────────────────────────────────────────────────

  public async generarConvocatoriaPDF(conv: Convocation): Promise<void> {
    const fecha      = this.formatFecha(conv.fechaHoraInicio);
    const horaInicio = this.formatHora(conv.fechaHoraInicio);
    const horaFin    = this.formatHora(conv.fechaHoraFin);
    const equipo     = conv.equipo?.nombre ?? 'DAM United FC';
    const entrenador = conv.entrenadorPrincipal
      ? `${conv.entrenadorPrincipal.usuario?.nombre ?? ''} ${conv.entrenadorPrincipal.usuario?.apellidos ?? ''}`.trim()
      : '';

    const jugadores = (conv.jugadoresConvocados ?? [])
      .map((jc, i) => {
        const nombre = `${jc.jugador?.usuario?.nombre ?? ''} ${jc.jugador?.usuario?.apellidos ?? ''}`.trim();
        const dorsal = jc.jugador?.dorsal ?? (i + 1);
        return `<tr>
          <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${dorsal}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;">${nombre}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;"></td>
        </tr>`;
      }).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;width:700px;background:#fff;padding:0;color:#111;">
        ${this.cabecera('CONVOCATORIA', equipo)}
        <div style="padding:20px 30px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Tipo</td>
              <td style="padding:6px 0;font-size:13px;font-weight:600;">${conv.tipo ?? ''} — ${conv.titulo ?? ''}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Fecha</td>
              <td style="padding:6px 0;font-size:13px;font-weight:600;">${fecha}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Horario</td>
              <td style="padding:6px 0;font-size:13px;font-weight:600;">${horaInicio} – ${horaFin}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Lugar</td>
              <td style="padding:6px 0;font-size:13px;font-weight:600;">${conv.lugar ?? ''}</td>
            </tr>
          </table>

          <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
            <thead>
              <tr style="background:${this.PRIMARY};color:#fff;">
                <th style="padding:10px;font-size:13px;width:60px;">Dorsal</th>
                <th style="padding:10px;font-size:13px;text-align:left;">Jugador</th>
                <th style="padding:10px;font-size:13px;width:120px;">Firma</th>
              </tr>
            </thead>
            <tbody>${jugadores}</tbody>
          </table>

          <div style="display:flex;justify-content:space-between;margin-top:40px;gap:40px;">
            <div style="flex:1;border-top:2px solid #111;padding-top:8px;font-size:12px;color:#6b7280;text-align:center;">
              Firma Entrenador<br><span style="font-weight:600;color:#111;">${entrenador}</span>
            </div>
            <div style="flex:1;border-top:2px solid #111;padding-top:8px;font-size:12px;color:#6b7280;text-align:center;">
              Firma Delegado
            </div>
          </div>
        </div>
        ${this.pie()}
      </div>`;

    await this.exportar(html, `convocatoria_${fecha.replace(/\//g, '-')}.pdf`);
  }

  // ─── ACTA DE PARTIDO ─────────────────────────────────────────────────────────

  public async generarActaPDF(partido: Partido, lineup: LineupSlotDto[]): Promise<void> {
    const fecha  = this.formatFecha(partido.fechaHora);
    const equipo = partido.equipo?.nombre ?? 'DAM United FC';
    const rival  = partido.rival ?? 'Rival';

    const titulares  = lineup.filter(p => p.esTitular);
    const suplentes  = lineup.filter(p => !p.esTitular);
    const goleadores = lineup.filter(p => (p.goles ?? 0) > 0);
    const amarillas  = lineup.filter(p => (p.tarjetaAmarilla ?? 0) > 0);
    const rojas      = lineup.filter(p => (p.tarjetaRoja ?? 0) > 0);

    const filaJugador = (p: LineupSlotDto) => {
      const nombre = `${p.nombre ?? ''} ${p.apellidos ?? ''}`.trim();
      return `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${p.dorsal ?? '-'}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${nombre}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${p.posicion ?? ''}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${p.minutosJugados ?? p.minutos ?? '-'}'</td>
      </tr>`;
    };

    const seccionGoles = goleadores.length > 0
      ? goleadores.map(p => `<li style="margin:4px 0;font-size:13px;">⚽ ${p.nombre ?? ''} ${p.apellidos ?? ''} (${p.goles} gol${(p.goles ?? 0) > 1 ? 'es' : ''})</li>`).join('')
      : '<li style="font-size:13px;color:#6b7280;">Sin goles registrados</li>';

    const seccionTarjetas = [...amarillas.map(p =>
      `<li style="margin:4px 0;font-size:13px;">🟨 ${p.nombre ?? ''} ${p.apellidos ?? ''}</li>`),
    ...rojas.map(p =>
      `<li style="margin:4px 0;font-size:13px;">🟥 ${p.nombre ?? ''} ${p.apellidos ?? ''}</li>`)
    ].join('') || '<li style="font-size:13px;color:#6b7280;">Sin tarjetas</li>';

    const html = `
      <div style="font-family:Arial,sans-serif;width:700px;background:#fff;padding:0;color:#111;">
        ${this.cabecera('ACTA DE PARTIDO', equipo)}
        <div style="padding:20px 30px;">

          <div style="background:#f9fafb;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
            <div style="font-size:22px;font-weight:700;color:${this.PRIMARY};margin-bottom:6px;">
              ${equipo} <span style="color:${this.ACCENT};margin:0 12px;">${partido.golesFavor ?? 0} – ${partido.golesContra ?? 0}</span> ${rival}
            </div>
            <div style="font-size:13px;color:#6b7280;">${fecha} · ${partido.lugar ?? ''} · ${partido.competicion ?? partido.tipo ?? ''}</div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
            <div>
              <h3 style="font-size:14px;font-weight:700;color:${this.PRIMARY};border-bottom:2px solid ${this.ACCENT};padding-bottom:6px;margin-bottom:12px;">GOLES</h3>
              <ul style="list-style:none;padding:0;margin:0;">${seccionGoles}</ul>
            </div>
            <div>
              <h3 style="font-size:14px;font-weight:700;color:${this.PRIMARY};border-bottom:2px solid ${this.ACCENT};padding-bottom:6px;margin-bottom:12px;">TARJETAS</h3>
              <ul style="list-style:none;padding:0;margin:0;">${seccionTarjetas}</ul>
            </div>
          </div>

          <h3 style="font-size:14px;font-weight:700;color:${this.PRIMARY};border-bottom:2px solid ${this.ACCENT};padding-bottom:6px;margin-bottom:12px;">TITULARES</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead><tr style="background:${this.PRIMARY};color:#fff;">
              <th style="padding:8px 10px;font-size:12px;width:50px;">Dorsal</th>
              <th style="padding:8px 10px;font-size:12px;text-align:left;">Jugador</th>
              <th style="padding:8px 10px;font-size:12px;">Posición</th>
              <th style="padding:8px 10px;font-size:12px;">Minutos</th>
            </tr></thead>
            <tbody>${titulares.map(filaJugador).join('')}</tbody>
          </table>

          ${suplentes.length > 0 ? `
          <h3 style="font-size:14px;font-weight:700;color:${this.PRIMARY};border-bottom:2px solid ${this.ACCENT};padding-bottom:6px;margin-bottom:12px;">SUPLENTES</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead><tr style="background:#6b7280;color:#fff;">
              <th style="padding:8px 10px;font-size:12px;width:50px;">Dorsal</th>
              <th style="padding:8px 10px;font-size:12px;text-align:left;">Jugador</th>
              <th style="padding:8px 10px;font-size:12px;">Posición</th>
              <th style="padding:8px 10px;font-size:12px;">Minutos</th>
            </tr></thead>
            <tbody>${suplentes.map(filaJugador).join('')}</tbody>
          </table>` : ''}

          <div style="display:flex;justify-content:space-between;margin-top:40px;gap:40px;">
            <div style="flex:1;border-top:2px solid #111;padding-top:8px;font-size:12px;color:#6b7280;text-align:center;">Firma Entrenador</div>
            <div style="flex:1;border-top:2px solid #111;padding-top:8px;font-size:12px;color:#6b7280;text-align:center;">Firma Delegado</div>
            <div style="flex:1;border-top:2px solid #111;padding-top:8px;font-size:12px;color:#6b7280;text-align:center;">Firma Árbitro</div>
          </div>
        </div>
        ${this.pie()}
      </div>`;

    await this.exportar(html, `acta_${equipo.replace(/ /g, '_')}_${fecha.replace(/\//g, '-')}.pdf`);
  }

  // ─── ESTADÍSTICAS ─────────────────────────────────────────────────────────────

  public async generarEstadisticasPDF(jugadores: PlayerSeasonStat[], equipoNombre: string): Promise<void> {
    const totalGoles = jugadores.reduce((s, j) => s + (j.golesTemporada ?? j.goles ?? 0), 0);
    const totalMin   = jugadores.reduce((s, j) => s + (j.minutos ?? 0), 0);

    const filas = jugadores.map((j, i) => {
      const nombre  = `${j.nombre ?? ''} ${j.apellidos ?? ''}`.trim();
      const goles   = j.golesTemporada ?? j.goles ?? 0;
      const asist   = j.asistencias ?? 0;
      const minutos = j.minutos ?? 0;
      const asistPct = j.asistenciaPct != null ? `${Math.round(j.asistenciaPct)}%` : '-';
      const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
      return `<tr style="background:${bg};">
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${j.dorsal ?? '-'}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;">${nombre}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${j.posicion ?? '-'}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${goles}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${asist}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${minutos}'</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${asistPct}</td>
      </tr>`;
    }).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;width:700px;background:#fff;padding:0;color:#111;">
        ${this.cabecera('ESTADÍSTICAS DE TEMPORADA', equipoNombre)}
        <div style="padding:20px 30px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
            <div style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:${this.ACCENT};">${totalGoles}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px;">Goles totales</div>
            </div>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:${this.ACCENT};">${jugadores.length}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px;">Jugadores</div>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:${this.PRIMARY};color:#fff;">
                <th style="padding:10px;font-size:12px;width:50px;">#</th>
                <th style="padding:10px;font-size:12px;text-align:left;">Jugador</th>
                <th style="padding:10px;font-size:12px;">Pos.</th>
                <th style="padding:10px;font-size:12px;">Goles</th>
                <th style="padding:10px;font-size:12px;">Asist.</th>
                <th style="padding:10px;font-size:12px;">Min.</th>
                <th style="padding:10px;font-size:12px;">Asist. %</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
            <tfoot>
              <tr style="background:#f3f4f6;font-weight:700;">
                <td colspan="3" style="padding:10px;font-size:13px;">TOTAL EQUIPO</td>
                <td style="padding:10px;font-size:13px;text-align:center;">${totalGoles}</td>
                <td style="padding:10px;font-size:13px;text-align:center;">-</td>
                <td style="padding:10px;font-size:13px;text-align:center;">${totalMin}'</td>
                <td style="padding:10px;font-size:13px;text-align:center;">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${this.pie()}
      </div>`;

    const hoy = new Date().toLocaleDateString('es-ES');
    await this.exportar(html, `estadisticas_${equipoNombre.replace(/ /g, '_')}_${hoy.replace(/\//g, '-')}.pdf`);
  }

  // ─── FICHA DE PARTIDO (PRESS KIT) ────────────────────────────────────────────

  public async generarMatchCardPDF(partido: Partido, lineup: LineupSlotDto[]): Promise<void> {
    const fecha  = this.formatFecha(partido.fechaHora);
    const hora   = this.formatHora(partido.fechaHora);
    const equipo = partido.equipo?.nombre ?? 'DAM United FC';
    const rival  = partido.rival ?? 'Rival';
    const gf     = partido.golesFavor  ?? 0;
    const gc     = partido.golesContra ?? 0;

    const resultado  = gf > gc ? 'VICTORIA' : gf === gc ? 'EMPATE' : 'DERROTA';
    const colorRes   = gf > gc ? '#22c55e'  : gf === gc ? '#eab308' : '#ef4444';

    const goleadores = lineup
      .filter(p => (p.goles ?? 0) > 0)
      .sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0))
      .map(p => {
        const nombre = `${p.nombre ?? ''} ${p.apellidos ?? ''}`.trim();
        return `<li style="margin:4px 0;font-size:13px;">⚽ ${nombre} (${p.goles})</li>`;
      }).join('') || '<li style="font-size:13px;color:#6b7280;">Sin goles registrados</li>';

    const asistentes = lineup
      .filter(p => (p.asistencias ?? 0) > 0)
      .map(p => {
        const nombre = `${p.nombre ?? ''} ${p.apellidos ?? ''}`.trim();
        return `<li style="margin:4px 0;font-size:13px;">🎯 ${nombre} (${p.asistencias})</li>`;
      }).join('') || '<li style="font-size:13px;color:#6b7280;">Sin asistencias</li>';

    const amarillas = lineup.filter(p => (p.tarjetaAmarilla ?? 0) > 0);
    const rojas     = lineup.filter(p => (p.tarjetaRoja    ?? 0) > 0);
    const tarjetas  = [
      ...amarillas.map(p => `<li style="margin:4px 0;font-size:13px;">🟨 ${p.nombre ?? ''} ${p.apellidos ?? ''}</li>`),
      ...rojas.map(p    => `<li style="margin:4px 0;font-size:13px;">🟥 ${p.nombre ?? ''} ${p.apellidos ?? ''}</li>`)
    ].join('') || '<li style="font-size:13px;color:#6b7280;">Sin tarjetas</li>';

    const statsRow = (label: string, value: string | number) =>
      `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;">${label}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;text-align:right;">${value}</td>
      </tr>`;

    const html = `
      <div style="font-family:Arial,sans-serif;width:700px;background:#fff;padding:0;color:#111;">
        ${this.cabecera('FICHA DE PARTIDO', equipo)}

        <div style="padding:24px 30px 0;">

          <!-- RESULTADO DESTACADO -->
          <div style="background:#0a0e1a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;letter-spacing:2px;color:#a78bfa;text-transform:uppercase;margin-bottom:8px;">
              ${partido.competicion ?? 'Partido Oficial'}
            </div>
            <div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:4px;margin-bottom:4px;">
              ${gf} – ${gc}
            </div>
            <div style="font-size:13px;color:#94a3b8;margin-bottom:12px;">
              ${equipo} vs ${rival}
            </div>
            <div style="display:inline-block;background:${colorRes};color:#fff;font-size:11px;font-weight:800;
                        letter-spacing:2px;padding:4px 14px;border-radius:6px;">
              ${resultado}
            </div>
          </div>

          <!-- METADATA -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f9fafb;border-radius:8px;overflow:hidden;">
            ${statsRow('Fecha', fecha)}
            ${statsRow('Hora', hora)}
            ${statsRow('Lugar', partido.lugar ?? '—')}
            ${statsRow('Goles a favor', gf)}
            ${statsRow('Goles en contra', gc)}
            ${statsRow('Amarillas', amarillas.length)}
            ${statsRow('Rojas', rojas.length)}
          </table>

          <!-- GOLES Y ASISTENCIAS -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
            <div>
              <h3 style="font-size:13px;font-weight:700;color:#0a0e1a;border-bottom:2px solid ${this.ACCENT};
                         padding-bottom:6px;margin-bottom:12px;">GOLES</h3>
              <ul style="list-style:none;padding:0;margin:0;">${goleadores}</ul>
            </div>
            <div>
              <h3 style="font-size:13px;font-weight:700;color:#0a0e1a;border-bottom:2px solid ${this.ACCENT};
                         padding-bottom:6px;margin-bottom:12px;">ASISTENCIAS</h3>
              <ul style="list-style:none;padding:0;margin:0;">${asistentes}</ul>
            </div>
          </div>

          <!-- TARJETAS -->
          <div style="margin-bottom:24px;">
            <h3 style="font-size:13px;font-weight:700;color:#0a0e1a;border-bottom:2px solid ${this.ACCENT};
                       padding-bottom:6px;margin-bottom:12px;">DISCIPLINA</h3>
            <ul style="list-style:none;padding:0;margin:0;">${tarjetas}</ul>
          </div>

        </div>
        ${this.pie()}
      </div>`;

    await this.exportar(html, `ficha_partido_${rival.replace(/ /g, '_')}_${fecha.replace(/\//g, '-')}.pdf`);
  }

  // ─── ESTRATEGIA TÁCTICA ──────────────────────────────────────────────────────

  public async generarEstrategiaPDF(
    pitchElement: HTMLElement,
    metadata: { teamName: string; phase: string; rival: string }
  ): Promise<void> {
    const pitchCanvas = await html2canvas(pitchElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#1a5c2e'
    });

    const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    // ── Cabecera ────────────────────────────────────────────────────────────────
    const headerH = 28;
    pdf.setFillColor(10, 14, 26);
    pdf.rect(0, 0, pdfW, headerH, 'F');

    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORME TÁCTICO PROFESIONAL', 12, 13);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(167, 139, 250);
    pdf.text('DAM United FC', 12, 20);

    pdf.setTextColor(209, 213, 219);
    const vsText = metadata.rival ? `${metadata.teamName}  vs  ${metadata.rival}` : metadata.teamName;
    pdf.text(vsText, 12, 26);

    // Línea separadora ACCENT
    pdf.setDrawColor(124, 58, 237);
    pdf.setLineWidth(0.8);
    pdf.line(0, headerH, pdfW, headerH);

    // ── Pie ─────────────────────────────────────────────────────────────────────
    const footerH = 12;
    const footerY = pdfH - footerH;
    pdf.setFillColor(243, 244, 246);
    pdf.rect(0, footerY, pdfW, footerH, 'F');

    const hoy       = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const phaseName = metadata.phase === 'attack' ? 'FASE ATAQUE' : 'FASE DEFENSA';

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(156, 163, 175);
    pdf.text('DAM United FC', 10, footerY + 7);
    pdf.text(phaseName, pdfW / 2, footerY + 7, { align: 'center' });
    pdf.text(`Exportado el ${hoy}`, pdfW - 10, footerY + 7, { align: 'right' });

    // ── Imagen del campo ─────────────────────────────────────────────────────────
    const contentY   = headerH + 6;
    const contentH   = footerY - contentY - 6;
    const pitchRatio = pitchCanvas.width / pitchCanvas.height;
    const availW     = pdfW - 20;

    let imgW = availW;
    let imgH = imgW / pitchRatio;
    if (imgH > contentH) { imgH = contentH; imgW = imgH * pitchRatio; }

    const imgX = (pdfW - imgW) / 2;
    const imgY = contentY + (contentH - imgH) / 2;

    pdf.addImage(pitchCanvas.toDataURL('image/png'), 'PNG', imgX, imgY, imgW, imgH);

    const fecha = hoy.replace(/\//g, '-');
    pdf.save(`tactica_${phaseName.toLowerCase().replace(' ', '_')}_${fecha}.pdf`);
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────────

  private cabecera(titulo: string, subtitulo: string): string {
    const logoUrl = `${window.location.origin}/assets/img/mi-club-logo.png`;
    return `
      <div style="background:${this.PRIMARY};color:#fff;padding:24px 30px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:11px;letter-spacing:2px;color:#a78bfa;text-transform:uppercase;margin-bottom:4px;">DAM United FC</div>
          <div style="font-size:22px;font-weight:700;">${titulo}</div>
          <div style="font-size:14px;color:#d1d5db;margin-top:4px;">${subtitulo}</div>
        </div>
        <img src="${logoUrl}" style="width:54px;height:54px;object-fit:contain;border-radius:50%;background:${this.ACCENT};padding:4px;" crossorigin="anonymous">
      </div>`;
  }

  private pie(): string {
    const hoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `
      <div style="background:#f3f4f6;padding:10px 30px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#9ca3af;">
        <span>DAM United FC</span>
        <span>Documento generado el ${hoy}</span>
      </div>`;
  }

  private formatFecha(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private formatHora(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  private async exportar(html: string, filename: string): Promise<void> {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData  = canvas.toDataURL('image/png');
      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW     = pdf.internal.pageSize.getWidth();
      const pdfH     = pdf.internal.pageSize.getHeight();
      const imgW     = pdfW;
      const imgH     = (canvas.height * pdfW) / canvas.width;

      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
      } else {
        // Contenido largo: paginar
        let yOffset = 0;
        while (yOffset < canvas.height) {
          const sliceH   = Math.min(canvas.height - yOffset, (pdfH * canvas.width) / pdfW);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width  = canvas.width;
          sliceCanvas.height = sliceH;
          sliceCanvas.getContext('2d')!.drawImage(canvas, 0, -yOffset);
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, (sliceH * pdfW) / canvas.width);
          yOffset += sliceH;
          if (yOffset < canvas.height) pdf.addPage();
        }
      }

      pdf.save(filename);
    } finally {
      document.body.removeChild(container);
    }
  }
}
