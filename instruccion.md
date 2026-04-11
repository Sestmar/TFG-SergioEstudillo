Voy directo. Primero verifico el models del frontend para
  no duplicar tipos:

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● No existe. Lo añado al models y creo el componente
  completo:

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Update(src\app\shared\models\models.ts)
  ⎿  Added 13 lines
      474    partidos: PlayerHistoryPartido[];
      475    convocatorias: PlayerHistoryConvocatoria
           [];
      476    incidencias: PlayerHistoryIncidencia[];
      477 +}
      478 +
      479 +export interface SeasonStats {
      480 +  pj: number;
      481 +  g: number;
      482 +  e: number;
      483 +  p: number;
      484 +  gf: number;
      485 +  gc: number;
      486 +  puntos: number;
      487 +  puntosObjetivo: number | null;
      488 +  categoriaNombre: string | null;
      489 +  racha: string[];
      490  }
      491   No newline at end of file

● Ahora los tres archivos del componente en paralelo:

● Bash(mkdir -p "/c/Users/Usuario/Documents/2DAM/TFG-SergioE
      studillo/TFG-SergioEstudillo/frontend/src/app/shared/c
      omponents/season-stats-widget")
  ⎿  Done

● Write(src\app\shared\components\season-stats-widget\season
       -stats-widget.component.ts)
  ⎿  Wrote 32 lines to ..\..\..\..\..\..\..\c\Users\Usu
     ario\Documents\2DAM\TFG-SergioEstudillo\TFG-Sergio
     Estudillo\frontend\src\app\shared\components\seaso
     n-stats-widget\season-stats-widget.component.ts
       1 import { Component, Input } from '@angular/c
         ore';
       2 import { CommonModule } from '@angular/commo
         n';
       3 import { IonicModule } from '@ionic/angular'
         ;
       4 import { SeasonStats } from 'src/app/shared/
         models/models';
       5
       6 @Component({
       7   selector: 'app-season-stats-widget',
       8   standalone: true,
       9   imports: [CommonModule, IonicModule],
      10   templateUrl: './season-stats-widget.compon
         ent.html',
     … +22 lines (ctrl+o to expand)

● Write(src\app\shared\components\season-stats-widget\season
       -stats-widget.component.html)
  ⎿  Wrote 72 lines to ..\..\..\..\..\..\..\c\Users\Usu
     ario\Documents\2DAM\TFG-SergioEstudillo\TFG-Sergio
     Estudillo\frontend\src\app\shared\components\seaso
     n-stats-widget\season-stats-widget.component.html
       1 <div class="season-widget" *ngIf="stats">
       2
       3   <!-- CABECERA: categoría -->
       4   <div class="widget-header">
       5     <div class="category-badge">
       6       <ion-icon name="trophy-outline"></ion-
         icon>
       7       <span>{{ stats.categoriaNombre || 'Lig
         a' }}</span>
       8     </div>
       9     <span class="puntos-total">{{ stats.punt
         os }} pts</span>
      10   </div>
     … +62 lines (ctrl+o to expand)

● Write(src\app\shared\components\season-stats-widget\season
       -stats-widget.component.scss)
  ⎿  Wrote 157 lines to ..\..\..\..\..\..\..\c\Users\Us
     uario\Documents\2DAM\TFG-SergioEstudillo\TFG-Sergi
     oEstudillo\frontend\src\app\shared\components\seas
     on-stats-widget\season-stats-widget.component.scss
       1 .season-widget {
       2   background: rgba(15, 22, 45, 0.75);
       3   border: 1px solid rgba(124, 58, 237, 0.2);
       4   border-radius: 16px;
       5   padding: 16px;
       6   backdrop-filter: blur(12px);
       7   margin: 12px 0;
       8
       9   // ── Cabecera ───────────────────────────
         ─────────────────────────────────────
      10   .widget-header {
     … +147 lines (ctrl+o to expand)

● Paso 4 ✅ — SeasonStatsWidgetComponent

  Componente standalone creado en
  shared/components/season-stats-widget/. Lo que renderiza:

  Cabecera — badge con categoriaNombre (Primera Andaluza,
  etc.) + puntos totales en grande. Primera vez que ese
  campo tiene peso visual real en la app.

  Tabla stats — 7 celdas: PJ · G (verde) · E (amarillo) · P
  (rojo) · GF · GC · DIF (verde si positiva, roja si
  negativa).

  Racha — 5 círculos con borde de color: verde=V ·
  amarillo=E · rojo=D. Aparece solo si hay datos.

  Barra de objetivo — ion-progress-bar con gradiente púrpura
   → lila. Se muestra solo si el admin ha configurado
  puntosObjetivo. Cuando llega a 1 cambia a color="success".

  Todo glassmorphism Night Stadium: backdrop-filter:
  blur(12px) + borde rgba(124,58,237,0.2).

  ---
  ¿OK para el Paso 5 — integración en el Coach Dashboard?