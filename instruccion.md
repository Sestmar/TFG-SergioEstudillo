# Plan de Implementación: Motor de Reportes PDF

## Contexto
La app ya tiene los datos y las páginas. El objetivo es añadir generación de PDF
puramente en el frontend (sin tocar el backend) para tres documentos:
1. **Convocatoria** — desde `convocation-details.page`
2. **Acta de partido** — desde `match-detail.page` (solo partidos FINALIZADOS)
3. **Estadísticas del equipo** — desde `team-stats.page`

---

## Decisión técnica: librería

**Elegida: `jsPDF` + `html2canvas`**

- `jsPDF`: genera el PDF con texto y formas programáticamente
- `html2canvas`: captura un bloque HTML/CSS como imagen y lo incrusta en el PDF

**¿Por qué no solo `html2canvas`?**
Porque Ionic usa Shadow DOM y variables CSS que `html2canvas` no renderiza bien.
La estrategia es: construir una plantilla HTML limpia (sin Ionic) dentro de un div
oculto en el DOM, capturarla con `html2canvas`, e incrustarla en el PDF con `jsPDF`.

**¿Por qué no `pdfmake`?**
`jsPDF` + `html2canvas` permite reutilizar estilos CSS propios del club (colores, fuentes)
sin tener que redefinir todo en un DSL de pdfmake.

---

## Punto 1 — Instalación de dependencias

En `frontend/`:
```bash
npm install jspdf html2canvas --legacy-peer-deps
```

---

## Punto 2 — Crear PdfService

**Ruta:** `frontend/src/app/core/services/pdf/pdf.service.ts`

El servicio expone tres métodos públicos:
- `generarConvocatoriaPDF(convocatoria, equipo): Promise<void>`
- `generarActaPartidoPDF(partido, incidencias): Promise<void>`
- `generarEstadisticasPDF(stats, equipo): Promise<void>`

Cada método:
1. Crea un div oculto fuera del viewport (position: fixed; left: -9999px)
2. Inyecta HTML limpio con los datos
3. Llama a html2canvas(div) para obtener el canvas
4. Crea un jsPDF en formato A4
5. Incrusta la imagen del canvas
6. Llama a pdf.save('nombre-archivo.pdf')
7. Elimina el div del DOM

**Estética de los PDFs:**
- Cabecera: fondo oscuro #0a0e1a, texto blanco
- Cuerpo: fondo blanco, texto negro, tabla con bordes finos
- Pie de página: "DAM United FC — Documento generado el DD/MM/YYYY"
- Tipografía: Arial/sans-serif

---

## Punto 3 — Convocatoria PDF

**Página:** `modules/coach/pages/convocations/convocation-details/convocation-details.page.ts`

**Contenido del PDF:**
- Cabecera: DAM UNITED FC — CONVOCATORIA
- Partido: [Equipo] vs [Rival], Fecha: DD/MM/YYYY
- Tabla: Nº | Jugador | Firma (columna en blanco para firmar físicamente)
- Pie: Firma Entrenador con línea en blanco

**UI:** Botón "Descargar PDF" (icono document-outline) en la cabecera.

---

## Punto 4 — Acta de Partido PDF

**Página:** `modules/match-detail/match-detail.page.ts`

**Condición:** botón solo visible si `partido.estado === 'FINALIZADO'`

**Contenido del PDF:**
- Resultado: [Local] X - X [Visitante], Fecha
- Sección Goles: minuto y autor
- Sección Alineación titular
- Sección Incidencias (tarjetas, etc.)
- Pie: Firma delegado con línea en blanco

---

## Punto 5 — Estadísticas del Equipo PDF

**Página:** `modules/coach/pages/team-stats/team-stats.page.ts`

**Contenido del PDF:**
- Tabla: Jugador | PJ | Goles | Asistencias | TA | TR
- Fila de totales al final

**UI:** Botón "Exportar PDF" en la cabecera.

---

## Punto 6 — Documentación

- `futuras-mejoras.md`: marcar Motor de Reportes PDF como [x]
- `README.md`: añadir nota en sección de funcionalidades

---

## Archivos que se tocan

| Archivo | Cambio |
|---|---|
| `package.json` | +jspdf +html2canvas |
| `core/services/pdf/pdf.service.ts` | NUEVO |
| `convocation-details.page.ts/.html` | Botón + llamada al servicio |
| `match-detail.page.ts/.html` | Botón + llamada al servicio |
| `team-stats.page.ts/.html` | Botón + llamada al servicio |
| `futuras-mejoras.md` | PDF [x] |

**Backend: no se toca nada.**
